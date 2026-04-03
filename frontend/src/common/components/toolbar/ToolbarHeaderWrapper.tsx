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
 * - Removed `ToolbarProgressChip` and `showProgressChip` prop
 * - Adjusted outer div classes (`flex flex-col gap-2 p-8 border-b border-b-black` → `${className} border-b border-b-black`)
 * - Wrapped content in an inner div with `flex flex-col gap-2 p-8 pb-4`
 * - Removed `showProgressChip` conditional rendering
 */
import {ReactNode} from 'react';

type Props = {
  title: string;
  description?: string;
  bottomSection?: ReactNode;
  showProgressChip?: boolean;
  className?: string;
};

export default function ToolbarHeaderWrapper({
  title,
  description,
  bottomSection,
  className,
}: Props) {
  return (
    <div className={`${className} border-b border-b-black`}>
      <div className={`flex flex-col gap-2 p-8 pb-4`}>
        <div className="flex items-center">
          <h2 className="text-xl">{title}</h2>
        </div>
        {description != null && (
          <div className="flex-1 text-gray-400">{description}</div>
        )}
        {bottomSection != null && bottomSection}
      </div>
    </div>
  );
}
