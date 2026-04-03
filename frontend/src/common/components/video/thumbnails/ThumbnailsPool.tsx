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
import stylex from '@stylexjs/stylex';
import Thumbnail from './Thumbnail';
import useVideo from '../editor/useVideo';
import useInputVideos from '../useInputVideo';
const styles = stylex.create({
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '0.25rem',
    width: '100%',
    overflowX: 'auto',
  },
});
export default function ThumbnailsPool() {
  const video = useVideo();
  const videoCanvas = video?.getCanvas();
  const height = 60;
  const width = videoCanvas
    ? height * (videoCanvas.width / videoCanvas.height)
    : 80;

  const {inputVideos} = useInputVideos();

  return (
    <div {...stylex.props(styles.container)}>
      {inputVideos.map((inputVideo, index) => (
        <Thumbnail
          key={index}
          videoIndex={index}
          url={inputVideo.posterUrl}
          width={width}
          height={height}
        />
      ))}
    </div>
  );
}
