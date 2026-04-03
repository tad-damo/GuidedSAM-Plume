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
 * - Updated imports and type references.
 */
import ResponsiveButton from '@/common/components/button/ResponsiveButton';
import type {VideoGalleryTriggerProps} from '@/common/components/gallery/SegmenterVideoGalleryModal';
import {ImageCopy} from '@carbon/icons-react';

export default function DefaultVideoGalleryModalTrigger({
  onClick,
}: VideoGalleryTriggerProps) {
  return (
    <ResponsiveButton
      color="ghost"
      className="hover:!bg-black"
      startIcon={<ImageCopy size={20} />}
      onClick={onClick}>
      Change video
    </ResponsiveButton>
  );
}
