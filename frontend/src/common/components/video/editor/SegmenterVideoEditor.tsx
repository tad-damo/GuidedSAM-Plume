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
 * - Renamed `DemoVideoEditor` to `SegmenterVideoEditor`
 * - Migrated from single-video demo editor to multi-video segmenter editor.
 * - Replaced `useVideo` with `useVideos` and updated all handlers to support multiple videos.
 * - Updated session, streaming state, points, and boxes management for multi-video context.
 * - Added `PromptsLayer` to handle both points and box annotations, replacing `PointsLayer`.
 * - Updated effect and tracklet handling to support active video indexing and multi-video updates.
 * - Integrated `ThumbnailsPool` for multiple video navigation.
 * - Conditional rendering for videos with a single frame (`activeVideoIsImage`) to hide filmstrip playback.
 * - Updated loading, error, and uploading states to handle multiple sessions and videos.
 */
import TrackletsAnnotation from '@/common/components/annotations/TrackletsAnnotation';
import useCloseSessionBeforeUnload from '@/common/components/session/useCloseSessionBeforeUnload';
import {OBJECT_TOOLBAR_INDEX} from '@/common/components/toolbar/ToolbarConfig';
import useToolbarTabs from '@/common/components/toolbar/useToolbarTabs';
import VideoFilmstripWithPlayback from '@/common/components/video/VideoFilmstripWithPlayback';
import {
  FrameUpdateEvent,
  RenderingErrorEvent,
  SessionStartedEvent,
  TrackletsEvent,
} from '@/common/components/video/VideoWorkerBridge';
import VideoEditor from '@/common/components/video/editor/VideoEditor';
import useResetSegmenterEditor from '@/common/components/video/editor/useResetEditor';
import useVideos from '@/common/components/video/editor/useVideos';
import InteractionLayer from '@/common/components/video/layers/InteractionLayer';
import {PromptsLayer} from '@/common/components/video/layers/PromptsLayer';
import LoadingStateScreen from '@/common/loading/LoadingStateScreen';
import UploadLoadingScreen from '@/common/loading/UploadLoadingScreen';
import useScreenSize from '@/common/screen/useScreenSize';
import {SegmentationPoint, Box} from '@/common/tracker/Tracker';
import {
  activeTrackletObjectIdAtom,
  frameIndexAtom,
  isAddObjectEnabledAtom,
  isPlayingAtom,
  isVideoLoadingAtom,
  pointsAtom,
  boxAtom,
  sessionsAtom,
  streamingStatesAtom,
  trackletObjectsAtom,
  uploadingStateAtom,
  VideoData,
} from '@/segmenter/atoms';
import useSettingsContext from '@/settings/useSettingsContext';
import {color, spacing} from '@/theme/tokens.stylex';
import stylex from '@stylexjs/stylex';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {useEffect, useState} from 'react';
import type {ErrorObject} from 'serialize-error';
import {activeVideoIndexAtom} from '@/segmenter/atoms';
import ThumbnailsPool from '../thumbnails/ThumbnailsPool';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    width: '100%',
    borderColor: color['gray-800'],
    backgroundColor: color['gray-800'],
    borderWidth: 8,
    borderRadius: 12,
    '@media screen and (max-width: 768px)': {
      // on mobile, we want to grow the editor container so that the editor
      // fills the remaining vertical space between the navbar and bottom
      // of the page
      flexGrow: 1,
      borderWidth: 0,
      borderRadius: 0,
      paddingBottom: spacing[4],
    },
  },
  loadingScreenWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'white',
    overflow: 'hidden',
    overflowY: 'auto',
    zIndex: 999,
  },
});

type Props = {
  videos: VideoData[];
};

