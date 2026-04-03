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
 * - Replaced single-video atoms with multi-video atoms.
 * - Added `UploadVideoView` fallback for when video is not uploaded.
 * - Updated tracklet mapping to use `tracklets[activeIndex]` for multi-video support.
 */
import AddObjectButton from '@/common/components/annotations/AddObjectButton';
import UploadVideoView from '@/common/components/annotations/UploadVideoView';
import LimitNotice from '@/common/components/annotations/LimitNotice';
import ObjectsToolbarBottomActions from '@/common/components/annotations/ObjectsToolbarBottomActions';
import ObjectsToolbarHeader from '@/common/components/annotations/ObjectsToolbarHeader';
import {getObjectLabel} from '@/common/components/annotations/ObjectUtils';
import ToolbarObject from '@/common/components/annotations/ToolbarObject';
import {
  activeTrackletObjectAtom,
  activeTrackletObjectIdAtom,
  isAddObjectEnabledAtom,
  isVideoUploadedAtom,
  isTrackletObjectLimitReachedAtom,
  trackletObjectsAtom,
  activeVideoIndexAtom,
} from '@/segmenter/atoms';
import {useAtomValue, useSetAtom} from 'jotai';

type Props = {
  onTabChange: (newIndex: number) => void;
};

export default function ObjectsToolbar({onTabChange}: Props) {
  const activeIndex = useAtomValue(activeVideoIndexAtom);
  const tracklets = useAtomValue(trackletObjectsAtom);
  const activeTracklet = useAtomValue(activeTrackletObjectAtom);
  const setActiveTrackletId = useSetAtom(activeTrackletObjectIdAtom);
  const isVideoUploaded = useAtomValue(isVideoUploadedAtom);
  const isObjectLimitReached = useAtomValue(isTrackletObjectLimitReachedAtom);
  const isAddObjectEnabled = useAtomValue(isAddObjectEnabledAtom);

  if (!isVideoUploaded) {
    return <UploadVideoView />;
  }

  return (
    <div className="flex flex-col h-full">
      <ObjectsToolbarHeader />
      <div className="grow w-full overflow-y-auto">
        {tracklets[activeIndex].map(tracklet => {
          return (
            <ToolbarObject
              key={tracklet.id}
              label={getObjectLabel(tracklet)}
              tracklet={tracklet}
              isActive={activeTracklet?.id === tracklet.id}
              onClick={() => {
                setActiveTrackletId(tracklet.id);
              }}
            />
          );
        })}
        {isAddObjectEnabled && <AddObjectButton />}
        {isObjectLimitReached && <LimitNotice />}
      </div>
      <ObjectsToolbarBottomActions onTabChange={onTabChange} />
    </div>
  );
}
