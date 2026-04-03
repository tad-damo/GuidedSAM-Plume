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
 * - Updated to support multiple videos via `activeVideoIndexAtom` and `sessionsAtom`.
 * - Removed demo-specific atoms and messaging; replaced with segmenter equivalents.
 * - Updated `setSessions` logic to mark `ranPropagation` for the active video.
 */
import PrimaryCTAButton from '@/common/components/button/PrimaryCTAButton';
import useFunctionThrottle from '@/common/components/useFunctionThrottle';
import useVideo from '@/common/components/video/editor/useVideo';
import {
  activeVideoIndexAtom,
  areTrackletObjectsInitializedAtom,
  isStreamingAtom,
  sessionsAtom,
  streamingStatesAtom,
} from '@/segmenter/atoms';
import {ChevronRight} from '@carbon/icons-react';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {useCallback, useEffect} from 'react';

export default function TrackAndPlayButton() {
  const activeIndex = useAtomValue(activeVideoIndexAtom);
  const video = useVideo();
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const streamingStates = useAtomValue(streamingStatesAtom);
  const areObjectsInitialized = useAtomValue(areTrackletObjectsInitializedAtom);
  const setSessions = useSetAtom(sessionsAtom);
  const {isThrottled, maxThrottles, throttle} = useFunctionThrottle(250, 4);

  const isTrackAndPlayDisabled =
    streamingStates[activeIndex] === 'aborting' ||
    streamingStates[activeIndex] === 'requesting';

  useEffect(() => {
    function onStreamingStarted() {
      setIsStreaming(true);
    }
    video?.addEventListener('streamingStarted', onStreamingStarted);

    function onStreamingCompleted() {
      setIsStreaming(false);
    }
    video?.addEventListener('streamingCompleted', onStreamingCompleted);

    return () => {
      video?.removeEventListener('streamingStarted', onStreamingStarted);
      video?.removeEventListener('streamingCompleted', onStreamingCompleted);
    };
  }, [video, setIsStreaming]);

  const handleTrackAndPlay = useCallback(() => {
    if (isTrackAndPlayDisabled) {
      return;
    }

    // Throttling is only applied while streaming because we should
    // only throttle after a user has aborted inference. This way,
    // a user can still quickly abort a stream if they notice the
    // inferred mask is misaligned.
    throttle(
      () => {
        if (!isStreaming) {
          video?.streamMasks();
          // setSessions(previousSession =>
          //   previousSession == null
          //     ? previousSession
          //     : {...previousSession, ranPropagation: true},
          // );
          setSessions(prevSessions => {
            if (!prevSessions[activeIndex]) {
              return prevSessions;
            }
            const updatedSessions = [...prevSessions];
            updatedSessions[activeIndex] = {
              ...updatedSessions[activeIndex],
              ranPropagation: true,
            };
            return updatedSessions;
          });
        } else {
          video?.abortStreamMasks();
        }
      },
      {enableThrottling: isStreaming},
    );
  }, [
    isTrackAndPlayDisabled,
    isThrottled,
    isStreaming,
    maxThrottles,
    video,
    setSessions,
    throttle,
  ]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const callback = {
        KeyK: handleTrackAndPlay,
      }[event.code];
      if (callback != null) {
        event.preventDefault();
        callback();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [handleTrackAndPlay]);

  return (
    <PrimaryCTAButton
      disabled={isThrottled || !areObjectsInitialized}
      onClick={handleTrackAndPlay}
      endIcon={isStreaming ? undefined : <ChevronRight size={20} />}>
      {isStreaming ? 'Cancel Tracking' : 'Track objects'}
    </PrimaryCTAButton>
  );
}
