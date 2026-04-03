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
 * - Renamed hook from `useRestartSession` → `useCloseSessions`.
 * - Replaced single video (`useVideo` + `inputVideo`) with multiple videos (`useVideos` + `inputVideos`).
 * - Added `activeVideoIndexAtom` and `zoomScaleAtom` resets.
 * - Replaced `labelTypeAtom` with `promptTypeAtom`.
 * - Updated `restartSession` → `closeSessions` to loop through all videos, pausing and aborting streaming for each.
 * - Cleared all input videos via `setInputVideos([])` instead of handling a single video.
 */
import useInputVideos from '@/common/components/video/useInputVideo';
import {
  activeTrackletObjectIdAtom,
  activeVideoIndexAtom,
  isPlayingAtom,
  isStreamingAtom,
  promptTypeAtom,
  trackletObjectsAtom,
} from '@/segmenter/atoms';
import {useAtomValue, useSetAtom} from 'jotai';
import {useState} from 'react';
import {zoomScaleAtom} from '../video/editor/atoms';
import useVideos from '../video/editor/useVideos';

export default function useCloseSessions() {
  const [isLoading, setIsLoading] = useState<boolean>();
  const isPlaying = useAtomValue(isPlayingAtom);
  const isStreaming = useAtomValue(isStreamingAtom);
  const setActiveIndex = useSetAtom(activeVideoIndexAtom);
  const setActiveTrackletObjectId = useSetAtom(activeTrackletObjectIdAtom);
  const setTracklets = useSetAtom(trackletObjectsAtom);
  const setPromptType = useSetAtom(promptTypeAtom);
  const setZoomScale = useSetAtom(zoomScaleAtom);

  const {inputVideos, setInputVideos} = useInputVideos();
  const videos = useVideos();

  async function closeSessions(onRestart?: () => void) {
    if (!videos || !inputVideos) {
      return;
    }

    setIsLoading(true);
    for (const video of videos) {
      if (isPlaying) {
        video.pause();
      }

      if (isStreaming) {
        await video.abortStreamMasks();
      }
      video.frame = 0;
    }
    setInputVideos([]);
    setActiveIndex(0);
    setActiveTrackletObjectId(0);
    setTracklets([]);
    setPromptType('box');
    setZoomScale(1);
    onRestart?.();
    setIsLoading(false);
  }

  return {isLoading, closeSessions};
}
