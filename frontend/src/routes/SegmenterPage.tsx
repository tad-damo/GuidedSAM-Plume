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
 * - Renamed `DemoPage` to `SegmenterPage`
 * - Updated atoms import path according to renamed files.
 * - Use renamed versions of `DemoVideoEditor` to `SegmenterVideoEditor` and `DemoPageLayout` to `SegmenterPageLayout`.
 * - Updated state and hooks to handle multiple videos (`video` → `videos`) using `useInputVideos`.
 */
import Toolbar from '@/common/components/toolbar/Toolbar';
import SegmenterVideoEditor from '@/common/components/video/editor/SegmenterVideoEditor';
import useInputVideos from '@/common/components/video/useInputVideo';
import StatsView from '@/debug/stats/StatsView';
import {VideoData} from '@/segmenter/atoms';
import SegmenterPageLayout from '@/layouts/SegmenterPageLayout';
import {useEffect} from 'react';
import {Location, useLocation} from 'react-router-dom';

type LocationState = {
  videos?: VideoData[];
};

export default function SegmenterPage() {
  const {state} = useLocation() as Location<LocationState>;
  const {setInputVideos} = useInputVideos();

  const videos = state?.videos;

  useEffect(() => {
    setInputVideos(videos ?? []);
  }, [videos, setInputVideos]);

  return (
    <SegmenterPageLayout>
      <StatsView />
      <Toolbar />
      {videos && <SegmenterVideoEditor videos={videos} />}
    </SegmenterPageLayout>
  );
}
