"""Convert the released GuidedSAM-Plume ZIP to a local ImageFolder dataset."""

import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import shutil
import tempfile
import zipfile

from PIL import Image


ROLES = {
    "frames": "image",
    "gt_manual": "manual_mask",
    "gt_GuidedSAM_Plume": "guided_mask",
}


def json_bytes(value):
    return (json.dumps(value, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def sha256_file(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def layout(archive):
    """Reject ambiguous pairs instead of silently dropping or renaming files."""
    sequences = {}
    roots = set()
    names = set()
    for entry in archive.infolist():
        name = entry.filename
        path = PurePosixPath(name)
        if path.is_absolute() or ".." in path.parts or "\\" in name:
            raise ValueError(f"Unsafe archive member: {name}")
        if entry.is_dir():
            continue
        if name in names:
            raise ValueError(f"Duplicate archive member: {name}")
        names.add(name)
        if len(path.parts) != 4:
            raise ValueError(f"Expected dataset/sequence/annotation/file: {name}")
        root, sequence, role, filename = path.parts
        roots.add(root)
        if role not in ROLES or path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            raise ValueError(f"Unsupported archive member: {name}")
        if not path.stem.isascii() or not path.stem.isdigit():
            raise ValueError(f"Expected a numeric frame identifier: {name}")
        frame = int(path.stem)
        files = sequences.setdefault(sequence, {}).setdefault(role, {})
        if frame in files:
            raise ValueError(f"Duplicate frame identifier in {sequence}/{role}: {frame}")
        files[frame] = entry
    if len(roots) != 1 or not sequences:
        raise ValueError("Expected exactly one nonempty dataset root")
    for sequence, roles in sequences.items():
        frames = set(roles.get("frames", {}))
        if not frames:
            raise ValueError(f"No source frames in sequence: {sequence}")
        for role in ROLES:
            ids = set(roles.get(role, {}))
            if frames != ids:
                raise ValueError(
                    f"Unpaired {role} in {sequence}: "
                    f"missing={sorted(frames - ids)}, orphaned={sorted(ids - frames)}"
                )
    return sequences


def image_info(data):
    with Image.open(io.BytesIO(data)) as image:
        image.load()
        extrema = image.getextrema()
        if isinstance(extrema[0], int):
            extrema = [extrema]
        return {
            "sha256": hashlib.sha256(data).hexdigest(),
            "pixels_sha256": hashlib.sha256(image.tobytes()).hexdigest(),
            "width": image.width,
            "height": image.height,
            "mode": image.mode,
            "extrema": [list(pair) for pair in extrema],
            "bytes": len(data),
        }


def records(archive, sequences):
    for sequence in sorted(sequences):
        roles = sequences[sequence]
        for position, frame in enumerate(sorted(roles["frames"])):
            row = {"sequence_id": sequence, "frame_index": frame,
                   "frame_position": position, "source": {}}
            contents = {}
            for role, column in ROLES.items():
                entry = roles[role][frame]
                relative = PurePosixPath(*PurePosixPath(entry.filename).parts[1:]).as_posix()
                data = archive.read(entry)
                info = image_info(data)
                info["archive_member"] = entry.filename
                row["source"][column] = info
                row[column + "_file_name"] = relative
                contents[relative] = data
            dimensions = {(v["width"], v["height"]) for v in row["source"].values()}
            if len(dimensions) != 1:
                raise ValueError(f"Image/mask dimensions differ in {sequence}, frame {frame}")
            yield row, contents


def manifest(archive_sha256, sequences, frames, metadata_sha256):
    return {"format": "GuidedSAM-Plume ImageFolder v1", "archive_sha256": archive_sha256,
            "sequences": len(sequences), "frames": frames, "source_files": frames * 3,
            "metadata_sha256": metadata_sha256, "split": "unsplit"}


def build(source, destination):
    source, destination = Path(source), Path(destination)
    if destination.exists() or destination.is_symlink():
        raise ValueError("Destination already exists; choose a new output directory")
    archive_hash = sha256_file(source)
    with zipfile.ZipFile(source) as archive:
        sequences = layout(archive)
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = Path(tempfile.mkdtemp(prefix=".guidedsam-", dir=destination.parent))
        try:
            digest = hashlib.sha256()
            count = 0
            with (temporary / "metadata.jsonl").open("wb") as metadata:
                for row, files in records(archive, sequences):
                    for relative, data in files.items():
                        target = temporary / relative
                        target.parent.mkdir(parents=True, exist_ok=True)
                        target.write_bytes(data)
                    line = json_bytes(row)
                    metadata.write(line)
                    digest.update(line)
                    count += 1
            result = manifest(archive_hash, sequences, count, digest.hexdigest())
            (temporary / "manifest.json").write_bytes(json_bytes(result))
            if destination.exists() or destination.is_symlink():
                raise ValueError("Destination appeared during conversion; refusing to overwrite it")
            temporary.rename(destination)
        finally:
            if temporary.exists():
                shutil.rmtree(temporary)
    return result


def validate(source, destination):
    """Compare every exported byte and metadata row against the source archive."""
    source, destination = Path(source), Path(destination)
    if destination.is_symlink():
        raise ValueError("Output must be self-contained; symlinks are not supported")
    for path in destination.rglob("*"):
        if path.is_symlink():
            raise ValueError("Output must be self-contained; symlinks are not supported")
    saved_manifest = json.loads((destination / "manifest.json").read_text(encoding="utf-8"))
    expected_files = {"metadata.jsonl", "manifest.json"}
    digest = hashlib.sha256()
    count = 0
    with zipfile.ZipFile(source) as archive, (destination / "metadata.jsonl").open("rb") as metadata:
        sequences = layout(archive)
        for row, files in records(archive, sequences):
            expected_line = json_bytes(row)
            if metadata.readline() != expected_line:
                raise ValueError(f"Metadata differs from the source at row {count}")
            digest.update(expected_line)
            for relative, data in files.items():
                target = destination / relative
                if not target.is_file() or target.read_bytes() != data:
                    raise ValueError(f"Exported file differs from its source: {relative}")
                expected_files.add(relative)
            count += 1
        if metadata.read(1):
            raise ValueError("Metadata has extra rows")
    actual_files = {p.relative_to(destination).as_posix()
                    for p in destination.rglob("*") if p.is_file()}
    if actual_files != expected_files:
        raise ValueError("Output contains missing or unexpected files")
    result = manifest(sha256_file(source), sequences, count, digest.hexdigest())
    if result != saved_manifest:
        raise ValueError("Manifest differs from the verified source and metadata")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["build", "validate"])
    parser.add_argument("archive", type=Path, help="Downloaded source ZIP")
    parser.add_argument("output", type=Path, help="ImageFolder directory")
    args = parser.parse_args()
    try:
        result = {"build": build, "validate": validate}[args.command](args.archive, args.output)
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"{args.command} failed: {error}\n")
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
