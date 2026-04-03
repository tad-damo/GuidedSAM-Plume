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
 * - Added `createArrayBuffersFromFramesGenerator` to convert frames to JPEG ArrayBuffers.
 */
import {ImageFrame} from '@/common/codecs/VideoDecoder';
import {MP4ArrayBuffer, createFile} from 'mp4box';

// The selection of timescale and seconds/key-frame value are
// explained in the following docs: https://github.com/vjeux/mp4-h264-re-encode
const TIMESCALE = 90000;
const SECONDS_PER_KEY_FRAME = 2;

export function encode(
  width: number,
  height: number,
  numFrames: number,
  framesGenerator: AsyncGenerator<ImageFrame, unknown>,
  progressCallback?: (progress: number) => void,
): Promise<MP4ArrayBuffer> {
  return new Promise((resolve, reject) => {
    let encodedFrameIndex = 0;
    let nextKeyFrameTimestamp = 0;
    let trackID: number | null = null;
    const durations: number[] = [];

    const outputFile = createFile();

    const encoder = new VideoEncoder({
      output(chunk, metaData) {
        const uint8 = new Uint8Array(chunk.byteLength);
        chunk.copyTo(uint8);

        const description = metaData?.decoderConfig?.description;
        if (trackID === null) {
          trackID = outputFile.addTrack({
            width: width,
            height: height,
            timescale: TIMESCALE,
            avcDecoderConfigRecord: description,
          });
        }
        const shiftedDuration = durations.shift();
        if (shiftedDuration != null) {
          outputFile.addSample(trackID, uint8, {
            duration: getScaledDuration(shiftedDuration),
            is_sync: chunk.type === 'key',
          });
          encodedFrameIndex++;
          progressCallback?.(encodedFrameIndex / numFrames);
        }

        if (encodedFrameIndex === numFrames) {
          resolve(outputFile.getBuffer());
        }
      },
      error(error) {
        reject(error);
        return;
      },
    });

    const setConfigurationAndEncodeFrames = async () => {
      // The codec value was taken from the following implementation and seems
      // reasonable for our use case for now:
      // https://github.com/vjeux/mp4-h264-re-encode/blob/main/mp4box.html#L103

      // Additional details about codecs can be found here:
      //  - https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter
      //  - https://www.w3.org/TR/webcodecs-codec-registry/#video-codec-registry
      //
      // The following setting is a good compromise between output video file
      // size and quality. The latencyMode "realtime" is needed for Safari,
      // which otherwise will produce 20x larger files when in quality
      // latencyMode. Chrome does a really good job with file size even when
      // latencyMode is set to quality.
      const configuration: VideoEncoderConfig = {
        codec: 'avc1.4d0034',
        width: roundToNearestEven(width),
        height: roundToNearestEven(height),
        bitrate: 14_000_000,
        alpha: 'discard',
        bitrateMode: 'variable',
        latencyMode: 'realtime',
      };
      const supportedConfig =
        await VideoEncoder.isConfigSupported(configuration);
      if (supportedConfig.supported === true) {
        encoder.configure(configuration);
      } else {
        throw new Error(
          `Unsupported video encoder config ${JSON.stringify(supportedConfig)}`,
        );
      }

      for await (const frame of framesGenerator) {
        const {bitmap, duration, timestamp} = frame;
        durations.push(duration);
        let keyFrame = false;
        if (timestamp >= nextKeyFrameTimestamp) {
          await encoder.flush();
          keyFrame = true;
          nextKeyFrameTimestamp = timestamp + SECONDS_PER_KEY_FRAME * 1e6;
        }
        encoder.encode(bitmap, {keyFrame});
        bitmap.close();
      }

      await encoder.flush();
      encoder.close();
    };

    setConfigurationAndEncodeFrames();
  });
}

export async function createArrayBuffersFromFramesGenerator(
  width: number,
  height: number,
  numFrames: number,
  framesGenerator: AsyncGenerator<ImageFrame, unknown>,
  progressCallback?: (progress: number) => void,
): Promise<ArrayBuffer[]> {
  let frameIndex = 0;
  const arrayBuffers: ArrayBuffer[] = [];

  for await (const frame of framesGenerator) {
    const {bitmap} = frame;

    // Draw frame into an OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvas.convertToBlob({type: 'image/jpeg', quality: 0.9});
    const arrayBuffer = await blob.arrayBuffer();
    arrayBuffers.push(arrayBuffer);

    // Update progress
    frameIndex++;
    progressCallback?.(frameIndex / numFrames);

    bitmap.close();
  }
  return arrayBuffers;
}

function getScaledDuration(rawDuration: number) {
  return rawDuration / (1_000_000 / TIMESCALE);
}

function roundToNearestEven(dim: number) {
  const rounded = Math.round(dim);

  if (rounded % 2 === 0) {
    return rounded;
  } else {
    return rounded + (rounded > dim ? -1 : 1);
  }
}
