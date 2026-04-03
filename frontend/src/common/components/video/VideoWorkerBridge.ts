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
 Modifications:
 * - Added support for `frames` array in `setSource` to handle pre-rendered image frames in addition to video URLs.
 * - Replaced `encode` method with `encodeVideo` using `EncodeVideoRequest` for frame encoding.
 * - Added `encodeMasksMetrics` method to export tracklet masks metrics.
 * - Updated event types and worker event map to support multiple videos (e.g., `videoIndex` in TrackletsEvent, `index` in SessionStartedEvent).
 * - Replaced `AddPointsEvent` and `ClearPointsInVideoEvent` with `AddPointsOrBoxEvent` and `ClearPromptsInVideoEvent` to support points and boxes.
 * - Updated `updatePointsOrBox` to send both segmentation points and bounding box data.
 * - Renamed `clearPointsInFrame` and `clearPointsInVideo` to `clearPromptsInFrame` and `clearPromptsInVideo`.
 * - Updated streaming state events to include `videoId`.
 * - Adjusted `startSession` to take an `index` parameter and return `{sessionId, index}`.
 * - Updated `EncodingCompletedEvent` so that the `files` property now supports both `ArrayBuffer[]` and `string[]` instead of a single `MP4ArrayBuffer`.
 */
import {EffectIndex, Effects} from '@/common/components/video/effects/Effects';
import {registerSerializableConstructors} from '@/common/error/ErrorSerializationUtils';
import {
  BaseTracklet,
  Box,
  SegmentationPoint,
  StreamingState,
} from '@/common/tracker/Tracker';
import {
  AbortStreamMasksRequest,
  AddPointsOrBoxResponse,
  ClearPromptsInFrameRequest,
  ClearPromptsInVideoRequest,
  ClearPromptsInVideoResponse,
  CloseSessionRequest,
  CreateTrackletRequest,
  DeleteTrackletRequest,
  InitializeTrackerRequest,
  LogAnnotationsRequest,
  SessionStartFailedResponse,
  SessionStartedResponse,
  StartSessionRequest,
  StreamMasksRequest,
  StreamingStateUpdateResponse,
  TrackerRequest,
  TrackerResponseMessageEvent,
  TrackletCreatedResponse,
  TrackletDeletedResponse,
  UpdatePointsOrBoxRequest,
} from '@/common/tracker/TrackerTypes';
import {TrackerOptions, Trackers} from '@/common/tracker/Trackers';
import {deserializeError, type ErrorObject} from 'serialize-error';
import {EventEmitter} from './EventEmitter';
import {
  EncodeMasksMetricsRequest,
  EncodeVideoRequest,
  FilmstripRequest,
  FilmstripResponse,
  FrameUpdateRequest,
  PauseRequest,
  PlayRequest,
  SetCanvasRequest,
  SetEffectRequest,
  SetSourceRequest,
  StopRequest,
  VideoWorkerRequest,
  VideoWorkerResponseMessageEvent,
} from './VideoWorkerTypes';
import {EffectOptions} from './effects/Effect';

registerSerializableConstructors();

export type DecodeEvent = {
  totalFrames: number;
  numFrames: number;
  fps: number;
  width: number;
  height: number;
  done: boolean;
};

export type LoadStartEvent = unknown;

export type EffectUpdateEvent = {
  name: keyof Effects;
  index: EffectIndex;
  variant: number;
  numVariants: number;
};

export type EncodingStateUpdateEvent = {
  progress: number;
};

export type EncodingCompletedEvent = {
  files: ArrayBuffer[] | string[];
};

export interface PlayEvent {}

export interface PauseEvent {}

export interface FilmstripEvent {
  filmstrip: ImageBitmap;
}

export interface FrameUpdateEvent {
  index: number;
}

export interface SessionStartedEvent {
  sessionId: string;
  index: number;
}

export interface SessionStartFailedEvent {}

