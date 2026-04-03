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
 * - Replaced `MoreOptionsToolbarBottomActions` with `DownloadToolbarBottomActions`.
 * - Updated toolbar title and copy to reflect download workflow.
 * - Added `useVideosEffect` calls to reset "EraseBackground" and "EraseForeground" effects on mount.
 * - Removed `useMessagesSnackbar` and related clearing logic.
 */
import DownloadToolbarBottomActions from '@/common/components/options/DownloadToolbarBottomActions';
import ShareSection from '@/common/components/options/ShareSection';
import TryAnotherVideoSection from '@/common/components/options/TryAnotherVideoSection';
import ToolbarHeaderWrapper from '@/common/components/toolbar/ToolbarHeaderWrapper';
import useScreenSize from '@/common/screen/useScreenSize';
import {useEffect} from 'react';
import useVideosEffect from '../video/editor/useVideosEffect';
import {EffectIndex} from '../video/effects/Effects';
import {useAtomValue} from 'jotai';
import {zoomScaleAtom} from '../video/editor/atoms';

type Props = {
  onTabChange: (newIndex: number) => void;
};

export default function DownloadToolbar({onTabChange}: Props) {
  const {isMobile} = useScreenSize();
  const setEffect = useVideosEffect();
  const zoomScale = useAtomValue(zoomScaleAtom);

  useEffect(() => {
    setEffect('EraseBackground', EffectIndex.BACKGROUND, {
      variant: 0,
      zoomScale: zoomScale,
    });
    setEffect('EraseForeground', EffectIndex.HIGHLIGHT, {
      variant: 0,
      zoomScale: zoomScale,
    });
  });

  return (
    <div className="flex flex-col h-full">
      <div className="grow">
        <ToolbarHeaderWrapper
          title="Ready? Save your result!"
          className="pb-0 !border-b-0 !text-white"
          showProgressChip={false}
        />
        <ShareSection />
        {!isMobile && <div className="h-[1px] bg-black mt-4 mb-8"></div>}
        <TryAnotherVideoSection onTabChange={onTabChange} />
      </div>
      {!isMobile && <DownloadToolbarBottomActions onTabChange={onTabChange} />}
    </div>
  );
}
