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
import {SEGMENTER_SHORT_NAME} from '@/segmenter/SegmenterConfig';
import UploadOption from '../options/UploadOption';
import UploadLoadingScreen from '@/common/loading/UploadLoadingScreen';
import {useAtomValue} from 'jotai';
import {uploadingStateAtom} from '@/segmenter/atoms';
import stylex from '@stylexjs/stylex';
import {AddFilled, SquareOutline, SubtractFilled} from '@carbon/icons-react';
import PromptsToggle from './PromptsToggle';
import useInputVideos from '../video/useInputVideo';

const styles = stylex.create({
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

export default function UploadVideoView() {
  const uploadingState = useAtomValue(uploadingStateAtom);
  const {inputVideos} = useInputVideos();

  return (
    <div className="w-full h-full flex flex-col p-8">
      <div className="grow flex flex-col gap-6">
        <h2 className="text-2xl">Upload files to start</h2>
        <p className="!text-gray-60">
          You&apos;ll be able to use {SEGMENTER_SHORT_NAME} to create binary
          masks of any object in images or videos.
        </p>
        {inputVideos.length > 0 && (
          <>
            <p className="!text-gray-60">
              To start, select any object in the current image or video.
            </p>
            <p className="text-gray-400">
              Choose <SquareOutline size={14} className="inline" /> to select an
              object, or <AddFilled size={14} className="inline" /> to add areas
              to the object and <SubtractFilled size={14} className="inline" />{' '}
              to remove areas from the object in the video. Click on an existing
              prompt to delete it.
            </p>
            <div className="w-full flex justify-center">
              <div className="w-full bg-black rounded-lg flex flex-col gap-3 p-3">
                Prompt type
                <PromptsToggle />
              </div>
            </div>
          </>
        )}
      </div>
      {uploadingState !== 'default' && (
        <div {...stylex.props(styles.loadingScreenWrapper)}>
          <UploadLoadingScreen />
        </div>
      )}
      <UploadOption onUpload={() => {}} />
    </div>
  );
}
