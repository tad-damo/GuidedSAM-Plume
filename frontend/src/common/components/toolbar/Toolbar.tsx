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
 * - Updated atom imports.
 * - Replaced `useVideoEffect` with `useVideosEffect` to support multiple videos.
 * - Added `zoomScaleAtom` and updated `resetEffects` to include `zoomScale` in effect options.
 */
import useListenToStreamingState from '@/common/components/toolbar/useListenToStreamingState';
import useToolbarTabs from '@/common/components/toolbar/useToolbarTabs';
import useVideo from '@/common/components/video/editor/useVideo';
import useVideosEffect from '@/common/components/video/editor/useVideosEffect';
import {EffectIndex} from '@/common/components/video/effects/Effects';
import useScreenSize from '@/common/screen/useScreenSize';
import {
  codeEditorOpenedAtom,
  isPlayingAtom,
  isStreamingAtom,
} from '@/segmenter/atoms';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {useCallback, useEffect} from 'react';
import DesktopToolbar from './DesktopToolbar';
import MobileToolbar from './MobileToolbar';
import {OBJECT_TOOLBAR_INDEX} from './ToolbarConfig';
import {zoomScaleAtom} from '../video/editor/atoms';

export default function Toolbar() {
  const [tabIndex, setTabIndex] = useToolbarTabs();
  const video = useVideo();
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const codeEditorOpened = useAtomValue(codeEditorOpenedAtom);
  const {isMobile} = useScreenSize();
  const setEffect = useVideosEffect();
  const zoomScale = useAtomValue(zoomScaleAtom);

  const resetEffects = useCallback(() => {
    setEffect('Original', EffectIndex.BACKGROUND, {
      variant: 0,
      zoomScale: zoomScale,
    });
    setEffect('Overlay', EffectIndex.HIGHLIGHT, {
      variant: 0,
      zoomScale: zoomScale,
    });
  }, [setEffect]);

  const handleStopVideo = useCallback(() => {
    if (isStreaming) {
      video?.abortStreamMasks();
    } else {
      video?.pause();
    }
  }, [video, isStreaming]);

  const handleTabChange = useCallback(
    (newIndex: number) => {
      if (newIndex === OBJECT_TOOLBAR_INDEX) {
        handleStopVideo();
        resetEffects();
      }

      setTabIndex(newIndex);
    },
    [handleStopVideo, resetEffects, setTabIndex],
  );

  useListenToStreamingState();

  useEffect(() => {
    function onPlay() {
      setIsPlaying(true);
    }
    function onPause() {
      setIsPlaying(false);
    }

    video?.addEventListener('play', onPlay);
    video?.addEventListener('pause', onPause);
    return () => {
      video?.removeEventListener('play', onPlay);
      video?.removeEventListener('pause', onPause);
    };
  }, [video, resetEffects, setIsStreaming, setIsPlaying]);

  if (codeEditorOpened) {
    return null;
  }

  return isMobile ? (
    <MobileToolbar tabIndex={tabIndex} onTabChange={handleTabChange} />
  ) : (
    <DesktopToolbar tabIndex={tabIndex} onTabChange={handleTabChange} />
  );
}
