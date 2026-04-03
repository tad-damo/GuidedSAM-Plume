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
# Modifications:
# - Added support for directories of frames in `transcode` and `normalize_video` via `isdir` parameter.
# - Added `convert_format`, `images_to_jpg`, and `video_to_frames` utility functions for handling non-MP4 inputs.
# - Added `create_video_metadata_from_frames` to compute metadata from frame sequences.
# - Replaced hardcoded max_w and max_h in normalize_video with passed arguments and used `max_w`/`max_h` instead of fixed 1280/720.
# - Added logic to convert frame directories to FFmpeg-compatible input pattern with numbered sequence.
# - Added imports for `PIL.Image` and `imagesize` to handle image frame inputs.
# - Minor refactor for verbose FFmpeg command printing.

import ast
import math
import os
import shutil
import subprocess
from PIL import Image
import imagesize
from dataclasses import dataclass
from typing import Optional

import av
from app_conf import FFMPEG_NUM_THREADS
from dataclasses_json import dataclass_json

TRANSCODE_VERSION = 1


@dataclass_json
@dataclass
class VideoMetadata:
    duration_sec: Optional[float]
    video_duration_sec: Optional[float]
    container_duration_sec: Optional[float]
    fps: Optional[float]
    width: Optional[int]
    height: Optional[int]
    num_video_frames: int
    num_video_streams: int
    video_start_time: float


def transcode(
    in_path: str,
    out_path: str,
    in_metadata: Optional[VideoMetadata],
    seek_t: float,
    duration_time_sec: float,
):
    codec = os.environ.get("VIDEO_ENCODE_CODEC", "libx264")
    crf = int(os.environ.get("VIDEO_ENCODE_CRF", "23"))
    fps = int(os.environ.get("VIDEO_ENCODE_FPS", "24"))
    max_w = int(os.environ.get("VIDEO_ENCODE_MAX_WIDTH", "1280"))
    max_h = int(os.environ.get("VIDEO_ENCODE_MAX_HEIGHT", "720"))
    verbose = ast.literal_eval(os.environ.get("VIDEO_ENCODE_VERBOSE", "False"))

    normalize_video(
        in_path=in_path,
        isdir=os.path.isdir(in_path),
        out_path=out_path,
        max_w=max_w,
        max_h=max_h,
        seek_t=seek_t,
        max_time=duration_time_sec,
        in_metadata=in_metadata,
        codec=codec,
        crf=crf,
        fps=fps,
        verbose=verbose,
    )


def convert_format(in_path: str) -> str:
    out_path = in_path + "_jpg"

    if os.path.isdir(in_path):
        if os.path.splitext(os.listdir(in_path)[0])[-1].lower() not in [
            ".jpg",
            ".jpeg",
        ]:
            images_to_jpg(in_path, out_path)
        else:
            return in_path
    else:
        # if os.path.splitext(in_path)[-1].lower() == ".mp4":
        #     return in_path
        # else:
        video_to_frames(in_path, out_path)
    return out_path


def images_to_jpg(in_path: str, out_path: str):
    os.makedirs(out_path, exist_ok=True)
    for p in os.listdir(in_path):
        im = Image.open(os.path.join(in_path, p))
        p = os.path.splitext(p)[0] + ".jpg"
        im.convert("RGB").save(os.path.join(out_path, p))


def video_to_frames(video_path: str, out_path: str):
    os.makedirs(out_path, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-i",
        video_path,
        "-q:v",
        "2",
    ]
    verbose = ast.literal_eval(os.environ.get("VIDEO_ENCODE_VERBOSE", "False"))

    cmd += [os.path.join(out_path, "%05d.jpg")]

    if verbose:
        print(" ".join(cmd))

    subprocess.call(
        cmd,
        stdout=None if verbose else subprocess.DEVNULL,
        stderr=None if verbose else subprocess.DEVNULL,
    )


