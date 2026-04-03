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
 * - Update import paths
 * - Replaced Demo gallery components with Segmenter equivalents
 * - Replaced `ChangeVideoModal` trigger with `UploadOption` component
 * - Commented out old `UploadLoadingScreenChangeVideoTrigger`
 */
import LoadingStateScreen from '@/common/loading/LoadingStateScreen';
import {uploadingStateAtom} from '@/segmenter/atoms';
import {useAtomValue} from 'jotai';
import UploadOption from '../components/options/UploadOption';

export default function UploadLoadingScreen() {
  const uploadingState = useAtomValue(uploadingStateAtom);

  if (uploadingState === 'error') {
    return (
      <LoadingStateScreen
        title="Uh oh, we cannot process this video"
        description="Please upload another video, and make sure that the video’s file size is less than 70Mb. ">
        <div className="max-w-[250px] w-full mx-auto">
          {/* <ChangeVideoModal
            videoGalleryModalTrigger={UploadLoadingScreenChangeVideoTrigger}
          /> */}
          <UploadOption onUpload={() => {}} />
        </div>
      </LoadingStateScreen>
    );
  }

  return (
    <LoadingStateScreen
      title="Uploading video..."
      description="Sit tight while we upload your video."
    />
  );
}

// function UploadLoadingScreenChangeVideoTrigger({
//   onClick,
// }: VideoGalleryTriggerProps) {
//   return (
//     <OptionButton
//       variant="gradient"
//       title="Change video"
//       Icon={ImageCopy}
//       onClick={onClick}
//     />
//   );
// }
