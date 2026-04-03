/**
 * Copyright (c) 2025
 * Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
 *
 * Authors
 * Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
 * Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
 *
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
 */

import {BaseTracklet} from '../tracker/Tracker';

export async function createMasksMetricsCSVContents(
  tracklets: Array<BaseTracklet>,
): Promise<string[]> {
  const csvContents: string[] = [];

  const frameMap: Map<number, {headers: string[]; rows: string[][]}> =
    new Map();

  tracklets.forEach((tracklet, objectId) => {
    tracklet.masks.forEach((mask, frameIndex) => {
      const morphParams = mask.morphParams ?? {};

      const keys = Object.keys(morphParams);
      const values = Object.values(morphParams).map(String);

      if (!frameMap.has(frameIndex)) {
        frameMap.set(frameIndex, {headers: ['objectId', ...keys], rows: []});
      } else {
        const existingHeaders = frameMap.get(frameIndex)!.headers;
        keys.forEach(key => {
          if (!existingHeaders.includes(key)) existingHeaders.push(key);
        });
      }

      frameMap.get(frameIndex)!.rows.push([String(objectId), ...values]);
    });
  });

  frameMap.forEach(({headers, rows}) => {
    const csvContent =
      headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');
    csvContents.push(csvContent);
  });

  return csvContents;
}
