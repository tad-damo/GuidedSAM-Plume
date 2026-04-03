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
# Added frames field to Video type to store frame file list when video is a directory
# Added original_name field to Video type to preserve original upload filename
# Added MaskMetadata type to store contours_coords and morph_params for each mask
# Added metadata field to RLEMaskForObject to include MaskMetadata
# Replaced AddPointsInput with AddPointsOrBoxInput to optionally include bounding box coordinates
# Renamed ClearPointsInFrameInput and ClearPointsInVideoInput to ClearPromptsInFrameInput and ClearPromptsInVideoInput
# Renamed ClearPointsInVideo type to ClearPromptsInVideo to match updated input naming


from dataclasses import dataclass
from typing import Iterable, List, Optional

import strawberry
from app_conf import API_URL
from data.resolver import resolve_videos
from dataclasses_json import dataclass_json
from strawberry import relay


@strawberry.type
class Video(relay.Node):
    """Core type for video."""

    code: relay.NodeID[str]
    path: str
    frames: Optional[List[str]]
    poster_path: Optional[str]
    width: int
    height: int
    original_name: str

    @strawberry.field
    def url(self) -> str:
        return f"{API_URL}/{self.path}"

    @strawberry.field
    def poster_url(self) -> str:
        return f"{API_URL}/{self.poster_path}"

    @classmethod
    def resolve_nodes(
        cls,
        *,
        info: relay.PageInfo,
        node_ids: Iterable[str],
        required: bool = False,
    ):
        return resolve_videos(node_ids, required)


@strawberry.type
class RLEMask:
    """Core type for Onevision GraphQL RLE mask."""

    size: List[int]
    counts: str
    order: str


@strawberry.type
class MaskMetadata:
    """Type for associating metadata with a RLE Mask"""

    contours_coords: List[List[List[int]]]
    morph_params: str


@strawberry.type
class RLEMaskForObject:
    """Type for RLE mask associated with a specific object id."""

    object_id: int
    metadata: MaskMetadata
    rle_mask: RLEMask


@strawberry.type
class RLEMaskListOnFrame:
    """Type for a list of object-associated RLE masks on a specific video frame."""

    frame_index: int
    rle_mask_list: List[RLEMaskForObject]


@strawberry.input
class StartSessionInput:
    path: str


@strawberry.type
class StartSession:
    session_id: str


@strawberry.input
class PingInput:
    session_id: str


@strawberry.type
class Pong:
    success: bool


@strawberry.input
class CloseSessionInput:
    session_id: str


@strawberry.type
class CloseSession:
    success: bool


@strawberry.input
class AddPointsOrBoxInput:
    session_id: str
    frame_index: int
    clear_old_points: bool
    object_id: int
    labels: List[int]
    points: List[List[float]]
    box: Optional[List[float]] = None


@strawberry.input
class ClearPromptsInFrameInput:
    session_id: str
    frame_index: int
    object_id: int


@strawberry.input
class ClearPromptsInVideoInput:
    session_id: str


@strawberry.type
class ClearPromptsInVideo:
    success: bool


@strawberry.input
class RemoveObjectInput:
    session_id: str
    object_id: int


@strawberry.input
class PropagateInVideoInput:
    session_id: str
    start_frame_index: int


@strawberry.input
class CancelPropagateInVideoInput:
    session_id: str


@strawberry.type
class CancelPropagateInVideo:
    success: bool


@strawberry.type
class SessionExpiration:
    session_id: str
    expiration_time: int
    max_expiration_time: int
    ttl: int
