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
 * - Adjusted `onUpload` callback to handle multiple videos (`videosData`) instead of a single video.
 * - Updated navigate state payload from `{video}` → `{videos}`.
 * - Reset `sessionsAtom` to an empty array after upload instead of single session.
 * - Updated display text to pluralized form ("Upload files") for multi-video support.
 * - Removed max file size restriction
 */
import useUploadVideo from '@/common/components/gallery/useUploadVideo';
import OptionButton from '@/common/components/options/OptionButton';
import Logger from '@/common/logger/Logger';
import useScreenSize from '@/common/screen/useScreenSize';
import {sessionsAtom, uploadingStateAtom} from '@/segmenter/atoms';
import {Close, CloudUpload} from '@carbon/icons-react';
import {useSetAtom} from 'jotai';
import {useNavigate} from 'react-router-dom';

type Props = {
  onUpload: () => void;
};

export default function UploadOption({onUpload}: Props) {
  const navigate = useNavigate();
  const {isMobile} = useScreenSize();
  const setUploadingState = useSetAtom(uploadingStateAtom);
  const setSessions = useSetAtom(sessionsAtom);

  const {getRootProps, getInputProps, isUploading, error} = useUploadVideo({
    onUpload: videosData => {
      navigate(
        {pathname: location.pathname, search: location.search},
        {state: {videos: videosData}},
      );
      onUpload();
      setUploadingState('default');
      setSessions([]);
    },
    onUploadError: (error: Error) => {
      setUploadingState('error');
      Logger.error(error);
    },
    onUploadStart: () => {
      setUploadingState('uploading');
    },
  });

  return (
    <div className="cursor-pointer" {...getRootProps()}>
      <input {...getInputProps()} />

      <OptionButton
        variant="gradient"
        title={
          error !== null ? (
            'Upload Error'
          ) : isMobile ? (
            <>
              Upload{' '}
            </>
          ) : (
            <>
              Upload files{' '}
            </>
          )
        }
        Icon={error !== null ? Close : CloudUpload}
        loadingProps={{loading: isUploading, label: 'Uploading...'}}
        onClick={() => {}}
      />
    </div>
  );
}
