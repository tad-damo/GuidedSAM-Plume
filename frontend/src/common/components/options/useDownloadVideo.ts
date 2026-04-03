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
 * - Updated hook from single-video `useVideo` → multi-video `useVideos` and `useInputVideos`.
 * - Added `dataType` parameter to `download` to support multiple download types (`masks` | `masksMetrics`).
 * - Integrated JSZip to combine multiple video outputs into a single ZIP when multiple videos exist.
 * - Updated event listeners and encoding logic to handle multiple videos concurrently.
 * - Adjusted `saveVideo` → `saveData` to handle ArrayBuffer/MP4ArrayBuffer and ZIP files.
 * - Added per-video file naming using `inputVideos[i].originalName` and zero-padded frame indices.
 */
import {getFileName, splitExt} from '@/common/components/options/ShareUtils';
import {
  EncodingCompletedEvent,
  EncodingStateUpdateEvent,
} from '@/common/components/video/VideoWorkerBridge';
import {MP4ArrayBuffer} from 'mp4box';
import {useState} from 'react';
import useInputVideos from '../video/useInputVideo';
import useVideos from '../video/editor/useVideos';
import JSZip from 'jszip';

type DownloadingState = 'default' | 'started' | 'encoding' | 'completed';

type DownloadDataType = 'masks' | 'masksMetrics';

type State = {
  state: DownloadingState;
  progress: number;
  download: (
    dataType: DownloadDataType,
    shouldSave?: boolean,
  ) => Promise<MP4ArrayBuffer | ArrayBuffer>;
};

export default function useDownloadVideo(): State {
  const [downloadingState, setDownloadingState] =
    useState<DownloadingState>('default');
  const [progress, setProgress] = useState<number>(0);

  const videos = useVideos();
  const {inputVideos} = useInputVideos();

  async function download(
    dataType: DownloadDataType,
    shouldSave = true,
  ): Promise<MP4ArrayBuffer | ArrayBuffer> {
    return new Promise(resolve => {
      const zip = new JSZip();
      let numCompleted = 0;

      for (const [i, video] of videos.entries()) {
        const inputVideoName = splitExt(inputVideos[i].originalName);
        const filesExt = dataType == 'masks' ? '.jpg' : '.csv';
        function onEncodingStateUpdate(event: EncodingStateUpdateEvent) {
          setDownloadingState('encoding');
          setProgress(event.progress);
        }

        function onEncodingComplete(event: EncodingCompletedEvent) {
          const files = event.files;

          if (files.length == 1) {
            zip.file(inputVideoName + filesExt, files[0]);
          } else {
            const folder = zip.folder(inputVideoName);
            files.forEach((file, i) => {
              const filename = `frame_${String(i).padStart(5, '0')}${filesExt}`;
              folder?.file(filename, file);
            });
          }
          numCompleted++;
          video?.removeEventListener('encodingCompleted', onEncodingComplete);
          video?.removeEventListener(
            'encodingStateUpdate',
            onEncodingStateUpdate,
          );

          if (numCompleted == videos.length) {
            zip.generateAsync({type: 'arraybuffer'}).then(file => {
              if (shouldSave) {
                saveData(file, getFileName(dataType));
              }
              setDownloadingState('completed');
              resolve(file);
            });
          }
        }

        video?.addEventListener('encodingStateUpdate', onEncodingStateUpdate);
        video?.addEventListener('encodingCompleted', onEncodingComplete);

        if (
          downloadingState === 'default' ||
          downloadingState === 'completed'
        ) {
          setDownloadingState('started');
          video?.pause();
          switch (dataType) {
            case 'masks':
              video?.encodeVideo();
              break;
            case 'masksMetrics':
              video?.encodeMasksMetrics();
          }
        }
      }
    });
  }

  function saveData(file: MP4ArrayBuffer | ArrayBuffer, fileName: string) {
    const blob = new Blob([file]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    a.setAttribute('target', '_self');
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return {
    download,
    progress,
    state: downloadingState,
  };
}
