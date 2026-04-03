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
 * - Updated `DownloadOption` to provide two separate buttons: one for downloading masks (.jpg) and one for masks metrics (.csv).
 * - Updated `onClick` handlers to call `download` with the appropriate `dataType` argument ('masks' or 'masksMetrics').
 * - Wrapped buttons in a vertical flex container with a gap for spacing.
 */
import {Package} from '@carbon/icons-react';
import OptionButton from './OptionButton';
import useDownloadVideo from './useDownloadVideo';

export default function DownloadOption() {
  const {download, state} = useDownloadVideo();

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5vh'}}>
      <OptionButton
        title="Download masks (.jpg)"
        Icon={Package}
        loadingProps={{
          loading: state === 'started' || state === 'encoding',
          label: 'Downloading...',
        }}
        onClick={() => download('masks')}
      />
      <OptionButton
        title="Download masks metrics (.csv)"
        Icon={Package}
        loadingProps={{
          loading: state === 'started' || state === 'encoding',
          label: 'Downloading...',
        }}
        onClick={() => download('masksMetrics')}
      />
    </div>
  );
}
