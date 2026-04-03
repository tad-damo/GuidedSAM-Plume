/**
 * Copyright (c) 2025
 * Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
 *
 * Authors
 * Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
 * Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
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

import {SEGMENTER_SHORT_NAME} from '@/segmenter/SegmenterConfig';
import {spacing} from '@/theme/tokens.stylex';
import stylex from '@stylexjs/stylex';
import UploadOption from '../options/UploadOption';

const styles = stylex.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
    padding: spacing[5],
    paddingVertical: spacing[6],
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
  },
  loadingScreenWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'white',
    overflow: 'hidden',
    overflowY: 'auto',
    zIndex: 999,
  },
});

export default function MobileUploadVideoBanner() {
  return (
    <div {...stylex.props(styles.container)}>
      <div className="flex text-white text-lg">Upload files to start</div>
      <div className="text-sm text-[#A7B3BF]">
        <p>
          You&apos;ll be able to use {SEGMENTER_SHORT_NAME} to create binary
          masks of any object in images or videos.
        </p>
      </div>
      <UploadOption onUpload={() => {}} />
    </div>
  );
}
