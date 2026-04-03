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
 * - Updated object limit notice to use `SEGMENTER_OBJECT_LIMIT` constant from segmenter config.
 * - Updated text to reference "this tool" instead of "this demo".
 */
import {SEGMENTER_OBJECT_LIMIT} from '@/segmenter/SegmenterConfig';
import {InformationFilled} from '@carbon/icons-react';

export default function LimitNotice() {
  return (
    <div className="mt-6 gap-3 mx-6 flex items-center text-gray-400">
      <div>
        <InformationFilled size={32} />
      </div>
      <div className="text-sm leading-snug">
        In this tool, you can track up to {SEGMENTER_OBJECT_LIMIT} objects, even
        though the SAM 2 model does not have a limit.
      </div>
    </div>
  );
}
