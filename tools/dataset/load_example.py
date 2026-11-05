"""Load a converted, unsplit GuidedSAM-Plume dataset without starting the GUI."""

import argparse
from pathlib import Path

from datasets import load_dataset


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    dataset = load_dataset("imagefolder", data_dir=str(args.directory),
                           split="train", drop_labels=True)
    print(f"Loaded {len(dataset)} frames")
    first = dataset[0]
    print(first["sequence_id"], first["frame_index"])
    for column in ["image", "manual_mask", "guided_mask"]:
        image = first[column]
        print(column, image.size, image.mode)


if __name__ == "__main__":
    main()
