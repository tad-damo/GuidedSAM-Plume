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
 * - Replaced single-value atoms with array-based atoms for multi-video support.
 * - Adjusted tracking logic to handle multi-frame videos.
 * - Replaced `ClearAllPointsInVideoButton` with `ClearAllPromptsInVideoButton`.
 * - Added `NextVideoButton` for sequential video handling.
 * - Added `PrimaryCTAButton` to navigate to download tab when all videos are ready.
 */
import ClearAllPromptsInVideoButton from '@/common/components/annotations/ClearAllPromptsInVideoButton';
import TrackAndPlayButton from '@/common/components/button/TrackAndPlayButton';
import ToolbarBottomActionsWrapper from '@/common/components/toolbar/ToolbarBottomActionsWrapper';
import {DOWNLOAD_TOOLBAR_INDEX} from '@/common/components/toolbar/ToolbarConfig';
import {activeVideoIndexAtom, streamingStatesAtom} from '@/segmenter/atoms';
import {useAtomValue} from 'jotai';
import PrimaryCTAButton from './PrimaryCTAButton';
import {ChevronRight} from '@carbon/icons-react';
import useVideos from '../video/editor/useVideos';
import NextVideoButton from '../button/NextVideoButton';

type Props = {
  onTabChange: (newIndex: number) => void;
};

export default function ObjectsToolbarBottomActions({onTabChange}: Props) {
  const streamingStates = useAtomValue(streamingStatesAtom);
  const activeIndex = useAtomValue(activeVideoIndexAtom);
  const videos = useVideos();

  const activeVideoIsImage =
    videos[activeIndex]?.numberOfFrames > 1 ? false : true;

  const allStatesAreFull = streamingStates.every(
    (state, i) =>
      state === 'full' ||
      (state === 'required' && videos[i].numberOfFrames == 1),
  );
  const isTrackingEnabled =
    !activeVideoIsImage &&
    streamingStates[activeIndex] !== 'none' &&
    streamingStates[activeIndex] !== 'full';

  function handleSwitchToDownloadTab() {
    onTabChange(DOWNLOAD_TOOLBAR_INDEX);
  }

  return (
    <ToolbarBottomActionsWrapper>
      <ClearAllPromptsInVideoButton />
      {isTrackingEnabled && <TrackAndPlayButton />}
      {!allStatesAreFull && !isTrackingEnabled && <NextVideoButton />}
      {allStatesAreFull && (
        <PrimaryCTAButton
          onClick={handleSwitchToDownloadTab}
          endIcon={<ChevronRight />}>
          Get binary masks
        </PrimaryCTAButton>
      )}
    </ToolbarBottomActionsWrapper>
  );
}
