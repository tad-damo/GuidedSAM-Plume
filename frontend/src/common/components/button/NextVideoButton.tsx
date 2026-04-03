/**
 * Copyright (c) 2025
 * Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
 *
 * Authors
 * Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
 * Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
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
 */
import PrimaryCTAButton from '@/common/components/button/PrimaryCTAButton';
import {
  activeTrackletObjectIdAtom,
  activeVideoIndexAtom,
  streamingStatesAtom,
} from '@/segmenter/atoms';
import {ChevronRight} from '@carbon/icons-react';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import useVideos from '../video/editor/useVideos';

export default function NextVideoButton() {
  const [activeIndex, setActiveIndex] = useAtom(activeVideoIndexAtom);
  const setActiveObjectId = useSetAtom(activeTrackletObjectIdAtom);
  const streamingStates = useAtomValue(streamingStatesAtom);
  const videos = useVideos();

  function handleNextVideo() {
    const videosLength = videos.length;

    for (let i = activeIndex; i <= videosLength; i++) {
      if (i >= videosLength) {
        i = 0;
      }
      const state = streamingStates[i];
      const isFull =
        state === 'full' ||
        (state === 'required' && videos[i].numberOfFrames == 1);

      if (!isFull) {
        setActiveIndex(i);
        setActiveObjectId(0);
        return;
      }
    }
  }

  return (
    <PrimaryCTAButton
      onClick={handleNextVideo}
      endIcon={<ChevronRight size={20} />}>
      {'Approve masks'}
    </PrimaryCTAButton>
  );
}
