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
 * - Fully rewritten `OverlayEffect` to replace WebGL-based rendering with 2D Canvas API rendering.
 * - Removed all GLSL shaders, uniform setup, mask textures, and related WebGL state management.
 * - Render masks directly from tracklet contours per frame.
 * - Added caching of Path2D objects per tracklet and frame for efficient overlay rendering.
 * - Simplified `apply` to draw semi-transparent filled overlays with stroked contours directly on the canvas.
 * - Removed `_clickPosition`, `_activeMask`, and variant logic; OverlayEffect now focuses exclusively on rendering masks.
 * - Updated base class from `BaseGLEffect` to `AbstractEffect`.
 */
import {hexToRgb} from '@/common/components/video/editor/VideoEditorUtils';
import {
  AbstractEffect,
  EffectFrameContext,
} from '@/common/components/video/effects/Effect';
import {Tracklet} from '@/common/tracker/Tracker';
import invariant from 'invariant';
import {CanvasForm} from 'pts';

export default class OverlayEffect extends AbstractEffect {
  private trackletPaths: WeakMap<Tracklet, Map<number, Path2D>>;
  constructor() {
    super(1);
    this.trackletPaths = new WeakMap<Tracklet, Map<number, Path2D>>();
  }

  apply(form: CanvasForm, context: EffectFrameContext, tracklets: Tracklet[]) {
    const ctx = form.ctx;
    invariant(this._canvas !== null, 'canvas is required');

    ctx.drawImage(this._canvas, 0, 0);

    tracklets.forEach(tracklet => {
      const mask = tracklet.masks?.[context.frameIndex];
      if (!mask?.contours) return;

      let pathsMap = this.trackletPaths.get(tracklet);
      if (!pathsMap) {
        pathsMap = new Map<number, Path2D>();
        this.trackletPaths.set(tracklet, pathsMap);
      }

      let path = pathsMap.get(context.frameIndex);

      if (!path || !mask.overlayRendered) {
        path = new Path2D();
        mask.contours.forEach(polygon => {
          polygon.forEach((pt, i) => {
            if (i === 0) path!.moveTo(pt[0], pt[1]);
            else path!.lineTo(pt[0], pt[1]);
          });
          path!.closePath();
        });

        pathsMap.set(context.frameIndex, path);

        mask.overlayRendered = true;
      }

      const color = hexToRgb(tracklet.color);
      ctx.fillStyle = `rgba(${color.r},${color.g},${color.b}, 0.3)`;
      ctx.fill(path, 'evenodd');

      ctx.strokeStyle = tracklet.color;
      ctx.lineWidth = 4 / this.zoomScale;
      ctx.stroke(path);
    });
  }
}
