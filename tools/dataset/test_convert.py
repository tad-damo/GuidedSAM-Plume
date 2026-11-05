"""Integrity and failure cases using generated images, not released dataset files."""

import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

from PIL import Image

from convert import build, validate


def image_bytes(size=(3, 2), mode="L", format="PNG"):
    image = Image.new(mode, size)
    if mode == "L":
        image.putdata(([0, 127, 255] * (size[0] * size[1]))[:size[0] * size[1]])
    stream = io.BytesIO()
    image.save(stream, format=format)
    return stream.getvalue()


class ConversionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.source = self.root / "source.zip"
        self.output = self.root / "output"
        self.members = {}
        # Numeric order differs from filename order. Preserve JPEG and PNG masks.
        for frame in [10, 2]:
            for role in ["frames", "gt_manual", "gt_GuidedSAM_Plume"]:
                suffix = ".jpg" if role == "gt_GuidedSAM_Plume" else ".png"
                self.members[f"Dataset/sequence + one/{role}/{frame}{suffix}"] = image_bytes(
                    mode="RGB" if role == "frames" else "L",
                    format="JPEG" if suffix == ".jpg" else "PNG",
                )

    def archive(self):
        with zipfile.ZipFile(self.source, "w") as archive:
            for name, data in reversed(list(self.members.items())):
                archive.writestr(name, data)

    def test_round_trip_preserves_bytes_values_and_numeric_order(self):
        self.archive()
        result = build(self.source, self.output)
        self.assertEqual(result["frames"], 2)
        self.assertEqual(validate(self.source, self.output), result)
        rows = [json.loads(line) for line in (self.output / "metadata.jsonl").read_text().splitlines()]
        self.assertEqual([row["frame_index"] for row in rows], [2, 10])
        self.assertEqual([row["frame_position"] for row in rows], [0, 1])
        for name, data in self.members.items():
            self.assertEqual((self.output / name.split("/", 1)[1]).read_bytes(), data)
        with Image.open(self.output / rows[0]["manual_mask_file_name"]) as mask:
            self.assertEqual(set(mask.tobytes()), {0, 127, 255})

    def test_repeat_build_is_identical(self):
        self.archive()
        other = self.root / "other"
        self.assertEqual(build(self.source, self.output), build(self.source, other))
        for path in self.output.rglob("*"):
            if path.is_file():
                self.assertEqual(path.read_bytes(), (other / path.relative_to(self.output)).read_bytes())

    def test_missing_and_orphaned_masks_fail(self):
        self.members.pop("Dataset/sequence + one/gt_manual/2.png")
        self.members["Dataset/sequence + one/gt_manual/3.png"] = image_bytes()
        self.archive()
        with self.assertRaisesRegex(ValueError, "missing=\\[2\\], orphaned=\\[3\\]"):
            build(self.source, self.output)
        self.assertFalse(self.output.exists())

    def test_duplicate_numeric_ids_fail(self):
        self.members["Dataset/sequence + one/frames/02.jpg"] = image_bytes(format="JPEG")
        self.archive()
        with self.assertRaisesRegex(ValueError, "Duplicate frame identifier"):
            build(self.source, self.output)

    def test_unsafe_zip_member_fails(self):
        self.members["Dataset/../escape.png"] = image_bytes()
        self.archive()
        with self.assertRaisesRegex(ValueError, "Unsafe archive member"):
            build(self.source, self.output)
        self.assertFalse((self.root / "escape.png").exists())

    def test_unrecognized_file_is_not_silently_omitted(self):
        self.members["Dataset/sequence + one/frames/notes.txt"] = b"unexpected"
        self.archive()
        with self.assertRaisesRegex(ValueError, "Unsupported archive member"):
            build(self.source, self.output)

    def test_dimension_mismatch_leaves_no_partial_dataset(self):
        self.members["Dataset/sequence + one/gt_manual/2.png"] = image_bytes(size=(2, 2))
        self.archive()
        with self.assertRaisesRegex(ValueError, "dimensions differ"):
            build(self.source, self.output)
        self.assertFalse(self.output.exists())

    def test_corrupt_image_leaves_no_partial_dataset(self):
        self.members["Dataset/sequence + one/gt_manual/2.png"] = b"not an image"
        self.archive()
        with self.assertRaises(OSError):
            build(self.source, self.output)
        self.assertFalse(self.output.exists())

    def test_existing_destination_is_preserved(self):
        self.archive()
        self.output.mkdir()
        marker = self.output / "keep.txt"
        marker.write_text("keep")
        with self.assertRaisesRegex(ValueError, "already exists"):
            build(self.source, self.output)
        self.assertEqual(marker.read_text(), "keep")

    def test_changed_image_fails_validation(self):
        self.archive()
        build(self.source, self.output)
        (self.output / "sequence + one/gt_manual/2.png").write_bytes(image_bytes(size=(1, 1)))
        with self.assertRaisesRegex(ValueError, "differs from its source"):
            validate(self.source, self.output)

    def test_changed_metadata_fails_validation(self):
        self.archive()
        build(self.source, self.output)
        metadata = self.output / "metadata.jsonl"
        lines = metadata.read_bytes().splitlines(keepends=True)
        metadata.write_bytes(b"".join(reversed(lines)))
        with self.assertRaisesRegex(ValueError, "Metadata differs"):
            validate(self.source, self.output)

    def test_extra_image_fails_validation(self):
        self.archive()
        build(self.source, self.output)
        (self.output / "extra.png").write_bytes(image_bytes())
        with self.assertRaisesRegex(ValueError, "unexpected files"):
            validate(self.source, self.output)

    def test_changed_source_archive_fails_validation(self):
        self.archive()
        build(self.source, self.output)
        self.members["Dataset/sequence + one/gt_manual/2.png"] = image_bytes(mode="RGB")
        self.archive()
        with self.assertRaisesRegex(ValueError, "Metadata differs"):
            validate(self.source, self.output)

    def test_symlink_fails_validation(self):
        self.archive()
        build(self.source, self.output)
        (self.output / "external").symlink_to(self.source)
        with self.assertRaisesRegex(ValueError, "symlinks"):
            validate(self.source, self.output)

    def test_output_directory_symlink_fails_validation(self):
        self.archive()
        build(self.source, self.output)
        target = self.root / "target"
        self.output.rename(target)
        self.output.symlink_to(target, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "symlinks"):
            validate(self.source, self.output)


if __name__ == "__main__":
    unittest.main()