export interface TrackletCreatedEvent {
  // Do not send masks between workers and main thread because they are huge,
  // and sending them would eventually slow down the main thread.
  tracklet: BaseTracklet;
}

export interface TrackletsEvent {
  // Do not send masks between workers and main thread because they are huge,
  // and sending them would eventually slow down the main thread.
  tracklets: BaseTracklet[];
  videoIndex: number;
}

export interface TrackletDeletedEvent {
  isSuccessful: boolean;
}

export interface AddPointsOrBoxEvent {
  isSuccessful: boolean;
}

export interface ClearPromptsInVideoEvent {
  isSuccessful: boolean;
}

export interface StreamingStartedEvent {}

export interface StreamingCompletedEvent {}

export interface StreamingStateUpdateEvent {
  state: StreamingState;
  videoId: number;
}

export interface RenderingErrorEvent {
  error: ErrorObject;
}

export interface VideoWorkerEventMap {
  error: ErrorEvent;
  decode: DecodeEvent;
  encodingStateUpdate: EncodingStateUpdateEvent;
  encodingCompleted: EncodingCompletedEvent;
  play: PlayEvent;
  pause: PauseEvent;
  filmstrip: FilmstripEvent;
  frameUpdate: FrameUpdateEvent;
  sessionStarted: SessionStartedEvent;
  sessionStartFailed: SessionStartFailedEvent;
  trackletCreated: TrackletCreatedEvent;
  trackletsUpdated: TrackletsEvent;
  trackletDeleted: TrackletDeletedEvent;
  addPointsOrBox: AddPointsOrBoxEvent;
  clearPromptsInVideo: ClearPromptsInVideoEvent;
  streamingStarted: StreamingStartedEvent;
  streamingCompleted: StreamingCompletedEvent;
  streamingStateUpdate: StreamingStateUpdateEvent;
  // HTMLVideoElement events https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#events
  loadstart: LoadStartEvent;
  effectUpdate: EffectUpdateEvent;
  renderingError: RenderingErrorEvent;
}

type Metadata = {
  totalFrames: number;
  fps: number;
  width: number;
  height: number;
};

export default class VideoWorkerBridge extends EventEmitter<VideoWorkerEventMap> {
  static create(workerFactory: () => Worker) {
    const worker = workerFactory();
    return new VideoWorkerBridge(worker);
  }

  protected worker: Worker;
  private metadata: Metadata | null = null;
  private frameIndex: number = 0;

  private _sessionId: string | null = null;

  public get sessionId() {
    return this._sessionId;
  }

  public get width() {
    return this.metadata?.width ?? 0;
  }

  public get height() {
    return this.metadata?.height ?? 0;
  }

  public get numberOfFrames() {
    return this.metadata?.totalFrames ?? 0;
  }

  public get fps() {
    return this.metadata?.fps ?? 0;
  }

  public get frame() {
    return this.frameIndex;
  }

  constructor(worker: Worker) {
    super();
    this.worker = worker;

    worker.addEventListener(
      'message',
      (
        event: VideoWorkerResponseMessageEvent | TrackerResponseMessageEvent,
      ) => {
        switch (event.data.action) {
          case 'error':
            // Deserialize error before triggering the event
            event.data.error = deserializeError(event.data.error);
            break;
          case 'decode':
            this.metadata = event.data;
            break;
          case 'frameUpdate':
            this.frameIndex = event.data.index;
            break;
          case 'sessionStarted':
            this._sessionId = event.data.sessionId;
            break;
        }
        this.trigger(event.data.action, event.data);
      },
    );
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    const offscreenCanvas = canvas.transferControlToOffscreen();
    this.sendRequest<SetCanvasRequest>(
      'setCanvas',
      {
        canvas: offscreenCanvas,
      },
      [offscreenCanvas],
    );
  }

