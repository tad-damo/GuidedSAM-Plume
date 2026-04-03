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
 * - Added `zoomScale` to `EffectOptions` and `AbstractEffect` for scalable rendering.
 * - Removed optional `gl` from `EffectInit`; `_canvas` handling added to AbstractEffect.
 * - `_canvas` property added to `AbstractEffect` for storing the rendering target.
 * - `setup` now initializes `_canvas` if provided.
 * - `update` now updates both `variant` and `zoomScale`.
 * - Minor type and property adjustments to support 2D Canvas-based effects instead of WebGL.
 */
import {Effects} from '@/common/components/video/effects/Effects';
import {Tracklet} from '@/common/tracker/Tracker';
import {RLEObject} from '@/jscocotools/mask';
import {CanvasForm} from 'pts';

export type EffectLayers = {
  background: keyof Effects;
  highlight: keyof Effects;
};

export type EffectOptions = {
  variant: number;
  zoomScale: number;
};

export type EffectInit = {
  width: number;
  height: number;
  canvas?: OffscreenCanvas;
};

export type EffectMask = {
  bitmap: ImageBitmap | RLEObject;
  bounds: [[number, number], [number, number]];
};

export type EffectActionPoint = {
  objectId: number;
  position: [number, number];
};

export type EffectFrameContext = {
  frameIndex: number;
  totalFrames: number;
  fps: number;
  width: number;
  height: number;
  masks: EffectMask[];
  maskColors: string[];
  frame: ImageBitmap;
  timeParameter?: number;
  actionPoint: EffectActionPoint | null;
};

export interface Effect {
  variant: number;
  numVariants: number;
  nextVariant(): void;
  setup(init: EffectInit): Promise<void>;
  update(options: EffectOptions): Promise<void>;
  cleanup(): Promise<void>;
  apply(
    form: CanvasForm,
    context: EffectFrameContext,
    tracklets: Tracklet[],
  ): void;
}

export abstract class AbstractEffect implements Effect {
  protected _canvas: OffscreenCanvas | null = null;
  public numVariants: number;
  public variant: number;
  public zoomScale: number;

  constructor(numVariants: number) {
    this.numVariants = numVariants;
    this.variant = 0;
    this.zoomScale = 1;
  }

  nextVariant() {
    // Cycle through variants
    this.variant = (this.variant + 1) % this.numVariants;
  }

  async setup(init: EffectInit): Promise<void> {
    const {canvas} = init;
    if (canvas != null) {
      this._canvas = canvas;
    }
  }

  async update(options: EffectOptions): Promise<void> {
    this.variant = options.variant;
    this.zoomScale = options.zoomScale;
  }

  async cleanup(): Promise<void> {
    // noop
  }

  abstract apply(
    form: CanvasForm,
    context: EffectFrameContext,
    tracklets: Tracklet[],
  ): void;
}
