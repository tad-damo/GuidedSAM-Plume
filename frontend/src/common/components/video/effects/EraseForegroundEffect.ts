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
 * - Rewritten to use 2D Canvas API, removing `EffectLayer` and variant logic.
 * - Draws tracklet masks with white fill and black stroke for clarity.
 * - Render masks directly from tracklet contours per frame.
 */
import {
  AbstractEffect,
  EffectFrameContext,
} from '@/common/components/video/effects/Effect';
import {Tracklet} from '@/common/tracker/Tracker';
import invariant from 'invariant';
import {CanvasForm, Pt} from 'pts';

export default class EraseForegroundEffect extends AbstractEffect {
  constructor() {
    super(1);
  }

  apply(form: CanvasForm, context: EffectFrameContext, tracklets: Tracklet[]) {
    const ctx = form.ctx;
    invariant(this._canvas !== null, 'canvas is required');
    ctx.drawImage(this._canvas, 0, 0);
    tracklets.forEach(tracklet => {
      const mask = tracklet.masks?.[context.frameIndex];
      if (!mask?.contours) return;

      ctx.beginPath();

      mask.contours.forEach(polygon => {
        const pts: Pt[] = polygon.map(p => new Pt(p[0], p[1]));

        pts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
      });
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000'; //add a small black stroke to differentiate overlapping objects
      ctx.fill('evenodd');
    });
  }
}