  public setSource(
    source: string,
    frames: Array<string> | null | undefined,
  ): void {
    //source: {url: string; frames: Array<string>}): void {
    this.sendRequest<SetSourceRequest>('setSource', {
      source,
      frames,
    });
  }

  public terminate(): void {
    super.destroy();
    this.worker.terminate();
  }

  public play(): void {
    this.sendRequest<PlayRequest>('play');
  }

  public pause(): void {
    this.sendRequest<PauseRequest>('pause');
  }

  public stop(): void {
    this.sendRequest<StopRequest>('stop');
  }

  public goToFrame(index: number): void {
    this.sendRequest<FrameUpdateRequest>('frameUpdate', {
      index,
    });
  }

  public previousFrame(): void {
    const index = Math.max(0, this.frameIndex - 1);
    this.goToFrame(index);
  }

  public nextFrame(): void {
    const index = Math.min(this.frameIndex + 1, this.numberOfFrames - 1);
    this.goToFrame(index);
  }

  public set frame(index: number) {
    this.sendRequest<FrameUpdateRequest>('frameUpdate', {index});
  }

  createFilmstrip(width: number, height: number): Promise<ImageBitmap> {
    return new Promise((resolve, _reject) => {
      const handleFilmstripResponse = (
        event: MessageEvent<FilmstripResponse>,
      ) => {
        if (event.data.action === 'filmstrip') {
          this.worker.removeEventListener('message', handleFilmstripResponse);
          resolve(event.data.filmstrip);
        }
      };

      this.worker.addEventListener('message', handleFilmstripResponse);

      this.sendRequest<FilmstripRequest>('filmstrip', {
        width,
        height,
      });
    });
  }

  setEffect(name: keyof Effects, index: EffectIndex, options?: EffectOptions) {
    this.sendRequest<SetEffectRequest>('setEffect', {
      name,
      index,
      options,
    });
  }

  encodeVideo(): void {
    this.sendRequest<EncodeVideoRequest>('encodeVideo');
  }

  encodeMasksMetrics(): void {
    this.sendRequest<EncodeMasksMetricsRequest>('encodeMasksMetrics');
  }

  initializeTracker(name: keyof Trackers, options: TrackerOptions): void {
    this.sendRequest<InitializeTrackerRequest>('initializeTracker', {
      name,
      options,
    });
  }

  startSession(
    videoUrl: string,
    index: number,
  ): Promise<{sessionId: string; index: number} | null> {
    return new Promise(resolve => {
      const handleResponse = (
        event: MessageEvent<
          SessionStartedResponse | SessionStartFailedResponse
        >,
      ) => {
        if (event.data.action === 'sessionStarted') {
          this.worker.removeEventListener('message', handleResponse);
          resolve({sessionId: event.data.sessionId, index: index});
        }
        if (event.data.action === 'sessionStartFailed') {
          this.worker.removeEventListener('message', handleResponse);
          resolve(null);
        }
      };

      this.worker.addEventListener('message', handleResponse);
      this.sendRequest<StartSessionRequest>('startSession', {
        videoUrl,
        index,
      });
    });
  }

  closeSession(): void {
    this.sendRequest<CloseSessionRequest>('closeSession');
  }

  logAnnotations(): void {
    this.sendRequest<LogAnnotationsRequest>('logAnnotations');
  }

  createTracklet(): Promise<BaseTracklet> {
    return new Promise(resolve => {
      const handleResponse = (event: MessageEvent<TrackletCreatedResponse>) => {
        if (event.data.action === 'trackletCreated') {
          this.worker.removeEventListener('message', handleResponse);
          resolve(event.data.tracklet);
        }
      };

      this.worker.addEventListener('message', handleResponse);

      this.sendRequest<CreateTrackletRequest>('createTracklet');
    });
  }

