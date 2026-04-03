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
 * - Replaced `isFirstClickMadeAtom` check with `isVideoUploadedAtom` for mobile toolbar flow.
 * - Replaced `MobileFirstClickBanner` with `MobileUploadVideoBanner` for video upload state handling.
 */
import MobileObjectsToolbarHeader from '@/common/components/annotations/MobileObjectsToolbarHeader';
import ObjectsToolbarBottomActions from '@/common/components/annotations/ObjectsToolbarBottomActions';
import {getObjectLabel} from '@/common/components/annotations/ObjectUtils';
import ToolbarObject from '@/common/components/annotations/ToolbarObject';
import MobileUploadVideoBanner from './MobileUploadVideoBanner';
import {activeTrackletObjectAtom, isVideoUploadedAtom} from '@/segmenter/atoms';
import {useAtomValue} from 'jotai';

type Props = {
  onTabChange: (newIndex: number) => void;
};

export default function MobileObjectsToolbar({onTabChange}: Props) {
  const activeTracklet = useAtomValue(activeTrackletObjectAtom);
  const isVideoUploaded = useAtomValue(isVideoUploadedAtom);

  if (!isVideoUploaded) {
    return <MobileUploadVideoBanner />;
  }

  return (
    <div className="w-full">
      <MobileObjectsToolbarHeader />
      {activeTracklet != null && (
        <ToolbarObject
          label={getObjectLabel(activeTracklet)}
          tracklet={activeTracklet}
          isActive={true}
          isMobile={true}
        />
      )}

      <ObjectsToolbarBottomActions onTabChange={onTabChange} />
    </div>
  );
}
