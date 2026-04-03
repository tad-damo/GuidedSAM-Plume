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
 * - Removed `MobileEffectsToolbar` and `MoreOptionsToolbar`.
 * - Added `DownloadToolbar` as the second tab.
 * - Updated `tabs` array to only include `MobileObjectsToolbar` and `DownloadToolbar`.
 */
import MobileObjectsToolbar from '@/common/components/annotations/MobileObjectsToolbar';
import DownloadToolbar from '@/common/components/options/DownloadToolbar';

type Props = {
  tabIndex: number;
  onTabChange: (newIndex: number) => void;
};

export default function MobileToolbar({tabIndex, onTabChange}: Props) {
  const tabs = [
    <MobileObjectsToolbar key="objects" onTabChange={onTabChange} />,
    <DownloadToolbar key="more-options" onTabChange={onTabChange} />,
  ];

  return (
    <div className="relative flex flex-col bg-black">{tabs[tabIndex]}</div>
  );
}
