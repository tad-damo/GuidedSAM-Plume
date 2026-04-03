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
 * - Renamed demo constants to segmenter equivalents: `DEMO_SHORT_NAME` → `SEGMENTER_SHORT_NAME`, `DEMO_FRIENDLY_NAME` → `SEGMENTER_FRIENDLY_NAME`.
 * - Updated object limit from `demoObjectLimit = 3` to `SEGMENTER_OBJECT_LIMIT = Infinity`.
 * - Removed max file size restriction
 */
import {Effects} from '@/common/components/video/effects/Effects';

type EffectLayers = {
  background: keyof Effects;
  highlight: keyof Effects;
};

export const SEGMENTER_SHORT_NAME = 'GuidedSAM-Plume';
export const RESEARCH_BY_META_AI = 'By Meta FAIR';
export const SEGMENTER_FRIENDLY_NAME = 'GuidedSAM-Plume';
export const VIDEO_WATERMARK_TEXT = `Modified with ${SEGMENTER_FRIENDLY_NAME}`;
export const PROJECT_GITHUB_URL = 'https://github.com/facebookresearch/sam2';
export const AIDEMOS_URL = 'https://aidemos.meta.com';
export const ABOUT_URL = 'https://ai.meta.com/sam2';
export const EMAIL_ADDRESS = 'segment-anything@meta.com';
export const BLOG_URL = 'http://ai.meta.com/blog/sam2';

export const VIDEO_API_ENDPOINT = 'http://localhost:7263';
export const INFERENCE_API_ENDPOINT = 'http://localhost:7263';

export const SEGMENTER_OBJECT_LIMIT = Infinity;

export const DEFAULT_EFFECT_LAYERS: EffectLayers = {
  background: 'Original',
  highlight: 'Overlay',
};
