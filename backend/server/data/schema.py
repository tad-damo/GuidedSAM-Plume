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
# Added support for AddPointsOrBoxInput mutation replacing AddPointsInput
# Added box field support in add_points_or_box mutation and request (AddPointsOrBoxRequest)
# Added metadata field (MaskMetadata) with contours_coords and morph_params for richer mask info
# Renamed clear_points_in_frame → clear_prompts_in_frame and clear_points_in_video → clear_prompts_in_video
# Updated request types for clearing prompts (ClearPromptsInFrameRequest / ClearPromptsInVideoRequest)
# Added _get_filetype helper to determine file type (video, image, zip) from extension
# Added _extract_zip and _move_dir_content helpers to handle uploaded zip files containing frames
# Updated process_video to handle zip files and single images as well as video
# Integrated convert_format from new transcoder to convert images or extracted frames to standard format
# Added environment variable check TRANSCODE_VIDEOS to conditionally transcode uploaded videos
# Ensured proper cleanup of temporary directories and files after processing non-video inputs
# Added support for storing original file name in get_video call (orignalName=file.filename)
# Added use of boolean TRANSCODE_VIDEOS environment variable
# Generalized processing pipeline to unify video, image, and zip uploads into consistent output format
# Preserved transcode call for videos while skipping unnecessary transcoding for images/frames unless required

import ast
import hashlib
import os
import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Iterable, List, Optional, Tuple, Union

import av
import strawberry
from app_conf import (
    DATA_PATH,
    DEFAULT_VIDEO_PATH,
    MAX_UPLOAD_VIDEO_DURATION,
    UPLOADS_PATH,
    UPLOADS_PREFIX,
)
from data.data_types import (
    AddPointsOrBoxInput,
    CancelPropagateInVideo,
    CancelPropagateInVideoInput,
    ClearPromptsInFrameInput,
    ClearPromptsInVideo,
    ClearPromptsInVideoInput,
    CloseSession,
    CloseSessionInput,
    RemoveObjectInput,
    RLEMask,
    MaskMetadata,
    RLEMaskForObject,
    RLEMaskListOnFrame,
    StartSession,
    StartSessionInput,
    Video,
)
from data.loader import get_video
from data.store import get_videos
from data.transcoder import get_video_metadata, convert_format, transcode, VideoMetadata
from inference.data_types import (
    AddPointsOrBoxRequest,
    CancelPropagateInVideoRequest,
    CancelPropagateInVideoRequest,
    ClearPromptsInFrameRequest,
    ClearPromptsInVideoRequest,
    CloseSessionRequest,
    RemoveObjectRequest,
    StartSessionRequest,
)
from inference.predictor import InferenceAPI
from strawberry import relay
from strawberry.file_uploads import Upload


@strawberry.type
class Query:

    @strawberry.field
    def default_video(self) -> Video:
        """
        Return the default video.

        The default video can be set with the DEFAULT_VIDEO_PATH environment
        variable. It will return the video that matches this path. If no video
        is found, it will return the first video.
        """
        all_videos = get_videos()

        # Find the video that matches the default path and return that as
        # default video.
        for _, v in all_videos.items():
            if v.path == DEFAULT_VIDEO_PATH:
                return v

        # Fallback is returning the first video
        return next(iter(all_videos.values()))

    @relay.connection(relay.ListConnection[Video])
    def videos(
        self,
    ) -> Iterable[Video]:
        """
        Return all available videos.
        """
        all_videos = get_videos()
        return all_videos.values()


