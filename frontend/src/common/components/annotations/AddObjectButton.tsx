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
 * - Removed use of `labelTypeAtom` and snackbar (`useMessagesSnackbar`).
 * - Simplified `addObject` logic to only create a tracklet and set it as active.
 * - Button appearance and behavior remain the same; only internal logic simplified.
 */
import useVideo from '@/common/components/video/editor/useVideo';
import {activeTrackletObjectIdAtom} from '@/segmenter/atoms';
import {Add} from '@carbon/icons-react';
import {useSetAtom} from 'jotai';

export default function AddObjectButton() {
  const video = useVideo();
  const setActiveTrackletId = useSetAtom(activeTrackletObjectIdAtom);

  async function addObject() {
    const tracklet = await video?.createTracklet();
    if (tracklet != null) {
      setActiveTrackletId(tracklet.id);
    }
  }

  return (
    <div
      onClick={addObject}
      className="group flex justify-start mx-4 px-4 bg-transparent text-white !rounded-xl border-none cursor-pointer">
      <div className="flex gap-6 items-center">
        <div className=" group-hover:bg-graydark-700 border border-white relative h-12 w-12 md:w-20 md:h-20 shrink-0 rounded-lg flex items-center justify-center">
          <Add size={36} className="group-hover:text-white text-gray-300" />
        </div>
        <div className="font-medium text-base">Add another object</div>
      </div>
    </div>
  );
}
