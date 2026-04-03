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
# - Replaced `AddPointsRequest` with `AddPointsOrBoxRequest` to support optional `box`.
# - Renamed `ClearPointsInFrameRequest` and `ClearPointsInVideoRequest` to `ClearPromptsInFrameRequest` and `ClearPromptsInVideoRequest`.
# - Updated `PropagateDataValue` to include `contours` and `morph_params`.
# - Updated type hints and optional fields for box handling in `AddPointsOrBoxRequest`.

from dataclasses import dataclass
from typing import Dict, List, Optional, Union

from dataclasses_json import dataclass_json
from torch import Tensor


@dataclass_json
@dataclass
class Mask:
    size: List[int]
    counts: str


@dataclass_json
@dataclass
class BaseRequest:
    type: str


@dataclass_json
@dataclass
class StartSessionRequest(BaseRequest):
    type: str
    path: str
    session_id: Optional[str] = None


@dataclass_json
@dataclass
class SaveSessionRequest(BaseRequest):
    type: str
    session_id: str


@dataclass_json
@dataclass
class LoadSessionRequest(BaseRequest):
    type: str
    session_id: str


@dataclass_json
@dataclass
class RenewSessionRequest(BaseRequest):
    type: str
    session_id: str


@dataclass_json
@dataclass
class CloseSessionRequest(BaseRequest):
    type: str
    session_id: str


@dataclass_json
@dataclass
class AddPointsOrBoxRequest(BaseRequest):
    type: str
    session_id: str
    frame_index: int
    clear_old_points: bool
    object_id: int
    labels: List[int]
    points: List[List[float]]
    box: Optional[List[float]] = None


@dataclass_json
@dataclass
class AddMaskRequest(BaseRequest):
    type: str
    session_id: str
    frame_index: int
    object_id: int
    mask: Mask


@dataclass_json
@dataclass
class ClearPromptsInFrameRequest(BaseRequest):
    type: str
    session_id: str
    frame_index: int
    object_id: int


@dataclass_json
@dataclass
class ClearPromptsInVideoRequest(BaseRequest):
    type: str
    session_id: str


@dataclass_json
@dataclass
class RemoveObjectRequest(BaseRequest):
    type: str
    session_id: str
    object_id: int


@dataclass_json
@dataclass
class PropagateInVideoRequest(BaseRequest):
    type: str
    session_id: str
    start_frame_index: int


@dataclass_json
@dataclass
class CancelPropagateInVideoRequest(BaseRequest):
    type: str
    session_id: str


@dataclass_json
@dataclass
class StartSessionResponse:
    session_id: str


@dataclass_json
@dataclass
class SaveSessionResponse:
    session_id: str


@dataclass_json
@dataclass
class LoadSessionResponse:
    session_id: str


@dataclass_json
@dataclass
class RenewSessionResponse:
    session_id: str


@dataclass_json
@dataclass
class CloseSessionResponse:
    success: bool


@dataclass_json
@dataclass
class ClearPromptsInVideoResponse:
    success: bool


@dataclass_json
@dataclass
class PropagateDataValue:
    object_id: int
    contours: List[List[List[int]]]
    morph_params: str
    mask: Mask


@dataclass_json
@dataclass
class PropagateDataResponse:
    frame_index: int
    results: List[PropagateDataValue]


@dataclass_json
@dataclass
class RemoveObjectResponse:
    results: List[PropagateDataResponse]


@dataclass_json
@dataclass
class CancelPorpagateResponse:
    success: bool


@dataclass_json
@dataclass
class InferenceSession:
    start_time: float
    last_use_time: float
    session_id: str
    state: Dict[str, Dict[str, Union[Tensor, Dict[int, Tensor]]]]
