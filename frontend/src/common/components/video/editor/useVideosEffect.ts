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
 * - Rewritten hook to support multiple videos (`useVideosEffect`) instead of a single video (`useVideoEffect`).
 * - Replaced `useVideo` with `useVideos` to handle an array of video refs.
 * - Updated event listener registration and cleanup to iterate over all videos.
 * - Updated effect setter to apply the effect to all videos in the array.
 */
import {
  activeBackgroundEffectAtom,
  activeHighlightEffectAtom,
} from '@/segmenter/atoms';
import {useSetAtom} from 'jotai';
import {useCallback, useEffect} from 'react';
import {EffectUpdateEvent} from '../VideoWorkerBridge';
import {EffectOptions} from '../effects/Effect';
import Effects, {EffectIndex, Effects as EffectsType} from '../effects/Effects';
import useVideos from './useVideos';

export default function useVideosEffect() {
  const videos = useVideos();
  const setBackgroundEffect = useSetAtom(activeBackgroundEffectAtom);
  const setHighlightEffect = useSetAtom(activeHighlightEffectAtom);

  // The useEffect will listen to any effect updates from the worker. The
  // worker is the source of truth, which effect and effect variant is
  // currently applied. The main thread will be notified whenever an effect
  // or effect variant changes.
  useEffect(() => {
    function onEffectUpdate(event: EffectUpdateEvent) {
      if (event.index === EffectIndex.BACKGROUND) {
        setBackgroundEffect(event);
      } else {
        setHighlightEffect(event);
      }
    }
    for (const video of videos) {
      video?.addEventListener('effectUpdate', onEffectUpdate);
    }
    return () => {
      for (const video of videos) {
        video?.removeEventListener('effectUpdate', onEffectUpdate);
      }
    };
  }, [videos, setBackgroundEffect, setHighlightEffect]);

  return useCallback(
    (name: keyof EffectsType, index: EffectIndex, options?: EffectOptions) => {
      for (const video of videos) {
        video?.setEffect(name, index, options);
        const effect = Effects[name];
        const effectVariant = options?.variant ?? 0;

        if (index === EffectIndex.BACKGROUND) {
          setBackgroundEffect({
            name,
            variant: effectVariant,
            numVariants: effect.numVariants,
          });
        } else {
          setHighlightEffect({
            name,
            variant: options?.variant ?? 0,
            numVariants: effect.numVariants,
          });
        }
      }
    },
    [videos, setBackgroundEffect, setHighlightEffect],
  );
}
