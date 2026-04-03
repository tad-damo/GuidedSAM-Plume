/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * Modifications Copyright (c) 2025
 * Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
 *
 * Authors
 * Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
 * Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
 *
 *
 * Modifications:
 * - Added `Box` type and `FrameBox` support.
 * - Added `boxes: FrameBox[]` to `Tracklet`.
 * - Updated `Mask` and `DatalessMask` to include `overlayRendered`, `contours`, and `morphParams`.
 * - Renamed `updatePoints` → `updatePointsOrBox` and `clearPointsInFrame` / `clearPointsInVideo` → `clearPromptsInFrame` / `clearPromptsInVideo`.
 * - Updated `startSession` to accept `videoIndex` for multi-video support.
 */
import VideoWorkerContext from '@/common/components/video/VideoWorkerContext';

import {TrackerOptions} from '@/common/tracker/Trackers';
import {TrackerResponse} from '@/common/tracker/TrackerTypes';
import {RLEObject} from '@/jscocotools/mask';

export type Point = [x: number, y: number];

export type SegmentationPoint = [...point: Point, label: 0 | 1];

export type Box = [x0: number, y0: number, x1: number, y1: number] | null;

export type FramePoints = Array<SegmentationPoint> | undefined;

export type FrameBox = Box | undefined;

export type Mask = DatalessMask & {
  data: Blob | RLEObject;
  overlayRendered: boolean;
};

export type DatalessMask = {
  shape: number[];
  bounds: [[number, number], [number, number]];
  contours: number[][][];
  morphParams: Record<string, unknown>; // JSON object with arbitrary keys/values
  isEmpty: boolean;
};

export type Tracklet = {
  id: number;
  color: string;
  thumbnail: string | null;
  points: FramePoints[];
  boxes: FrameBox[];
  masks: Mask[];
  isInitialized: boolean;
};

export type BaseTracklet = Omit<Tracklet, 'masks'> & {
  masks: DatalessMask[];
};

export type StreamingState =
  | 'none'
  | 'required'
  | 'requesting'
  | 'aborting'
  | 'aborted'
  | 'partial'
  | 'full';

export interface ITracker {
  startSession(videoUrl: string, videoIndx: number): Promise<void>;
  closeSession(): Promise<void>;
  createTracklet(): void;
  deleteTracklet(trackletId: number): Promise<void>;
  updatePointsOrBox(
    frameIndex: number,
    objectId: number,
    points: SegmentationPoint[],
    box: Box,
  ): Promise<void>;
  clearPromptsInFrame(frameIndex: number, objectId: number): Promise<void>;
  clearPromptsInVideo(): Promise<void>;
  streamMasks(frameIndex: number): Promise<void>;
  abortStreamMasks(): void;
  enableStats(): void;
}

export abstract class Tracker implements ITracker {
  protected _context: VideoWorkerContext;
  constructor(context: VideoWorkerContext, _options?: TrackerOptions) {
    this._context = context;
  }
  abstract startSession(videoUrl: string, videoIndex: number): Promise<void>;
  abstract closeSession(): Promise<void>;
  abstract createTracklet(): void;
  abstract deleteTracklet(trackletId: number): Promise<void>;
  abstract updatePointsOrBox(
    frameIndex: number,
    objectId: number,
    points: SegmentationPoint[],
    box: Box,
  ): Promise<void>;
  abstract clearPromptsInFrame(
    frameIndex: number,
    objectId: number,
  ): Promise<void>;
  abstract clearPromptsInVideo(): Promise<void>;
  abstract streamMasks(frameIndex: number): Promise<void>;
  abstract abortStreamMasks(): void;
  abstract enableStats(): void;

  // PRIVATE FUNCTIONS

  protected _sendResponse<T extends TrackerResponse>(
    action: T['action'],
    message?: Omit<T, 'action'>,
    transfer?: Transferable[],
  ): void {
    self.postMessage(
      {
        action,
        ...message,
      },
      {
        transfer,
      },
    );
  }
}