export default function SegmenterVideoEditor({videos: inputVideos}: Props) {
  const {settings} = useSettingsContext();
  const videos = useVideos();
  const activeIndex = useAtomValue(activeVideoIndexAtom);

  const [isSessionStartFailed, setIsSessionStartFailed] =
    useState<boolean>(false);

  const [sessions, setSessions] = useAtom(sessionsAtom);

  const [activeTrackletId, setActiveTrackletObjectId] = useAtom(
    activeTrackletObjectIdAtom,
  );
  const setTrackletObjects = useSetAtom(trackletObjectsAtom);
  const setFrameIndex = useSetAtom(frameIndexAtom);
  const points = useAtomValue(pointsAtom);
  const box = useAtomValue(boxAtom);
  const isAddObjectEnabled = useAtomValue(isAddObjectEnabledAtom);
  const streamingStates = useAtomValue(streamingStatesAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const isVideoLoading = useAtomValue(isVideoLoadingAtom);
  const uploadingState = useAtomValue(uploadingStateAtom);

  const [renderingError, setRenderingError] = useState<ErrorObject | null>(
    null,
  );

  const {isMobile} = useScreenSize();

  const [tabIndex] = useToolbarTabs();

  const activeVideoIsImage =
    videos[activeIndex]?.numberOfFrames > 1 ? false : true;

  useCloseSessionBeforeUnload();

  const {resetEditor, resetSessions} = useResetSegmenterEditor();
  useEffect(() => {
    resetEditor();
  }, [inputVideos, resetEditor]);

  useEffect(() => {
    function onFrameUpdate(event: FrameUpdateEvent) {
      setFrameIndex(event.index);
    }
    function onSessionStarted(event: SessionStartedEvent) {
      setSessions(prevSessions => {
        const updatedSessions = [...prevSessions];
        updatedSessions[event.index] = {
          id: event.sessionId,
          ranPropagation: false,
        };
        return updatedSessions;
      });
    }
    function onSessionStartFailed() {
      setIsSessionStartFailed(true);
    }
    function onTrackletsUpdated(event: TrackletsEvent) {
      const tracklets = event.tracklets;
      if (tracklets.length === 0) {
        resetSessions();
      }
      setTrackletObjects(prevTracklets => {
        const updatedTracklets = [...prevTracklets];
        updatedTracklets[event.videoIndex] = tracklets;
        return updatedTracklets;
      });
    }
    function onRenderingError(event: RenderingErrorEvent) {
      setRenderingError(event.error);
    }
    videos.forEach(async (video, i) => {
      // Listen to frame updates to fetch the frame index in the main thread,
      // which is then used downstream to render points per frame.
      video?.addEventListener('frameUpdate', onFrameUpdate);

      video?.addEventListener('sessionStarted', onSessionStarted);

      video?.addEventListener('sessionStartFailed', onSessionStartFailed);

      video?.addEventListener('trackletsUpdated', onTrackletsUpdated);

      video?.addEventListener('renderingError', onRenderingError);

      video?.initializeTracker('SAM 2', {
        inferenceEndpoint: settings.inferenceAPIEndpoint,
      });
      video?.startSession(inputVideos[i].path, i);
    });
    return () => {
      videos.forEach(video => {
        video?.closeSession();
        video?.removeEventListener('frameUpdate', onFrameUpdate);
        video?.removeEventListener('sessionStarted', onSessionStarted);
        video?.removeEventListener('sessionStartFailed', onSessionStartFailed);
        video?.removeEventListener('trackletsUpdated', onTrackletsUpdated);
        video?.removeEventListener('renderingError', onRenderingError);
      });
    };
  }, [
    setFrameIndex,
    setSessions,
    setTrackletObjects,
    resetSessions,
    inputVideos,
    videos,
    settings.inferenceAPIEndpoint,
    settings.videoAPIEndpoint,
  ]);

  async function handleOptimisticPointOrBoxUpdate(
    newPoints: SegmentationPoint[],
    newBox: Box,
  ) {
    if (!sessions) {
      return;
    }
    async function createActiveTracklet() {
      if (!isAddObjectEnabled || (newPoints.length === 0 && newBox == null)) {
        return;
      }
      const tracklet = await videos[activeIndex]?.createTracklet();
      if (tracklet != null && (newPoints.length > 0 || newBox)) {
        setActiveTrackletObjectId(tracklet.id);
        videos[activeIndex]?.updatePointsOrBox(tracklet.id, newPoints, newBox);
      }
    }
    if (activeTrackletId != null) {
      videos[activeIndex]?.updatePointsOrBox(
        activeTrackletId,
        newPoints,
        newBox,
      );
    } else {
      await createActiveTracklet();
    }
  }

  async function handleAddPoint(point: SegmentationPoint) {
    if (
      streamingStates[activeIndex] === 'partial' ||
      streamingStates[activeIndex] === 'requesting'
    ) {
      return;
    }
    if (isPlaying) {
      return videos[activeIndex]?.pause();
    }
    handleOptimisticPointOrBoxUpdate([...points, point], box);

    // Add another object and switch to it if it's first prompt on frame
    if (
      (points.length == 0 && box == null) ||
      (points.length != 0 && box != null)
    ) {
      const tracklet = await videos[activeIndex]?.createTracklet();
      if (tracklet != null) {
        setActiveTrackletObjectId(tracklet.id);
      }
    }
  }

  async function handleAddBox(box: Box) {
    if (
      streamingStates[activeIndex] === 'partial' ||
      streamingStates[activeIndex] === 'requesting'
    ) {
      return;
    }
    if (isPlaying) {
      return videos[activeIndex]?.pause();
    }
    handleOptimisticPointOrBoxUpdate(points, box);
  }

  function handleRemovePoint(point: SegmentationPoint) {
    if (
      isPlaying ||
      streamingStates[activeIndex] === 'partial' ||
      streamingStates[activeIndex] === 'requesting'
    ) {
      return;
    }
    handleOptimisticPointOrBoxUpdate(
      points.filter(p => p !== point),
      box,
    );
  }

  function handleRemoveBox() {
    if (
      isPlaying ||
      streamingStates[activeIndex] === 'partial' ||
      streamingStates[activeIndex] === 'requesting'
    ) {
      return;
    }
    handleOptimisticPointOrBoxUpdate(points, null);
  }

  // The interaction layer handles clicks onto the video canvas. It is used
  // to get absolute point clicks and box coordinates within the video's coordinate system.
  // The PromptsLayer handles rendering of input prompts (points and box) and allows removing
  // individual prompts by clicking on them.
  const layers = (
    <>
      {tabIndex === OBJECT_TOOLBAR_INDEX && (
        <>
          <InteractionLayer
            key="interaction-layer"
            onPoint={point => handleAddPoint(point)}
            onBox={box => handleAddBox(box)}
          />
          <PromptsLayer
            key="points-layer"
            box={box}
            points={points}
            onRemovePoint={handleRemovePoint}
            onRemoveBox={handleRemoveBox}
          />
        </>
      )}
    </>
  );

  return (
    <>
      {(isVideoLoading || sessions.length != inputVideos.length) &&
        !isSessionStartFailed && (
          <div {...stylex.props(styles.loadingScreenWrapper)}>
            <LoadingStateScreen
              title="Loading..."
              description="This may take a few moments, you're almost there!"
            />
          </div>
        )}
      {isSessionStartFailed && (
        <div {...stylex.props(styles.loadingScreenWrapper)}>
          <LoadingStateScreen
            title="Did we just break the internet?"
            description={
              <>Uh oh, it looks like there was an issue starting a session.</>
            }
            linkProps={{to: '..', label: 'Back to homepage'}}
          />
        </div>
      )}
      {isMobile && renderingError != null && (
        <div {...stylex.props(styles.loadingScreenWrapper)}>
          <LoadingStateScreen
            title="Well, this is embarrassing..."
            description="This tool is not optimized for your device. Please try again on a different device with a larger screen."
            linkProps={{to: '..', label: 'Back to homepage'}}
          />
        </div>
      )}
      {uploadingState !== 'default' && (
        <div {...stylex.props(styles.loadingScreenWrapper)}>
          <UploadLoadingScreen />
        </div>
      )}
      <div {...stylex.props(styles.container)}>
        <VideoEditor videos={inputVideos} layers={layers} loading={!sessions}>
          <div className="bg-graydark-800 w-full">
            {inputVideos.length > 1 && <ThumbnailsPool />}
            <div style={{display: activeVideoIsImage ? 'none' : 'unset'}}>
              <VideoFilmstripWithPlayback />
              <TrackletsAnnotation />
            </div>
          </div>
        </VideoEditor>
      </div>
    </>
  );
}
