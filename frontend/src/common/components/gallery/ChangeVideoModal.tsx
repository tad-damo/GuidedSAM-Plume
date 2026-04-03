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
 * - Updated `handleSwitchVideos` to handle multiple videos (`videos: VideoData[]`).
 */
import type {VideoGalleryTriggerProps} from '@/common/components/gallery/SegmenterVideoGalleryModal';
import SegmenterVideoGalleryModal from '@/common/components/gallery/SegmenterVideoGalleryModal';
import useVideo from '@/common/components/video/editor/useVideo';
import Logger from '@/common/logger/Logger';
import {
  isStreamingAtom,
  uploadingStateAtom,
  VideoData,
} from '@/segmenter/atoms';
import {useAtomValue, useSetAtom} from 'jotai';
import {ComponentType, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';

type Props = {
  videoGalleryModalTrigger?: ComponentType<VideoGalleryTriggerProps>;
  showUploadInGallery?: boolean;
  onChangeVideo?: () => void;
};

export default function ChangeVideoModal({
  videoGalleryModalTrigger: VideoGalleryModalTriggerComponent,
  showUploadInGallery = true,
  onChangeVideo,
}: Props) {
  const isStreaming = useAtomValue(isStreamingAtom);
  const setUploadingState = useSetAtom(uploadingStateAtom);
  const video = useVideo();
  const navigate = useNavigate();

  const handlePause = useCallback(() => {
    video?.pause();
  }, [video]);

  function handlePauseOrAbortVideo() {
    if (isStreaming) {
      video?.abortStreamMasks();
    } else {
      handlePause();
    }
  }

  function handleSwitchVideos(videos: VideoData[]) {
    // Retain any search parameter
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      {
        state: {
          videos,
        },
      },
    );
    onChangeVideo?.();
  }

  function handleUploadVideoError(error: Error) {
    setUploadingState('error');
    Logger.error(error);
  }

  return (
    <SegmenterVideoGalleryModal
      trigger={VideoGalleryModalTriggerComponent}
      showUploadInGallery={showUploadInGallery}
      onOpen={handlePauseOrAbortVideo}
      onSelect={handleSwitchVideos}
      onUploadVideoError={handleUploadVideoError}
    />
  );
}
