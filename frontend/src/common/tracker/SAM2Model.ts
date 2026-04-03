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
 * - Switched from point-only prompts to a unified prompts system supporting both points and bounding boxes.
 * - Updated session and tracklet structures to support multi-video workflows, including tracking video index.
 * - Adjusted GraphQL mutations and responses to handle the new prompts format (`AddPointsOrBox`, `ClearPrompts*`).
 * - Extended mask data to include metadata (contours and morph parameters) and updated streaming parsing to handle it.
 * - Updated tracklet creation, update, and clearing logic to manage boxes and metadata alongside masks.
 * - Updated streaming state and tracklet update notifications to include video identifiers.
 * - Adjusted session start, cleanup, and clear operations to work with multi-video sessions and new prompts handling.
 */
import {generateThumbnail} from '@/common/components/video/editor/VideoEditorUtils';
import VideoWorkerContext from '@/common/components/video/VideoWorkerContext';
import Logger from '@/common/logger/Logger';
import {
  SAM2ModelAddNewPointsOrBoxMutation,
  SAM2ModelAddNewPointsOrBoxMutation$data,
} from '@/common/tracker/__generated__/SAM2ModelAddNewPointsOrBoxMutation.graphql';
import {SAM2ModelCancelPropagateInVideoMutation} from '@/common/tracker/__generated__/SAM2ModelCancelPropagateInVideoMutation.graphql';
import {SAM2ModelClearPromptsInFrameMutation} from '@/common/tracker/__generated__/SAM2ModelClearPromptsInFrameMutation.graphql';
import {SAM2ModelClearPromptsInVideoMutation} from '@/common/tracker/__generated__/SAM2ModelClearPromptsInVideoMutation.graphql';
import {SAM2ModelCloseSessionMutation} from '@/common/tracker/__generated__/SAM2ModelCloseSessionMutation.graphql';
import {SAM2ModelRemoveObjectMutation} from '@/common/tracker/__generated__/SAM2ModelRemoveObjectMutation.graphql';
import {SAM2ModelStartSessionMutation} from '@/common/tracker/__generated__/SAM2ModelStartSessionMutation.graphql';
import {
  BaseTracklet,
  Box,
  Mask,
  SegmentationPoint,
  StreamingState,
  Tracker,
  Tracklet,
} from '@/common/tracker/Tracker';
import {TrackerOptions} from '@/common/tracker/Trackers';
import {
  ClearPromptsInVideoResponse,
  SessionStartFailedResponse,
  SessionStartedResponse,
  StreamingCompletedResponse,
  StreamingStartedResponse,
  StreamingStateUpdateResponse,
  TrackletCreatedResponse,
  TrackletDeletedResponse,
  TrackletsUpdatedResponse,
} from '@/common/tracker/TrackerTypes';
import {convertMaskToRGBA} from '@/common/utils/MaskUtils';
import multipartStream from '@/common/utils/MultipartStream';
import {Stats} from '@/debug/stats/Stats';
import {INFERENCE_API_ENDPOINT} from '@/segmenter/SegmenterConfig';
import {createEnvironment} from '@/graphql/RelayEnvironment';
import {
  DataArray,
  Masks,
  RLEObject,
  decode,
  encode,
  toBbox,
} from '@/jscocotools/mask';
import {THEME_COLORS} from '@/theme/colors';
import invariant from 'invariant';
import {IEnvironment, commitMutation, graphql} from 'relay-runtime';

type Options = Pick<TrackerOptions, 'inferenceEndpoint'>;

type Session = {
  id: string | null;
  videoIndex: number | null;
  tracklets: {[id: number]: Tracklet};
};

type StreamMasksResult = {
  frameIndex: number;
  rleMaskList: Array<{
    objectId: number;
    rleMask: RLEObject;
    metadata: {
      contoursCoords: Array<Array<Array<number>>>;
      morphParams: string;
    };
  }>;
};

type StreamMasksAbortResult = {
  aborted: boolean;
};

export class SAM2Model extends Tracker {
  private _endpoint: string;
  private _environment: IEnvironment;

