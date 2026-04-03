# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.
# This source code is licensed under the license found in the
# LICENSE file in the root directory of this source tree.
#
# Modifications Copyright (c) 2025
# Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
#
# Authors
# Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
# Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
#
# Modifications
# Added generate_poster=False in preload_data to skip poster generation during bulk preload
# Added frames field to Video object when filepath is a directory
# Added orignalName parameter to get_video to preserve original upload filename
# Refactored poster generation into _generate_poster helper function
# _generate_poster handles both video files and frame directories for poster extraction
# Updated get_video to call _generate_poster if generate_poster=True
# Ensured width and height are extracted from poster in _generate_poster for consistency
# Updated return of get_video to include frames list, poster_path, width, height, and original_name

import os
import shutil
import subprocess
from glob import glob
from pathlib import Path
from typing import Dict, Optional

import imagesize
from app_conf import GALLERY_PATH, POSTERS_PATH, POSTERS_PREFIX
from data.data_types import Video
from tqdm import tqdm


def preload_data() -> Dict[str, Video]:
    """
    Preload data including gallery videos and their posters.
    """
    # Dictionaries for videos and datasets on the backend.
    # Note that since Python 3.7, dictionaries preserve their insert order, so
    # when looping over its `.values()`, elements inserted first also appear first.
    # https://stackoverflow.com/questions/39980323/are-dictionaries-ordered-in-python-3-6
    all_videos = {}

    video_path_pattern = os.path.join(GALLERY_PATH, "**/*.mp4")
    video_paths = glob(video_path_pattern, recursive=True)

    for p in tqdm(video_paths):
        video = get_video(p, GALLERY_PATH, generate_poster=False)
        all_videos[video.code] = video

    return all_videos


def get_video(
    filepath: os.PathLike,
    absolute_path: Path,
    file_key: Optional[str] = None,
    generate_poster: bool = True,
    width: Optional[int] = None,
    height: Optional[int] = None,
    verbose: Optional[bool] = False,
    orignalName: Optional[str] = None,
) -> Video:
    """
    Get video object given
    """
    # Use absolute_path to include the parent directory in the video
    video_path = os.path.relpath(filepath, absolute_path.parent)
    poster_path = None
    if generate_poster:
        poster_path, width, height = _generate_poster(filepath, verbose)

    frames = None
    if os.path.isdir(filepath):
        frames = sorted(os.listdir(filepath))

    return Video(
        code=video_path,
        path=video_path if file_key is None else file_key,
        frames=frames,
        poster_path=poster_path,
        width=width,
        height=height,
        original_name=orignalName,
    )


def _generate_poster(filepath: str, verbose: bool) -> str:
    poster_id = os.path.splitext(os.path.basename(filepath))[0]
    poster_filename = f"{str(poster_id)}.jpg"
    poster_path = f"{POSTERS_PREFIX}/{poster_filename}"
    poster_output_path = os.path.join(POSTERS_PATH, poster_filename)
    if os.path.isdir(filepath):
        # Take first frame as poster
        frames = sorted(os.listdir(filepath))
        shutil.copy2(os.path.join(filepath, frames[0]), poster_output_path)
    else:
        # Extract the first frame from video
        ffmpeg = shutil.which("ffmpeg")
        subprocess.call(
            [
                ffmpeg,
                "-y",
                "-i",
                str(filepath),
                "-pix_fmt",
                "yuv420p",
                "-frames:v",
                "1",
                "-update",
                "1",
                "-strict",
                "unofficial",
                str(poster_output_path),
            ],
            stdout=None if verbose else subprocess.DEVNULL,
            stderr=None if verbose else subprocess.DEVNULL,
        )
    # Extract video width and height from poster. This is important to optimize
    # rendering previews in the mosaic video preview.
    width, height = imagesize.get(poster_output_path)
    return poster_path, width, height
