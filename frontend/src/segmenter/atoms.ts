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
* - Replaced `DemoEffect` with `SegmenterEffect`.
* - Updated atoms and state structures to support multiple videos instead of a single demo video.
* - Renamed atoms to plural specific versions.
* - Replaced single video/session references with arrays and active index tracking.
* - Replaced `MAX_NUMBER_TRACKLET_OBJECTS` with renamed version `SEGMENTER_OBJECT_LIMIT`.
* - Added support for boxes in tracklet objects (`boxes: Box[]`) and updated related atoms.
* - Updated `promptTypeAtom` default to `'box'` instead of `'positive'`.

 */
import {Effects} from '@/common/components/video/effects/Effects';
import {
  SegmenterEffect,
  highlightEffects,
} from '@/common/components/video/effects/EffectUtils';
import {
  BaseTracklet,
  Box,
  SegmentationPoint,
  StreamingState,
} from '@/common/tracker/Tracker';
import type {DataArray} from '@/jscocotools/mask';
import {atom} from 'jotai';
import {SEGMENTER_OBJECT_LIMIT} from './SegmenterConfig';

export type VideoData = {
  path: string;
  posterPath: string | null | undefined;
  frames: Array<string> | null | undefined;
  url: string;
  posterUrl: string;
  width: number;
  height: number;
  originalName: string;
};

export const frameIndexAtom = atom<number>(0);

export const inputVideosAtom = atom<VideoData[]>([]);

// #####################
// VIDEO
// #####################

export const activeVideoIndexAtom = atom(0);

// #####################
// SESSIONS
// #####################

export type Session = {
  id: string;
  ranPropagation: boolean;
};

export const sessionsAtom = atom<Session[]>([]);

// #####################
// STREAMING/PLAYBACK
// #####################

export const isVideoLoadingAtom = atom<boolean>(false);

export const streamingStatesAtom = atom<StreamingState[]>([]);

export const isPlayingAtom = atom<boolean>(false);

export const isStreamingAtom = atom<boolean>(false);

// #####################
// OBJECTS
// #####################

export type TrackletMask = {
  mask: DataArray;
  isEmpty: boolean;
};

export type TrackletObject = {
  id: number;
  color: string;
  thumbnail: string | null;
  points: SegmentationPoint[][];
  boxes: Box[];
  masks: TrackletMask[];
  isInitialized: boolean;
};

export const activeTrackletObjectIdAtom = atom<number | null>(0);

export const activeTrackletObjectAtom = atom<BaseTracklet | null>(get => {
  const activeIndex = get(activeVideoIndexAtom);
  const objectId = get(activeTrackletObjectIdAtom);
  const tracklets = get(trackletObjectsAtom)[activeIndex];
  return tracklets?.find(obj => obj.id === objectId) ?? null;
});

export const trackletObjectsAtom = atom<BaseTracklet[][]>([]);

export const maxTrackletObjectIdAtom = atom<number>(get => {
  const activeIndex = get(activeVideoIndexAtom);
  const tracklets = get(trackletObjectsAtom)[activeIndex];
  return tracklets?.reduce((prev, curr) => Math.max(prev, curr.id), 0);
});

export const isTrackletObjectLimitReachedAtom = atom<boolean>(
  get =>
    get(trackletObjectsAtom)[get(activeVideoIndexAtom)]?.length >=
    SEGMENTER_OBJECT_LIMIT,
);

export const areTrackletObjectsInitializedAtom = atom<boolean>(get => {
  const activeIndex = get(activeVideoIndexAtom);
  const tracklets = get(trackletObjectsAtom)[activeIndex];
  return tracklets?.every(obj => obj.isInitialized);
});

export const isVideoUploadedAtom = atom(get => {
  const activeIndex = get(activeVideoIndexAtom);
  const tracklets = get(trackletObjectsAtom)[activeIndex];
  return tracklets?.some(tracklet => tracklet.points.length > 0);
});

export const pointsAtom = atom<SegmentationPoint[]>(get => {
  const frameIndex = get(frameIndexAtom);
  const activeTracklet = get(activeTrackletObjectAtom);
  return activeTracklet?.points[frameIndex] ?? [];
});

export const boxAtom = atom<Box>(get => {
  const frameIndex = get(frameIndexAtom);
  const activeTracklet = get(activeTrackletObjectAtom);
  return activeTracklet?.boxes[frameIndex] ?? null;
});

export const promptTypeAtom = atom<'positive' | 'negative' | 'box'>('box');

export const isAddObjectEnabledAtom = atom<boolean>(get => {
  const session = get(sessionsAtom)[get(activeVideoIndexAtom)];
  const trackletsInitialized = get(areTrackletObjectsInitializedAtom);
  const isObjectLimitReached = get(isTrackletObjectLimitReachedAtom);
  return (
    session?.ranPropagation === false &&
    trackletsInitialized &&
    !isObjectLimitReached
  );
});

export const codeEditorOpenedAtom = atom<boolean>(false);

export const tutorialVideoEnabledAtom = atom<boolean>(true);

// #####################
// Effects
// #####################

type EffectConfig = {
  name: keyof Effects;
  variant: number;
  numVariants: number;
};

export const activeBackgroundEffectAtom = atom<EffectConfig>({
  name: 'Original',
  variant: 0,
  numVariants: 0,
});

export const activeHighlightEffectAtom = atom<EffectConfig>({
  name: 'Overlay',
  variant: 0,
  numVariants: 0,
});

export const activeHighlightEffectGroupAtom =
  atom<SegmenterEffect[]>(highlightEffects);

// #####################
// Toolbar
// #####################

export const toolbarTabIndex = atom<number>(0);

// #####################
// Upload state
// #####################

export const uploadingStateAtom = atom<'default' | 'uploading' | 'error'>(
  'default',
);