  private abortController: AbortController | null = null;
  private _session: Session = {
    id: null,
    videoIndex: null,
    tracklets: {},
  };
  private _streamingState: StreamingState = 'none';

  private _emptyMask: RLEObject | null = null;

  private _maskCanvas: OffscreenCanvas;
  private _maskCtx: OffscreenCanvasRenderingContext2D;

  private _stats?: Stats;

  constructor(
    context: VideoWorkerContext,
    options: Options = {
      inferenceEndpoint: INFERENCE_API_ENDPOINT,
    },
  ) {
    super(context);
    this._endpoint = options.inferenceEndpoint;
    this._environment = createEnvironment(options.inferenceEndpoint);

    this._maskCanvas = new OffscreenCanvas(0, 0);
    const maskCtx = this._maskCanvas.getContext('2d');
    invariant(maskCtx != null, 'context cannot be null');
    this._maskCtx = maskCtx;
  }

  public startSession(videoPath: string, videoIndex: number): Promise<void> {
    // Reset streaming state. Force update with the true flag to make sure the
    // UI updates its state.
    this._updateStreamingState('none', true);

    return new Promise(resolve => {
      try {
        commitMutation<SAM2ModelStartSessionMutation>(this._environment, {
          mutation: graphql`
            mutation SAM2ModelStartSessionMutation($input: StartSessionInput!) {
              startSession(input: $input) {
                sessionId
              }
            }
          `,
          variables: {
            input: {
              path: videoPath,
            },
          },
          onCompleted: response => {
            const {sessionId} = response.startSession;
            this._session.id = sessionId;
            this._session.videoIndex = videoIndex;

            this._sendResponse<SessionStartedResponse>('sessionStarted', {
              sessionId: sessionId,
              index: videoIndex,
            });

            // Clear any tracklets from the previous session when
            // a new session is started
            this._clearTracklets();

            // Make an empty tracklet
            this.createTracklet();
            resolve();
          },
          onError: error => {
            Logger.error(error);
            this._sendResponse<SessionStartFailedResponse>(
              'sessionStartFailed',
            );
            resolve();
          },
        });
      } catch (error) {
        Logger.error(error);
        this._sendResponse<SessionStartFailedResponse>('sessionStartFailed');
        resolve();
      }
    });
  }

