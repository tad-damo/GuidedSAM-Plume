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
 * - Updated atom imports
 * - Replaced single video reference (`useVideo`) with multiple videos (`useVideos`)
 * - Updated return value `streamingState` → `streamingStates` as an array to track multiple videos
 * - Updated `onStreamingStateUpdate` to handle multiple videos using `event.videoId`
 * - Adjusted event listener registration/removal to iterate over all videos
 */
import {StreamingStateUpdateEvent} from '@/common/components/video/VideoWorkerBridge';
import {StreamingState} from '@/common/tracker/Tracker';
import {isStreamingAtom, streamingStatesAtom} from '@/segmenter/atoms';
import {useAtom} from 'jotai';
import {useEffect} from 'react';
import useVideos from '../video/editor/useVideos';

export default function useListenToStreamingState(): {
  isStreaming: boolean;
  streamingStates: StreamingState[];
} {
  const [streamingStates, setStreamingStates] = useAtom(streamingStatesAtom);
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const videos = useVideos();

  useEffect(() => {
    function onStreamingStateUpdate(event: StreamingStateUpdateEvent) {
      setStreamingStates(prev => {
        const updated = [...prev];
        updated[event.videoId] = event.state;
        return updated;
      });
    }
    function onStreamingStarted() {
      setIsStreaming(true);
    }
    function onStreamingCompleted() {
      setIsStreaming(false);
    }
    videos.forEach(video => {
      video?.addEventListener('streamingStateUpdate', onStreamingStateUpdate);
      video?.addEventListener('streamingStarted', onStreamingStarted);
      video?.addEventListener('streamingCompleted', onStreamingCompleted);
    });

    return () => {
      videos.forEach(video => {
        video?.removeEventListener(
          'streamingStateUpdate',
          onStreamingStateUpdate,
        );
        video?.removeEventListener('streamingStarted', onStreamingStarted);
        video?.removeEventListener('streamingCompleted', onStreamingCompleted);
      });
    };
  }, [videos, setStreamingStates, setIsStreaming]);

  return {isStreaming, streamingStates};
}
