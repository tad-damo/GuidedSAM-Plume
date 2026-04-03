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
 * - Updated `setSource` to accept an optional `frames` array for pre-rendered image frames in addition to video URLs.
 * - Replaced `encode` handling with `encodeVideo` to call `context.encodeVideo()`.
 * - Added handling for `encodeMasksMetrics` to call `context.encodeMasksMetrics()`.
 * - Updated `startSession` to accept an `index` parameter and forward it to `tracker.startSession`.
 * - Replaced `updatePoints` with `updatePointsOrBox` to handle both segmentation points and bounding box data, and set `allowEffectAnimation(false)` to speed up rendering.
 * - Renamed `clearPointsInFrame` and `clearPointsInVideo` to `clearPromptsInFrame` and `clearPromptsInVideo`.
 * - Minor performance improvements: `allowEffectAnimation(false)` used when updating points/boxes or streaming masks.
 */
import {registerSerializableConstructors} from '@/common/error/ErrorSerializationUtils';
import {Tracker} from '@/common/tracker/Tracker';
import {TrackerRequestMessageEvent} from '@/common/tracker/TrackerTypes';
import {TRACKER_MAPPING} from '@/common/tracker/Trackers';
import {serializeError} from 'serialize-error';
import VideoWorkerContext from './VideoWorkerContext';
import {
  ErrorResponse,
  VideoWorkerRequestMessageEvent,
} from './VideoWorkerTypes';

registerSerializableConstructors();

const context = new VideoWorkerContext();
let tracker: Tracker | null = null;

let statsEnabled = false;

self.addEventListener(
  'message',
  async (
    event: VideoWorkerRequestMessageEvent | TrackerRequestMessageEvent,
  ) => {
    try {
      switch (event.data.action) {
        // Initialize context
        case 'setCanvas':
          context.setCanvas(event.data.canvas);
          break;
        case 'setSource':
          context.setSource(event.data.source, event.data.frames);
          break;

        // Playback
        case 'play':
          context.play();
          break;
        case 'pause':
          context.pause();
          break;
        case 'stop':
          context.stop();
          break;
        case 'frameUpdate':
          context.goToFrame(event.data.index);
          break;

        // Filmstrip
        case 'filmstrip': {
          const {width, height} = event.data;
          await context.createFilmstrip(width, height);
          break;
        }

        // Effects
        case 'setEffect': {
          const {name, index, options} = event.data;
          await context.setEffect(name, index, options);
          break;
        }

        // Encode
        case 'encodeVideo': {
          await context.encodeVideo();
          break;
        }

        case 'encodeMasksMetrics': {
          await context.encodeMasksMetrics();
          break;
        }

        case 'enableStats': {
          statsEnabled = true;
          context.enableStats();
          tracker?.enableStats();
          break;
        }

        // Tracker
        case 'initializeTracker': {
          const {name, options} = event.data;
          const Tracker = TRACKER_MAPPING[name];
          // Update the endpoint for the streaming API
          tracker = new Tracker(context, options);
          if (statsEnabled) {
            tracker.enableStats();
          }
          break;
        }
        case 'startSession': {
          const {videoUrl, index} = event.data;
          await tracker?.startSession(videoUrl, index);
          break;
        }
        case 'createTracklet':
          tracker?.createTracklet();
          break;
        case 'deleteTracklet':
          await tracker?.deleteTracklet(event.data.trackletId);
          break;
        case 'closeSession':
          tracker?.closeSession();
          break;
        case 'updatePointsOrBox': {
          const {frameIndex, objectId, points, box} = event.data;
          context.allowEffectAnimation(false); //speed up rendering
          await tracker?.updatePointsOrBox(frameIndex, objectId, points, box);
          break;
        }
        case 'clearPromptsInFrame': {
          const {frameIndex, objectId} = event.data;
          await tracker?.clearPromptsInFrame(frameIndex, objectId);
          break;
        }
        case 'clearPromptsInVideo':
          await tracker?.clearPromptsInVideo();
          break;
        case 'streamMasks': {
          const {frameIndex} = event.data;
          context.allowEffectAnimation(false);
          await tracker?.streamMasks(frameIndex);
          break;
        }
        case 'abortStreamMasks':
          tracker?.abortStreamMasks();
          break;
      }
    } catch (error) {
      const serializedError = serializeError(error);
      const errorResponse: ErrorResponse = {
        action: 'error',
        error: serializedError,
      };
      self.postMessage(errorResponse);
    }
  },
);
