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
 * - Updated imports.
 * - Replaced use of single-value atoms with array-based atoms for multi-video support.
 * - Added `PromptsToggle` component in a `bottomSection` for toolbar UI.
 * - Updated description text to handle multi-frame videos and review states.
 * - Integrated `useVideo` to check `numberOfFrames`.
 */
import ToolbarHeaderWrapper from '@/common/components/toolbar/ToolbarHeaderWrapper';
import {
  activeVideoIndexAtom,
  isStreamingAtom,
  streamingStatesAtom,
} from '@/segmenter/atoms';
import {useAtomValue} from 'jotai';
import PromptsToggle from './PromptsToggle';
import useVideo from '../video/editor/useVideo';

export default function ObjectsToolbarHeader() {
  const isStreaming = useAtomValue(isStreamingAtom);
  const activeIndex = useAtomValue(activeVideoIndexAtom);
  const streamingStates = useAtomValue(streamingStatesAtom);
  const video = useVideo();

  const bottomSection = (
    <div className="w-full flex justify-center">
      <div className="w-full bg-black rounded-lg flex flex-col gap-3 p-3">
        Prompt type
        <PromptsToggle />
      </div>
    </div>
  );

  return (
    <ToolbarHeaderWrapper
      title={
        streamingStates[activeIndex] === 'full'
          ? 'Review tracked object'
          : isStreaming
            ? 'Tracking objects'
            : 'Select objects'
      }
      description={
        (video.numberOfFrames > 1 &&
          (streamingStates[activeIndex] === 'full'
            ? 'Review your selected objects across the video, and continue to edit if needed. Once everything looks good, press “Get binary masks” to continue.'
            : isStreaming
              ? 'Watch the video closely for any places where your objects aren’t tracked correctly. You can also stop tracking to make additional edits.'
              : 'Adjust the selection of your objects. Press “Track objects” to track your objects throughout the video.')) ||
        'Adjust the selection of your objects. Once everything looks good, press “Approve masks” or “Get binary masks” to continue.'
      }
      className="mb-8"
      bottomSection={bottomSection}
    />
  );
}
