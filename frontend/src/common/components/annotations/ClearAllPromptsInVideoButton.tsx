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
 * - Renamed `ClearAllPointsInVideoButton` to `ClearAllPromptsInVideoButton`
 * - Updated imports.
 * - Replaced `labelTypeAtom` with `promptTypeAtom`.
 * - Removed `onRestart` callback; handled clear action internally.
 * - Changed logic to clear "prompts" instead of "points" in the video.
 * - Reset active tracklet ID and prompt type after clearing.
 * - Updated button text, icon, and styling for prompts workflow.
 */
import useVideo from '@/common/components/video/editor/useVideo';
import {
  activeTrackletObjectIdAtom,
  isPlayingAtom,
  isStreamingAtom,
  promptTypeAtom,
} from '@/segmenter/atoms';
import {TrashCan} from '@carbon/icons-react';
import stylex from '@stylexjs/stylex';
import {useAtomValue, useSetAtom} from 'jotai';
import {useState} from 'react';
import {Button, Loading} from 'react-daisyui';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
});

export default function ClearAllPromptsInVideoButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isPlaying = useAtomValue(isPlayingAtom);
  const isStreaming = useAtomValue(isStreamingAtom);
  const setPromptType = useSetAtom(promptTypeAtom);
  const setActiveTrackletObjectId = useSetAtom(activeTrackletObjectIdAtom);

  const video = useVideo();

  async function handleClear() {
    if (video === null) {
      return;
    }

    setIsLoading(true);
    if (isPlaying) {
      video.pause();
    }
    if (isStreaming) {
      await video.abortStreamMasks();
    }
    const isSuccessful = await video.clearPromptsInVideo();
    if (isSuccessful) {
      setActiveTrackletObjectId(0);
      setPromptType('box');
      setIsLoading(false);
      video.frame = 0;
      setPromptType('box');
    }
  }

  return (
    <div {...stylex.props(styles.container)}>
      <Button
        color="ghost"
        onClick={handleClear}
        className="!px-4 h-12 !rounded-full font-medium text-white hover:bg-black flex items-center gap-2"
        startIcon={isLoading ? <Loading size="sm" /> : <TrashCan size={24} />}>
        Clear objects
      </Button>
    </div>
  );
}
