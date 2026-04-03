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
 * - Renamed `PointsToggle` → `PromptsToggle`.
 * - Added new "Box" option and updated button layout for three types: box, positive, negative.
 * - Use of `promptTypeAtom` instead of `labelTypeAtom`
 */
import {promptTypeAtom} from '@/segmenter/atoms';
import {AddFilled, SubtractFilled, SquareOutline} from '@carbon/icons-react';
import {useAtom} from 'jotai';

export default function PromptsToggle() {
  const [promptType, setPromptType] = useAtom(promptTypeAtom);

  const buttonStyle = (selected: boolean) =>
    `btn-md bg-graydark-800 !text-white md:px-2 lg:px-4 py-0.5 ${
      selected
        ? `border border-white hover:bg-graydark-800`
        : `border-graydark-700 hover:bg-graydark-700`
    }`;

  return (
    <div className="flex items-center w-full">
      <div className="join group grow flex justify-around gap-[5px]">
        <button
          className={`w-1/3 h-12 btn join-item text-green-500 flex items-center justify-center gap-2${buttonStyle(promptType === 'box')}`}
          onClick={() => setPromptType('box')}>
          <SquareOutline size={24} className="text-green-400" />
          Box
        </button>
        <button
          className={`w-1/3 h-12 btn join-item text-white flex items-center justify-center gap-2${buttonStyle(promptType === 'positive')}`}
          onClick={() => setPromptType('positive')}>
          <AddFilled size={24} className="text-blue-500" />
          Add
        </button>
        <button
          className={`w-1/3 h-12 btn join-item text-red-700 flex items-center justify-center gap-2${buttonStyle(promptType === 'negative')}`}
          onClick={() => setPromptType('negative')}>
          <SubtractFilled size={24} className="text-red-400" />
          Rem
        </button>
      </div>
    </div>
  );
}
