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
 * - Simplified effect lists: removed unused icons and effects, keeping only `Original` and `Erase` for background, `EraseForeground` and `Overlay` for highlight.
 * - Renamed `DemoEffect` to `SegmenterEffect`.
 * - Removed `moreEffects` array.
 */
import invariant from 'invariant';
import {Group} from 'pts';
import {EffectFrameContext} from './Effect';

export type MaskCanvas = {
  maskCanvas: OffscreenCanvas;
  bounds: number[][];
  scaleX: number;
  scaleY: number;
};

import {Effects} from '@/common/components/video/effects/Effects';
import type {CarbonIconType} from '@carbon/icons-react';
import {Erase, Image, Overlay} from '@carbon/icons-react';

export type SegmenterEffect = {
  title: string;
  Icon: CarbonIconType;
  effectName: keyof Effects;
};

export const backgroundEffects: SegmenterEffect[] = [
  {title: 'Original', Icon: Image, effectName: 'Original'},
  {title: 'Erase', Icon: Erase, effectName: 'EraseBackground'},
];

export const highlightEffects: SegmenterEffect[] = [
  {title: 'Erase', Icon: Erase, effectName: 'EraseForeground'},
  {
    title: 'Overlay',
    Icon: Overlay,
    effectName: 'Overlay',
  },
];

// Store existing content in a temporary canvas
// This can be used in HighlightEffect composite blending, so that the existing background effect can be put back via "destination-over"
export function copyCanvasContent(
  ctx: CanvasRenderingContext2D,
  effectContext: EffectFrameContext,
): OffscreenCanvas {
  const {width, height} = effectContext;
  const previousContent = ctx.getImageData(0, 0, width, height);
  const tempCanvas = new OffscreenCanvas(width, height);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx?.putImageData(previousContent, 0, 0);
  return tempCanvas;
}

export function isInvalidMask(bound: number[][] | Group) {
  return (
    bound[0].length < 2 ||
    bound[1].length < 2 ||
    bound[1][0] - bound[0][0] < 1 ||
    bound[1][1] - bound[0][1] < 1
  );
}

export type MaskRenderingData = {
  canvas: OffscreenCanvas;
  scale: number[];
  bounds: number[][];
};

export class EffectLayer {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(context: EffectFrameContext) {
    this.canvas = new OffscreenCanvas(context.width, context.height);
    const ctx = this.canvas.getContext('2d');
    invariant(ctx !== null, 'context cannot be  null');
    this.ctx = ctx;
    this.width = context.width;
    this.height = context.height;
  }

  image(source: CanvasImageSourceWebCodecs) {
    this.ctx.drawImage(source, 0, 0);
  }

  filter(filterString: string) {
    this.ctx.filter = filterString;
  }

  composite(blend: GlobalCompositeOperation) {
    this.ctx.globalCompositeOperation = blend;
  }

  fill(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