@strawberry.type
class Mutation:

    @strawberry.mutation
    def upload_video(
        self,
        file: Upload,
        start_time_sec: Optional[float] = None,
        duration_time_sec: Optional[float] = None,
    ) -> Video:
        """
        Receive a video file and store it in the configured S3 bucket.
        """
        max_time = MAX_UPLOAD_VIDEO_DURATION
        filepath, file_key, vm = process_video(
            file,
            max_time=max_time,
            start_time_sec=start_time_sec,
            duration_time_sec=duration_time_sec,
        )

        video = get_video(
            filepath,
            UPLOADS_PATH,
            file_key=file_key,
            width=vm.width,
            height=vm.height,
            orignalName=file.filename,
        )
        return video

    @strawberry.mutation
    def start_session(
        self, input: StartSessionInput, info: strawberry.Info
    ) -> StartSession:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = StartSessionRequest(
            type="start_session",
            path=f"{DATA_PATH}/{input.path}",
        )

        response = inference_api.start_session(request=request)

        return StartSession(session_id=response.session_id)

    @strawberry.mutation
    def close_session(
        self, input: CloseSessionInput, info: strawberry.Info
    ) -> CloseSession:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = CloseSessionRequest(
            type="close_session",
            session_id=input.session_id,
        )
        response = inference_api.close_session(request)
        return CloseSession(success=response.success)

    @strawberry.mutation
    def add_points_or_box(
        self, input: AddPointsOrBoxInput, info: strawberry.Info
    ) -> RLEMaskListOnFrame:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = AddPointsOrBoxRequest(
            type="add_points_or_box",
            session_id=input.session_id,
            frame_index=input.frame_index,
            object_id=input.object_id,
            points=input.points,
            labels=input.labels,
            clear_old_points=input.clear_old_points,
            box=input.box,
        )
        reponse = inference_api.add_points_or_box(request)

        return RLEMaskListOnFrame(
            frame_index=reponse.frame_index,
            rle_mask_list=[
                RLEMaskForObject(
                    object_id=r.object_id,
                    metadata=MaskMetadata(
                        contours_coords=r.contours, morph_params=r.morph_params
                    ),
                    rle_mask=RLEMask(counts=r.mask.counts, size=r.mask.size, order="F"),
                )
                for r in reponse.results
            ],
        )

    @strawberry.mutation
    def remove_object(
        self, input: RemoveObjectInput, info: strawberry.Info
    ) -> List[RLEMaskListOnFrame]:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = RemoveObjectRequest(
            type="remove_object", session_id=input.session_id, object_id=input.object_id
        )

        response = inference_api.remove_object(request)

        return [
            RLEMaskListOnFrame(
                frame_index=res.frame_index,
                rle_mask_list=[
                    RLEMaskForObject(
                        object_id=r.object_id,
                        metadata=MaskMetadata(
                            contours_coords=r.contours, morph_params=r.morph_params
                        ),
                        rle_mask=RLEMask(
                            counts=r.mask.counts, size=r.mask.size, order="F"
                        ),
                    )
                    for r in res.results
                ],
            )
            for res in response.results
        ]

    @strawberry.mutation
    def clear_prompts_in_frame(
        self, input: ClearPromptsInFrameInput, info: strawberry.Info
    ) -> RLEMaskListOnFrame:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = ClearPromptsInFrameRequest(
            type="clear_prompts_in_frame",
            session_id=input.session_id,
            frame_index=input.frame_index,
            object_id=input.object_id,
        )

        response = inference_api.clear_prompts_in_frame(request)

        return RLEMaskListOnFrame(
            frame_index=response.frame_index,
            rle_mask_list=[
                RLEMaskForObject(
                    object_id=r.object_id,
                    metadata=MaskMetadata(
                        contours_coords=r.contours, morph_params=r.morph_params
                    ),
                    rle_mask=RLEMask(counts=r.mask.counts, size=r.mask.size, order="F"),
                )
                for r in response.results
            ],
        )

    @strawberry.mutation
    def clear_prompts_in_video(
        self, input: ClearPromptsInVideoInput, info: strawberry.Info
    ) -> ClearPromptsInVideo:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = ClearPromptsInVideoRequest(
            type="clear_prompts_in_video",
            session_id=input.session_id,
        )
        response = inference_api.clear_prompts_in_video(request)
        return ClearPromptsInVideo(success=response.success)

    @strawberry.mutation
    def cancel_propagate_in_video(
        self, input: CancelPropagateInVideoInput, info: strawberry.Info
    ) -> CancelPropagateInVideo:
        inference_api: InferenceAPI = info.context["inference_api"]

        request = CancelPropagateInVideoRequest(
            type="cancel_propagate_in_video",
            session_id=input.session_id,
        )
        response = inference_api.cancel_propagate_in_video(request)
        return CancelPropagateInVideo(success=response.success)


def get_file_hash(video_path_or_file) -> str:
    if isinstance(video_path_or_file, str):
        with open(video_path_or_file, "rb") as in_f:
            result = hashlib.sha256(in_f.read()).hexdigest()
    else:
        video_path_or_file.seek(0)
        result = hashlib.sha256(video_path_or_file.read()).hexdigest()
    return result


def _get_start_sec_duration_sec(
    start_time_sec: Union[float, None],
    duration_time_sec: Union[float, None],
    max_time: float,
) -> Tuple[float, float]:
    default_seek_t = int(os.environ.get("VIDEO_ENCODE_SEEK_TIME", "0"))
    if start_time_sec is None:
        start_time_sec = default_seek_t

    if duration_time_sec is not None:
        duration_time_sec = min(duration_time_sec, max_time)
    else:
        duration_time_sec = max_time
    return start_time_sec, duration_time_sec


