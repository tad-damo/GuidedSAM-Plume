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
 * - Updated for multi-video support: uses `useVideos` and resets effects on all videos.
 * - Session and streaming state handling updated for multiple videos.
 * - Zoom scale applied when resetting effects.
 * - Renamed `resetSession` → `resetSessions` to reflect multi-video context.
 */
import {OBJECT_TOOLBAR_INDEX} from '@/common/components/toolbar/ToolbarConfig';
import useToolbarTabs from '@/common/components/toolbar/useToolbarTabs';
import useVideos from '@/common/components/video/editor/useVideos';
import {
  activeTrackletObjectIdAtom,
  activeVideoIndexAtom,
  frameIndexAtom,
  isPlayingAtom,
  isStreamingAtom,
  sessionsAtom,
  streamingStatesAtom,
  trackletObjectsAtom,
} from '@/segmenter/atoms';
import {DEFAULT_EFFECT_LAYERS} from '@/segmenter/SegmenterConfig';
import {useAtomValue, useSetAtom} from 'jotai';
import {useCallback} from 'react';
import {zoomScaleAtom} from './atoms';
import {StreamingState} from '@/common/tracker/Tracker';

type State = {
  resetEditor: () => void;
  resetEffects: () => void;
  resetSessions: () => void;
};

export default function useResetEditor(): State {
  const videos = useVideos();

  const setSessions = useSetAtom(sessionsAtom);
  const setActiveIndex = useSetAtom(activeVideoIndexAtom);
  const setActiveTrackletObjectId = useSetAtom(activeTrackletObjectIdAtom);
  const setTrackletObjects = useSetAtom(trackletObjectsAtom);
  const setFrameIndex = useSetAtom(frameIndexAtom);
  const setStreamingStates = useSetAtom(streamingStatesAtom);
  const setIsPlaying = useSetAtom(isPlayingAtom);
  const setIsStreaming = useSetAtom(isStreamingAtom);
  const [, setSegmenterTabIndex] = useToolbarTabs();
  const zoomScale = useAtomValue(zoomScaleAtom);

  const resetEffects = useCallback(() => {
    videos.forEach(video => {
      video?.setEffect(DEFAULT_EFFECT_LAYERS.background, 0, {
        variant: 0,
        zoomScale: zoomScale,
      });
      video?.setEffect(DEFAULT_EFFECT_LAYERS.highlight, 1, {
        variant: 0,
        zoomScale: zoomScale,
      });
    });
  }, [videos]);

  const resetEditor = useCallback(() => {
    setFrameIndex(0);
    setSessions([]);
    setActiveIndex(0);
    setActiveTrackletObjectId(0);
    setTrackletObjects([]);
    const states = videos.map(() => 'none' as StreamingState);
    setStreamingStates(states);
    setIsPlaying(false);
    setIsStreaming(false);
    resetEffects();
    setSegmenterTabIndex(OBJECT_TOOLBAR_INDEX);
  }, [
    setFrameIndex,
    setSessions,
    setActiveTrackletObjectId,
    setTrackletObjects,
    setStreamingStates,
    setIsPlaying,
    setIsStreaming,
    resetEffects,
    setSegmenterTabIndex,
  ]);

  const resetSessions = useCallback(() => {
    setSessions(prevSessions => {
      if (!prevSessions) return prevSessions;

      return prevSessions.map(session => {
        if (!session) return session;

        return {
          ...session,
          ranPropagation: false,
        };
      });
    });
    setActiveTrackletObjectId(null);
    resetEffects();
  }, [setSessions, setActiveTrackletObjectId, resetEffects]);

  return {resetEditor, resetEffects, resetSessions};
}