  public closeSession(): Promise<void> {
    const sessionId = this._session.id;

    // Do not call cleanup before retrieving the session id because cleanup
    // will reset the session id. If the order would be changed, it would
    // never execute the closeSession mutation.
    this._cleanup();

    if (sessionId === null) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      commitMutation<SAM2ModelCloseSessionMutation>(this._environment, {
        mutation: graphql`
          mutation SAM2ModelCloseSessionMutation($input: CloseSessionInput!) {
            closeSession(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            sessionId,
          },
        },
        onCompleted: response => {
          const {success} = response.closeSession;
          if (success === false) {
            reject(new Error('Failed to close session'));
            return;
          }
          resolve();
        },
        onError: error => {
          Logger.error(error);
          reject(error);
        },
      });
    });
  }

  public createTracklet(): void {
    // This will return 0 for for empty tracklets and otherwise the next
    // largest number.
    const nextId =
      Object.values(this._session.tracklets).reduce(
        (prev, curr) => Math.max(prev, curr.id),
        -1,
      ) + 1;

    const newTracklet = {
      id: nextId,
      color: THEME_COLORS[nextId % THEME_COLORS.length],
      thumbnail: null,
      points: [],
      boxes: [],
      masks: [],
      isInitialized: false,
    };

    this._session.tracklets[nextId] = newTracklet;

    // Notify the main thread
    this._updateTracklets();

    this._sendResponse<TrackletCreatedResponse>('trackletCreated', {
      tracklet: newTracklet,
    });
  }

  public deleteTracklet(trackletId: number): Promise<void> {
    const sessionId = this._session.id;
    if (sessionId === null) {
      return Promise.reject('No active session');
    }

    const tracklet = this._session.tracklets[trackletId];
    invariant(
      tracklet != null,
      'tracklet for tracklet id %s not initialized',
      trackletId,
    );

    return new Promise((resolve, reject) => {
      commitMutation<SAM2ModelRemoveObjectMutation>(this._environment, {
        mutation: graphql`
          mutation SAM2ModelRemoveObjectMutation($input: RemoveObjectInput!) {
            removeObject(input: $input) {
              frameIndex
              rleMaskList {
                objectId
                metadata {
                  contoursCoords
                  morphParams
                }
                rleMask {
                  counts
                  size
                }
              }
            }
          }
        `,
        variables: {
          input: {objectId: trackletId, sessionId},
        },
        onCompleted: response => {
          const trackletUpdates = response.removeObject;
          this._sendResponse<TrackletDeletedResponse>('trackletDeleted', {
            isSuccessful: true,
          });
          for (const trackletUpdate of trackletUpdates) {
            this._updateTrackletMasks(
              trackletUpdate,
              trackletUpdate.frameIndex === this._context.frameIndex,
              false, // shouldGoToFrame
            );
          }
          this._removeTrackletMasks(tracklet);
          resolve();
        },
        onError: error => {
          this._sendResponse<TrackletDeletedResponse>('trackletDeleted', {
            isSuccessful: false,
          });
          Logger.error(error);
          reject(error);
        },
      });
    });
  }

  public updatePointsOrBox(
    frameIndex: number,
    objectId: number,
    points: SegmentationPoint[],
    box: Box,
  ): Promise<void> {
    const sessionId = this._session.id;
    if (sessionId === null) {
      return Promise.reject('No active session');
    }

    // TODO: This is not the right place to initialize the empty mask.
    // Move this into the constructor and listen to events on the context.
    // Note, the initial context.width and context.height is 0, so it needs
    // to happen based on an event, so when the video is initialized, it needs
    // to notify the tracker to update the empty mask.
    if (this._emptyMask === null) {
      // We need to round the height/width to the nearest integer since
      // Masks.toTensor() expects an integer value for the height/width.
      const tensor = new Masks(
        Math.trunc(this._context.height),
        Math.trunc(this._context.width),
        1,
      ).toDataArray();
      this._emptyMask = encode(tensor)[0];
    }

    const tracklet = this._session.tracklets[objectId];
    invariant(
      tracklet != null,
      'tracklet for object id %s not initialized',
      objectId,
    );

    // Mark session needing propagation when point is set
    this._updateStreamingState('required', true);

    // Clear all points in frame if no prompts are provided.
    if (points.length === 0 && !box) {
      return this.clearPromptsInFrame(frameIndex, objectId);
    }
    return new Promise((resolve, reject) => {
      const normalizedBox = box
        ? [
            box[0] / this._context.width,
            box[1] / this._context.height,
            box[2] / this._context.width,
            box[3] / this._context.height,
          ]
        : null;

      const normalizedPoints = points.map(p => [
        p[0] / this._context.width,
        p[1] / this._context.height,
      ]);
      const labels = points.map(p => p[2]);
      commitMutation<SAM2ModelAddNewPointsOrBoxMutation>(this._environment, {
        mutation: graphql`
          mutation SAM2ModelAddNewPointsOrBoxMutation(
            $input: AddPointsOrBoxInput!
          ) {
            addPointsOrBox(input: $input) {
              frameIndex
              rleMaskList {
                objectId
                metadata {
                  contoursCoords
                  morphParams
                }
                rleMask {
                  counts
                  size
                }
              }
            }
          }
        `,
        variables: {
          input: {
            sessionId,
            frameIndex,
            objectId,
            labels: labels,
            points: normalizedPoints,
            clearOldPoints: true,
            box: normalizedBox,
          },
        },
        onCompleted: response => {
          tracklet.points[frameIndex] = points;
          tracklet.boxes[frameIndex] = box;
          tracklet.isInitialized = true;
          this._updateTrackletMasks(response.addPointsOrBox, true);
          resolve();
        },
        onError: error => {
          Logger.error(error);
          reject(error);
        },
      });
    });
  }

  public clearPromptsInFrame(
    frameIndex: number,
    objectId: number,
  ): Promise<void> {
    const sessionId = this._session.id;
    if (sessionId === null) {
      return Promise.reject('No active session');
    }

    const tracklet = this._session.tracklets[objectId];
    invariant(
      tracklet != null,
      'tracklet for object id %s not initialized',
      objectId,
    );

    // Mark session needing propagation when point is set
    this._updateStreamingState('required', true);

    return new Promise((resolve, reject) => {
      commitMutation<SAM2ModelClearPromptsInFrameMutation>(this._environment, {
        mutation: graphql`
          mutation SAM2ModelClearPromptsInFrameMutation(
            $input: ClearPromptsInFrameInput!
          ) {
            clearPromptsInFrame(input: $input) {
              frameIndex
              rleMaskList {
                objectId
                metadata {
                  contoursCoords
                  morphParams
                }
                rleMask {
                  counts
                  size
                }
              }
            }
          }
        `,
        variables: {
          input: {
            sessionId,
            frameIndex,
            objectId,
          },
        },
        onCompleted: response => {
          tracklet.points[frameIndex] = [];
          tracklet.boxes[frameIndex] = null;
          tracklet.isInitialized = true;
          this._updateTrackletMasks(response.clearPromptsInFrame, true);
          resolve();
        },
        onError: error => {
          Logger.error(error);
          reject(error);
        },
      });
    });
  }

  public clearPromptsInVideo(): Promise<void> {
    const sessionId = this._session.id;
    if (sessionId === null) {
      return Promise.reject('No active session');
    }

    // Mark session needing propagation when point is set
    this._updateStreamingState('none');

    return new Promise(resolve => {
      commitMutation<SAM2ModelClearPromptsInVideoMutation>(this._environment, {
        mutation: graphql`
          mutation SAM2ModelClearPromptsInVideoMutation(
            $input: ClearPromptsInVideoInput!
          ) {
            clearPromptsInVideo(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            sessionId,
          },
        },
        onCompleted: response => {
          const {success} = response.clearPromptsInVideo;
          if (!success) {
            this._sendResponse<ClearPromptsInVideoResponse>(
              'clearPromptsInVideo',
              {isSuccessful: false},
            );
            return;
          }

          // Reset points and masks for each tracklet
          this._clearTracklets();

          // Make an empty tracklet
          this.createTracklet();

          // Notify the main thread
          this._context.goToFrame(this._context.frameIndex);
          this._updateTracklets();
          this._sendResponse<ClearPromptsInVideoResponse>(
            'clearPromptsInVideo',
            {
              isSuccessful: true,
            },
          );
          resolve();
        },
        onError: error => {
          this._sendResponse<ClearPromptsInVideoResponse>(
            'clearPromptsInVideo',
            {
              isSuccessful: false,
            },
          );
          Logger.error(error);
        },
      });
    });
  }

  public async streamMasks(frameIndex: number): Promise<void> {
    const sessionId = this._session.id;
    if (sessionId === null) {
      return Promise.reject('No active session');
    }
    try {
      this._sendResponse<StreamingStartedResponse>('streamingStarted');

      // 1. Clear previous masks
      this._context.clearMasks();
      this._clearTrackletMasks();

      // 2. Create abort controller and async generator
      const controller = new AbortController();
      this.abortController = controller;

      this._updateStreamingState('requesting');
      const generator = this._streamMasksForSession(
        controller,
        sessionId,
        frameIndex,
      );

      // 3. parse stream response and update masks in session objects
      let isAborted = false;
      for await (const result of generator) {
        if ('aborted' in result) {
          this._updateStreamingState('aborting');
          await this._abortRequest();
          this._updateStreamingState('aborted');
          isAborted = true;
        } else {
          await this._updateTrackletMasks(result, false);
          this._updateStreamingState('partial');
        }
      }

      if (!isAborted) {
        // Mark session needing propagation when point is set
        this._updateStreamingState('full');
      }
    } catch (error) {
      Logger.error(error);
      throw error;
    }

    this._sendResponse<StreamingCompletedResponse>('streamingCompleted');
  }

  public abortStreamMasks() {
    this.abortController?.abort();
    this._sendResponse<StreamingCompletedResponse>('streamingCompleted');
  }

  public enableStats(): void {
    this._stats = new Stats('ms', 'D', 1000 / 25);
  }

  // PRIVATE

  private _cleanup() {
    this._session.id = null;
    this._session.videoIndex = null;
    // Clear existing tracklets
    this._session.tracklets = [];
  }

  private _clearTracklets() {
    this._session.tracklets = [];
    this._context.clearMasks();
  }

  private _updateStreamingState(
    state: StreamingState,
    forceUpdate: boolean = false,
  ) {
    const videoIndex = this._session.videoIndex;
    if (videoIndex === null) {
      return;
    }
    if (!forceUpdate && this._streamingState === state) {
      return;
    }
    this._streamingState = state;
    this._sendResponse<StreamingStateUpdateResponse>('streamingStateUpdate', {
      state,
      videoId: videoIndex,
    });
  }

  private async _removeTrackletMasks(tracklet: Tracklet) {
    this._context.clearTrackletMasks(tracklet);
    delete this._session.tracklets[tracklet.id];

    // Notify the main thread
    this._context.goToFrame(this._context.frameIndex);
    this._updateTracklets();
  }

  private async _updateTrackletMasks(
    data: SAM2ModelAddNewPointsOrBoxMutation$data['addPointsOrBox'],
    updateThumbnails: boolean,
    shouldGoToFrame: boolean = true,
  ) {
    const {frameIndex, rleMaskList} = data;

    // 1. parse and decode masks for all objects
    for (const {objectId, metadata, rleMask} of rleMaskList) {
      const track = this._session.tracklets[objectId];
      const {size, counts} = rleMask;
      const rleObject: RLEObject = {
        size: [size[0], size[1]],
        counts: counts,
      };
      const isEmpty = counts === this._emptyMask?.counts;

      this._stats?.begin();

      const decodedMask = decode([rleObject]);
      const bbox = toBbox([rleObject]);

      const mask: Mask = {
        data: rleObject as RLEObject,
        contours: metadata.contoursCoords.map(arr =>
          arr.map(a => [...a] as number[]),
        ),
        morphParams: JSON.parse(metadata.morphParams),
        shape: [...decodedMask.shape],
        bounds: [
          [bbox[0], bbox[1]],
          [bbox[0] + bbox[2], bbox[1] + bbox[3]],
        ],
        isEmpty,
        overlayRendered: false,
      } as const;
      track.masks[frameIndex] = mask;

      if (updateThumbnails && !isEmpty) {
        const {ctx} = await this._compressMaskForCanvas(decodedMask);
        const frame = this._context.currentFrame as VideoFrame;
        await generateThumbnail(track, frameIndex, mask, frame, ctx);
      }
    }

    this._context.updateTracklets(
      frameIndex,
      Object.values(this._session.tracklets),
      shouldGoToFrame,
    );

    // Notify the main thread
    this._updateTracklets();
  }

  private _updateTracklets() {
    const videoIndex = this._session.videoIndex;
    if (videoIndex === null) {
      return;
    }
    const tracklets: BaseTracklet[] = Object.values(
      this._session.tracklets,
    ).map(tracklet => {
      // Notify the main thread
      const {
        id,
        color,
        isInitialized,
        points: trackletPoints,
        boxes: trackletBoxes,
        thumbnail,
        masks,
      } = tracklet;
      return {
        id,
        color,
        isInitialized,
        points: trackletPoints,
        boxes: trackletBoxes,
        thumbnail,
        masks: masks.map(mask => ({
          shape: mask.shape,
          bounds: mask.bounds,
          contours: mask.contours,
          morphParams: mask.morphParams,
          isEmpty: mask.isEmpty,
        })),
      };
    });

    this._sendResponse<TrackletsUpdatedResponse>('trackletsUpdated', {
      tracklets,
      videoIndex,
    });
  }

  private _clearTrackletMasks() {
    const keys = Object.keys(this._session.tracklets);
    for (const key of keys) {
      const trackletId = Number(key);
      const tracklet = {...this._session.tracklets[trackletId], masks: []};
      this._session.tracklets[trackletId] = tracklet;
    }
    this._updateTracklets();
  }

  private async _compressMaskForCanvas(
    decodedMask: DataArray,
  ): Promise<{compressedData: Blob; ctx: OffscreenCanvasRenderingContext2D}> {
    const data = convertMaskToRGBA(decodedMask.data as Uint8Array);

    this._maskCanvas.width = decodedMask.shape[0];
    this._maskCanvas.height = decodedMask.shape[1];

    const imageData = new ImageData(
      data,
      decodedMask.shape[0],
      decodedMask.shape[1],
    );
    this._maskCtx.putImageData(imageData, 0, 0);

    const canvas = new OffscreenCanvas(
      decodedMask.shape[1],
      decodedMask.shape[0],
    );

    const ctx = canvas.getContext('2d');
    invariant(ctx != null, 'context cannot be null');
    ctx.save();
    ctx.rotate(Math.PI / 2);
    // Since the image was previously rotated 90° clockwise, after the image is rotated,
    // we scale the canvas's width using scaleY and height using scaleX.
    ctx.scale(1, -1);
    ctx.drawImage(this._maskCanvas, 0, 0);
    ctx.restore();

    const compressedData = await canvas.convertToBlob({type: 'image/png'});

    return {compressedData, ctx};
  }

  private async *_streamMasksForSession(
    abortController: AbortController,
    sessionId: string,
    startFrameIndex: undefined | number = 0,
  ): AsyncGenerator<StreamMasksResult | StreamMasksAbortResult, undefined> {
    const url = `${this._endpoint}/propagate_in_video`;

    const requestBody = {
      session_id: sessionId,
      start_frame_index: startFrameIndex,
    };

    const headers: {[name: string]: string} = Object.assign({
      'Content-Type': 'application/json',
    });

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers,
    });

    const contentType = response.headers.get('Content-Type');
    if (
      contentType == null ||
      !contentType.startsWith('multipart/x-savi-stream;')
    ) {
      throw new Error(
        'endpoint needs to support Content-Type "multipart/x-savi-stream"',
      );
    }

    const responseBody = response.body;
    if (responseBody == null) {
      throw new Error('response body is null');
    }

    const reader = multipartStream(contentType, responseBody).getReader();

    const textDecoder = new TextDecoder();

    while (true) {
      if (abortController.signal.aborted) {
        reader.releaseLock();
        yield {aborted: true};
        return;
      }

      const {done, value} = await reader.read();
      if (done) {
        return;
      }

      const {headers, body} = value;

      const contentType = headers.get('Content-Type') as string;

      if (contentType.startsWith('application/json')) {
        const jsonResponse = JSON.parse(textDecoder.decode(body));
        const maskResults = jsonResponse.results;
        const rleMaskList = maskResults.map(
          (mask: {
            object_id: number;
            contours: Array<Array<Array<number>>>;
            morph_params: string;
            mask: RLEObject;
          }) => {
            return {
              objectId: mask.object_id,
              metadata: {
                contoursCoords: mask.contours,
                morphParams: mask.morph_params,
              },
              rleMask: mask.mask,
            };
          },
        );
        yield {
          frameIndex: jsonResponse.frame_index,
          rleMaskList,
        };
      }
    }
  }

  private async _abortRequest(): Promise<void> {
    const sessionId = this._session.id;
    invariant(sessionId != null, 'session id cannot be empty');
    return new Promise((resolve, reject) => {
      try {
        commitMutation<SAM2ModelCancelPropagateInVideoMutation>(
          this._environment,
          {
            mutation: graphql`
              mutation SAM2ModelCancelPropagateInVideoMutation(
                $input: CancelPropagateInVideoInput!
              ) {
                cancelPropagateInVideo(input: $input) {
                  success
                }
              }
            `,
            variables: {
              input: {
                sessionId,
              },
            },
            onCompleted: response => {
              const {success} = response.cancelPropagateInVideo;
              if (!success) {
                reject(`could not abort session ${sessionId}`);
                return;
              }
              resolve();
            },
            onError: error => {
              Logger.error(error);
              reject(error);
            },
          },
        );
      } catch (error) {
        Logger.error(error);
        reject(error);
      }
    });
  }
}
