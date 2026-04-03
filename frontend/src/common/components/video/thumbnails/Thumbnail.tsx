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
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {
  activeTrackletObjectIdAtom,
  activeVideoIndexAtom,
  streamingStatesAtom,
} from '@/segmenter/atoms';
import useVideos from '../editor/useVideos';
import {CheckmarkFilled} from '@carbon/icons-react';

type Props = {
  videoIndex: number;
  url: string;
  width: number;
  height: number;
  onClick?: (index: number) => void;
};

const styles = stylex.create({
  container: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0.25rem',
    cursor: 'pointer',
    flexShrink: 0,
  },
  highlight: {outline: '3px solid #e0e0e0', transition: 'outline 0.1s ease'},
  hover: {
    ':hover': {outline: '1px solid #e0e0e0', transition: 'outline 0.1s ease'},
  },
  image: {borderRadius: '0.25rem'},
  tickWrapper: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function Thumbnail({url, videoIndex, width, height}: Props) {
  const [activeVideoIndex, setActiveVideoIndex] = useAtom(activeVideoIndexAtom);
  const setActiveTrackletId = useSetAtom(activeTrackletObjectIdAtom);
  const streamingStates = useAtomValue(streamingStatesAtom);
  const videos = useVideos();

  const highlight = activeVideoIndex === videoIndex;
  const state = streamingStates[videoIndex];
  const isApproved =
    state === 'full' ||
    (state === 'required' && videos[videoIndex].numberOfFrames == 1);

  return (
    <div
      style={{width, height}}
      {...stylex.props(styles.container)}
      onClick={() => {
        setActiveVideoIndex(videoIndex);
        setActiveTrackletId(0);
      }}>
      <img
        {...stylex.props(
          styles.image,
          !highlight && styles.hover,
          highlight && styles.highlight,
        )}
        src={url}
        width={width}
        height={height}
      />
      {isApproved && !highlight && (
        <div {...stylex.props(styles.tickWrapper)}>
          <CheckmarkFilled color={'green'} width={'100%'} height={'100%'} />
        </div>
      )}
    </div>
  );
}