  deleteTracklet(trackletId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const handleResponse = (event: MessageEvent<TrackletDeletedResponse>) => {
        if (event.data.action === 'trackletDeleted') {
          this.worker.removeEventListener('message', handleResponse);
          if (event.data.isSuccessful) {
            resolve();
          } else {
            reject(`could not delete tracklet ${trackletId}`);
          }
        }
      };
      this.worker.addEventListener('message', handleResponse);
      this.sendRequest<DeleteTrackletRequest>('deleteTracklet', {trackletId});
    });
  }

  updatePointsOrBox(
    objectId: number,
    points: SegmentationPoint[],
    box: Box,
  ): Promise<boolean> {
    return new Promise(resolve => {
      const handleResponse = (event: MessageEvent<AddPointsOrBoxResponse>) => {
        if (event.data.action === 'addPointsOrBox') {
          this.worker.removeEventListener('message', handleResponse);
          resolve(event.data.isSuccessful);
        }
      };

      this.worker.addEventListener('message', handleResponse);

      this.sendRequest<UpdatePointsOrBoxRequest>('updatePointsOrBox', {
        frameIndex: this.frame,
        objectId,
        points,
        box,
      });
    });
  }

  clearPromptsInFrame(objectId: number) {
    this.sendRequest<ClearPromptsInFrameRequest>('clearPromptsInFrame', {
      frameIndex: this.frame,
      objectId,
    });
  }

  clearPromptsInVideo(): Promise<boolean> {
    return new Promise(resolve => {
      const handleResponse = (
        event: MessageEvent<ClearPromptsInVideoResponse>,
      ) => {
        if (event.data.action === 'clearPromptsInVideo') {
          this.worker.removeEventListener('message', handleResponse);
          resolve(event.data.isSuccessful);
        }
      };
      this.worker.addEventListener('message', handleResponse);
      this.sendRequest<ClearPromptsInVideoRequest>('clearPromptsInVideo');
    });
  }

  streamMasks(): void {
    this.sendRequest<StreamMasksRequest>('streamMasks', {
      frameIndex: this.frame,
    });
  }

  abortStreamMasks(): Promise<void> {
    return new Promise(resolve => {
      const handleAbortResponse = (
        event: MessageEvent<StreamingStateUpdateResponse>,
      ) => {
        if (
          event.data.action === 'streamingStateUpdate' &&
          event.data.state === 'aborted'
        ) {
          this.worker.removeEventListener('message', handleAbortResponse);
          resolve();
        }
      };

      this.worker.addEventListener('message', handleAbortResponse);
      this.sendRequest<AbortStreamMasksRequest>('abortStreamMasks');
    });
  }

  getWorker_ONLY_USE_WITH_CAUTION(): Worker {
    return this.worker;
  }

  /**
   * Convenient function to have typed postMessage.
   *
   * @param action Video worker action
   * @param message Actual payload
   * @param transfer Any object that should be transferred instead of cloned
   */
  protected sendRequest<T extends VideoWorkerRequest | TrackerRequest>(
    action: T['action'],
    payload?: Omit<T, 'action'>,
    transfer?: Transferable[],
  ) {
    this.worker.postMessage(
      {
        action,
        ...payload,
      },
      {
        transfer,
      },
    );
  }

  // // Override EventEmitter

  // addEventListener<K extends keyof WorkerEventMap>(
  //   type: K,
  //   listener: (ev: WorkerEventMap[K]) => unknown,
  // ): void {
  //   switch (type) {
  //     case 'frameUpdate':
  //       {
  //         const event: FrameUpdateEvent = {
  //           index: this.frameIndex,
  //         };
  //         // @ts-expect-error Incorrect typing. Not sure how to correctly type it
  //         listener(event);
  //       }
  //       break;
  //     case 'sessionStarted': {
  //       if (this.sessionId !== null) {
  //         const event: SessionStartedEvent = {
  //           sessionId: this.sessionId,
  //         };
  //         // @ts-expect-error Incorrect typing. Not sure how to correctly type it
  //         listener(event);
  //       }
  //     }
  //   }
  //   super.addEventListener(type, listener);
  // }
}
