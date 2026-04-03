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
 * - Updated `getFileName` to accept a `dataType` parameter and generate `.zip` filenames instead of `.mp4`.
 * - Added `splitExt` utility to remove file extensions from filenames.
 * - Removed the previous `handleSaveVideo` function.
 */

export function getFileName(dataType: string) {
  const date = new Date();
  const timestamp = date.getTime();
  return `${dataType}_sam2_segmenter_${timestamp}.zip`;
}

export function splitExt(filename: string) {
  const chunks = filename.split('.');
  chunks.pop();
  return chunks.join('.');
}