def _get_filetype(filename: str) -> Tuple[str, str]:
    _, ext = os.path.splitext(filename.lower())
    if ext == ".zip":
        file_type = "zip"
    elif ext in [".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".webp", ".gif"]:
        file_type = "image"
    else:
        file_type = "video"
    return file_type, ext


def _move_dir_content(src_dir: str, dst_dir: str, rm_src: bool):
    if not os.path.exists(dst_dir):
        os.mkdir(dst_dir)
    with os.scandir(src_dir) as entries:
        for entry in entries:
            shutil.move(entry.path, os.path.join(dst_dir, entry.name))
    if rm_src:
        os.rmdir(src_dir)


def _extract_zip(zip_path: str, dest_dir_path: str):
    # Unzip to temporary folder
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(dest_dir_path)

        # check if the extracted dir contains a folder instead of directly a frames sequence
        extract_content = os.listdir(dest_dir_path)
        if len(extract_content) == 1 and os.path.isdir(
            f"{dest_dir_path}/{extract_content[0]}"
        ):
            _move_dir_content(
                f"{dest_dir_path}/{extract_content[0]}", dest_dir_path, rm_src=True
            )


def process_video(
    file: Upload,
    max_time: float,
    start_time_sec: Optional[float] = None,
    duration_time_sec: Optional[float] = None,
) -> Tuple[Optional[str], str, str, VideoMetadata]:
    """
    Process file upload including video trimming and content moderation checks.

    Returns the filepath, s3_file_key, hash & video metaedata as a tuple.
    """

    with tempfile.TemporaryDirectory() as tempdir:
        file_type, ext = _get_filetype(file.filename)

        raw_file_path = f"{tempdir}/rawfile{ext}"
        with open(raw_file_path, "wb") as in_f:
            in_f.write(file.read())

        extract_dir = f"{tempdir}/extracted_in"

        if file_type == "zip":
            _extract_zip(raw_file_path, extract_dir)

        if file_type == "image":
            os.mkdir(extract_dir)
            shutil.copy2(raw_file_path, f"{extract_dir}/0{ext}")

        in_path = raw_file_path if file_type == "video" else extract_dir

        try:
            video_metadata = get_video_metadata(in_path)
        except av.InvalidDataError:
            raise Exception("not valid video file")

        if video_metadata.num_video_streams == 0:
            raise Exception("video container does not contain a video stream")
        if video_metadata.width is None or video_metadata.height is None:
            raise Exception("video container does not contain width or height metadata")

        if video_metadata.duration_sec in (None, 0):
            raise Exception("video container does time duration metadata")

        start_time_sec, duration_time_sec = _get_start_sec_duration_sec(
            max_time=max_time,
            start_time_sec=start_time_sec,
            duration_time_sec=duration_time_sec,
        )

        # Transcode video to make sure videos returned to the app are all in
        # the same format, duration, resolution, fps.
        use_transcode = ast.literal_eval(os.environ.get("TRANSCODE_VIDEOS", "False"))
        if use_transcode:
            out_path = f"{tempdir}/out.mp4"
            if file_type != "video":
                new_in_path = convert_format(in_path)
                if new_in_path != in_path:
                    shutil.rmtree(in_path)
                    in_path = new_in_path
            transcode(
                in_path,
                out_path,
                video_metadata,
                seek_t=start_time_sec,
                duration_time_sec=duration_time_sec,
            )
            if file_type != "video":
                shutil.rmtree(in_path)
            os.remove(raw_file_path)
        else:
            out_path = convert_format(in_path)
            if in_path != out_path:
                if file_type != "video":
                    shutil.rmtree(in_path)

        out_video_metadata = get_video_metadata(out_path)
        if out_video_metadata.num_video_frames == 0:
            raise Exception(
                "transcode produced empty video; check seek time or your input video"
            )

        filepath = None
        file_key = None

        if os.path.splitext(out_path)[-1].lower() == ".mp4":
            with open(out_path, "rb") as file_data:
                file_hash = get_file_hash(file_data)
                file_data.seek(0)

                file_key = UPLOADS_PREFIX + "/" + f"{file_hash}.mp4"
                filepath = os.path.join(UPLOADS_PATH, f"{file_hash}.mp4")

            assert filepath is not None and file_key is not None
            shutil.move(out_path, filepath)
        else:
            with open(raw_file_path, "rb") as file_data:
                file_hash = get_file_hash(file_data)
                file_data.seek(0)

                file_key = UPLOADS_PREFIX + "/" + f"{file_hash}"
                filepath = os.path.join(UPLOADS_PATH, f"{file_hash}")
            assert filepath is not None and file_key is not None
            _move_dir_content(out_path, filepath, rm_src=True)
            os.remove(raw_file_path)

        return filepath, file_key, out_video_metadata


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
)
