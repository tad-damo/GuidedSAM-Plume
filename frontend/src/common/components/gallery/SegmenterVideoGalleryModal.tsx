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
 * - Renamed `DemoVideoGalleryModal` to `SegmenterVideoGalleryModal`.
 * - Updated state management from `sessionAtom` to `sessionsAtom` to handle multiple videos.
 * - Updated `onSelect` and `onUpload` callbacks to handle arrays of `VideoData` instead of a single video.
 * - Replaced `DemoVideoGallery` with `SegmenterVideoGallery` for segmenter-specific gallery handling.
 * - Ensured `setSessions([])` is called after selection/upload to reset segmenter session state.
 */
import DefaultVideoGalleryModalTrigger from '@/common/components/gallery/DefaultVideoGalleryModalTrigger';
import {
  frameIndexAtom,
  sessionsAtom,
  uploadingStateAtom,
  VideoData,
} from '@/segmenter/atoms';
import {spacing} from '@/theme/tokens.stylex';
import {Close} from '@carbon/icons-react';
import stylex from '@stylexjs/stylex';
import {useSetAtom} from 'jotai';
import {ComponentType, useCallback, useRef} from 'react';
import {Modal} from 'react-daisyui';
import SegmenterVideoGallery from './SegmenterVideoGallery';

const styles = stylex.create({
  container: {
    position: 'relative',
    minWidth: '85vw',
    minHeight: '85vh',
    overflow: 'hidden',
    color: '#fff',
    boxShadow: '0 0 100px 50px #000',
    borderRadius: 16,
    border: '2px solid transparent',
    background:
      'linear-gradient(#1A1C1F, #1A1C1F) padding-box, linear-gradient(to right bottom, #FB73A5,#595FEF,#94EAE2,#FCCB6B) border-box',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing[3],
    zIndex: 10,
    cursor: 'pointer',
    ':hover': {
      opacity: 0.7,
    },
  },
  galleryContainer: {
    position: 'absolute',
    top: spacing[4],
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
  },
});

export type VideoGalleryTriggerProps = {
  onClick: () => void;
};

type Props = {
  trigger?: ComponentType<VideoGalleryTriggerProps>;
  showUploadInGallery?: boolean;
  onOpen?: () => void;
  onSelect?: (videos: VideoData[], isUpload?: boolean) => void;
  onUploadVideoError?: (error: Error) => void;
};

export default function SegmenterVideoGalleryModal({
  trigger: VideoGalleryModalTrigger = DefaultVideoGalleryModalTrigger,
  showUploadInGallery = false,
  onOpen,
  onSelect,
  onUploadVideoError,
}: Props) {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const setFrameIndex = useSetAtom(frameIndexAtom);
  const setUploadingState = useSetAtom(uploadingStateAtom);
  const setSessions = useSetAtom(sessionsAtom);

  function openModal() {
    const modal = modalRef.current;
    if (modal != null) {
      modal.style.display = 'grid';
      modal.showModal();
    }
  }

  function closeModal() {
    const modal = modalRef.current;
    if (modal != null) {
      modal.close();
      modal.style.display = 'none';
    }
  }

  const handleSelect = useCallback(
    async (videos: VideoData[], isUpload?: boolean) => {
      closeModal();
      setFrameIndex(0);
      onSelect?.(videos, isUpload);
      setUploadingState('default');
      setSessions([]);
    },
    [setFrameIndex, onSelect, setUploadingState, setSessions],
  );

  function handleUploadVideoStart() {
    setUploadingState('uploading');
    closeModal();
  }

  function handleOpenVideoGalleryModal() {
    onOpen?.();
    openModal();
  }

  return (
    <>
      <VideoGalleryModalTrigger onClick={handleOpenVideoGalleryModal} />
      <Modal ref={modalRef} {...stylex.props(styles.container)}>
        <div onClick={closeModal} {...stylex.props(styles.closeButton)}>
          <Close size={28} />
        </div>
        <Modal.Body>
          <div {...stylex.props(styles.galleryContainer)}>
            <SegmenterVideoGallery
              showUploadInGallery={showUploadInGallery}
              onSelect={video => handleSelect(video)}
              onUpload={video => handleSelect(video, true)}
              onUploadStart={handleUploadVideoStart}
              onUploadError={onUploadVideoError}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