def get_video_metadata(path: str) -> VideoMetadata:
    if os.path.isdir(path):
        return create_video_metadata_from_frames(path)
    with av.open(path) as cont:
        num_video_streams = len(cont.streams.video)
        width, height, fps = None, None, None
        video_duration_sec = 0
        container_duration_sec = float((cont.duration or 0) / av.time_base)
        video_start_time = 0.0
        rotation_deg = 0
        num_video_frames = 0
        if num_video_streams > 0:
            video_stream = cont.streams.video[0]
            assert video_stream.time_base is not None

            # for rotation, see: https://github.com/PyAV-Org/PyAV/pull/1249
            rotation_deg = video_stream.side_data.get("DISPLAYMATRIX", 0)
            num_video_frames = video_stream.frames
            video_start_time = float(
                video_stream.start_time * video_stream.time_base)
            width, height = video_stream.width, video_stream.height
            fps = float(video_stream.guessed_rate)
            fps_avg = video_stream.average_rate
            if video_stream.duration is not None:
                video_duration_sec = float(
                    video_stream.duration * video_stream.time_base
                )
            if fps is None:
                fps = float(fps_avg)

            if not math.isnan(rotation_deg) and int(rotation_deg) in (
                90,
                -90,
                270,
                -270,
            ):
                width, height = height, width

        duration_sec = max(container_duration_sec, video_duration_sec)

        return VideoMetadata(
            duration_sec=duration_sec,
            container_duration_sec=container_duration_sec,
            video_duration_sec=video_duration_sec,
            video_start_time=video_start_time,
            fps=fps,
            width=width,
            height=height,
            num_video_streams=num_video_streams,
            num_video_frames=num_video_frames,
        )


def create_video_metadata_from_frames(path: str) -> VideoMetadata:
    frames = os.listdir(path)
    width, height = imagesize.get(os.path.join(path, frames[0]))

    return VideoMetadata(
        duration_sec=len(frames) * 1 / 24,
        container_duration_sec=None,
        video_duration_sec=None,
        video_start_time=None,
        fps=None,
        width=width,
        height=height,
        num_video_streams=1 if len(frames) > 0 else 0,
        num_video_frames=len(frames),
    )


def normalize_video(
    in_path: str,
    isdir: bool,
    out_path: str,
    max_w: int,
    max_h: int,
    seek_t: float,
    max_time: float,
    in_metadata: Optional[VideoMetadata],
    codec: str = "libx264",
    crf: int = 23,
    fps: int = 24,
    verbose: bool = False,
):
    if in_metadata is None:
        in_metadata = get_video_metadata(in_path)

    assert in_metadata.num_video_streams > 0, "no video stream present"

    w, h = in_metadata.width, in_metadata.height
    assert w is not None, "width not available"
    assert h is not None, "height not available"

    # rescale to max_w:max_h if needed & preserve aspect ratio
    r = w / h
    if r < 1:
        h = min(max_h, h)
        w = h * r
    else:
        w = min(max_w, w)
        h = w / r

    # h264 cannot encode w/ odd dimensions
    w = int(w)
    h = int(h)
    if w % 2 != 0:
        w += 1
    if h % 2 != 0:
        h += 1

    if isdir:
        frames = sorted(os.listdir(in_path))

        # Take the first frame to determine the pattern
        first_frame = frames[0]  # e.g., "frame0001.png"
        name, ext = os.path.splitext(first_frame)

        # Find the numeric part at the end of the name
        import re

        m = re.search(r"(\d+)$", name)

        number_width = len(m.group(1))
        prefix = name[:-number_width]

        # FFmpeg needs to be a frame path pattern
        in_path = os.path.join(in_path, f"{prefix}%0{number_width}d{ext}")

    ffmpeg = shutil.which("ffmpeg")
    cmd = [
        ffmpeg,
        "-threads",
        f"{FFMPEG_NUM_THREADS}",  # global threads
        "-ss",
        f"{seek_t:.2f}",
        "-t",
        f"{max_time:.2f}",
        "-i",
        in_path,
        "-threads",
        f"{FFMPEG_NUM_THREADS}",  # decode (or filter..?) threads
        "-vf",
        f"fps={fps},scale={w}:{h},setsar=1:1",
        "-c:v",
        codec,
        "-crf",
        f"{crf}",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        f"{FFMPEG_NUM_THREADS}",  # encode threads
        out_path,
        "-y",
    ]
    if verbose:
        print(" ".join(cmd))

    subprocess.call(
        cmd,
        stdout=None if verbose else subprocess.DEVNULL,
        stderr=None if verbose else subprocess.DEVNULL,
    )
