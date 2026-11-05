# Load the released dataset with Hugging Face Datasets

This utility converts the downloaded GuidedSAM-Plume ZIP to an
[ImageFolder dataset](https://huggingface.co/docs/datasets/image_dataset).
It copies the original image and mask files without resizing, re-encoding,
thresholding or changing their colour modes. Manual and GuidedSAM annotations
remain separate columns.

Download the ZIP from the [dataset catalogue](https://datasets.liris.cnrs.fr/guidedsam-plume-dataset-version1), then run:

```sh
python -m pip install Pillow
python tools/dataset/convert.py build GuidedSAM-Plume_Dataset.zip plume-imagefolder
python tools/dataset/convert.py validate GuidedSAM-Plume_Dataset.zip plume-imagefolder
```

Conversion requires an unused output directory. An invalid pair, duplicate frame
identifier, unreadable image or size mismatch stops conversion before publishing
the output directory. The validator compares every exported file and metadata
row with the source ZIP and rejects missing, changed or extra files.

To load the converted data:

```sh
python -m pip install datasets
python tools/dataset/load_example.py plume-imagefolder
```

The columns are `image`, `manual_mask`, `guided_mask`, `sequence_id`,
`frame_index`, `frame_position` and `source`. `source` records each archive member,
encoded-file and decoded-pixel SHA-256 hashes, dimensions, colour mode, size and
observed channel ranges. JPEG masks can contain intermediate values; they are
preserved as supplied. Empty masks are also retained.

Rows are ordered by sequence name, then by the numeric frame identifier.
`frame_position` is the zero-based position in that sequence, rather than a time
or frame rate. `manifest.json` records the source ZIP hash and actual counts.
The utility checks the layout found in the archive; it does not force a
particular frame count or invent missing annotations.

ImageFolder calls the complete, unsplit collection `train` by default. No
scientific training, validation or test partition is inferred. Any later
evaluation split should keep sequences together. Manual and assisted masks are
two annotation products for the same frames, not independent test sets.

## Dataset card information

The source is the GuidedSAM-Plume dataset from the LIRIS catalogue. The catalogue
describes version1 as 47 sequences and 759 frames, with manual and
GuidedSAM-assisted segmentations. Conversion reports the counts it actually reads.
Please retain the source attribution and use the citation in the repository README.

The catalogue links to a general Creative Commons category without specifying
a licence variant. This utility does not download or upload data. Before hosting
converted files, the dataset owners should confirm the applicable data licence
and distribution terms. The repository's code licence does not determine those
terms. No released images or masks are included with this utility or its tests.

## Tests

The tests generate small images locally:

```sh
python -m unittest discover -s tools/dataset -p 'test_*.py' -v
```
