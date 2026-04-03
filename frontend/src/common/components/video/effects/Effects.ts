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
 * - Fully pruned effects list to keep only essential effects: `Original` and `EraseBackground` for backgrounds, `Overlay` and `EraseForeground` for highlights.
 * - Removed all WebGL-based or variant-dependent effects.
 * - Updated `Effects` type and default export to match the simplified set.
 * - Reduced `effectPresets` to only combinations relevant to the retained effects.
 */
import {Effect} from './Effect';
import EraseBackgroundEffect from './EraseBackgroundEffect';
import OriginalEffect from './OriginalEffect';
import OverlayEffect from './OverlayEffect';

import EraseForegroundEffect from './EraseForegroundEffect';

export type Effects = {
  /* Backgrounds */
  Original: Effect;
  EraseBackground: Effect;

  /* Highlights */
  Overlay: Effect;
  EraseForeground: Effect;
};

export default {
  /* Backgrounds */
  Original: new OriginalEffect(),
  EraseBackground: new EraseBackgroundEffect(),

  /* Highlights */
  Overlay: new OverlayEffect(),
  EraseForeground: new EraseForegroundEffect(),
} as Effects;

export enum EffectIndex {
  BACKGROUND = 0,
  HIGHLIGHT = 1,
}

type EffectComboItem = {name: keyof Effects; variant: number};

export type EffectsCombo = [EffectComboItem, EffectComboItem];

export const effectPresets: EffectsCombo[] = [
  [
    {name: 'Original', variant: 0},
    {name: 'Overlay', variant: 0},
  ],
  [
    {name: 'EraseBackground', variant: 0},
    {name: 'EraseForeground', variant: 0},
  ],
];
