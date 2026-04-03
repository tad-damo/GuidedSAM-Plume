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
 * - Rewritten `VideoEditor` to support multiple videos with active video selection.
 * - Integrated `react-zoom-pan-pinch` for zooming and panning of video content.
 * - Added `zoomScaleAtom` and `isPanningAtom` integration to synchronize zoom/pan state across components.
 * - Replaced single `videoRef` with `videosRefs` array for handling multiple video elements.
 * - Updated effect application to include `zoomScale` when setting highlight effects.
 * - Removed `MAX_VIDEO_WIDTH` and responsive `overflow` handling from single-video layout.
 * - Minor style adjustments for multi-video layout and transform wrapper integration.
 */
import {
  activeHighlightEffectAtom,
  areTrackletObjectsInitializedAtom,
  VideoData,
} from '@/segmenter/atoms';
import stylex from '@stylexjs/stylex';
import {useAtomValue, useSetAtom} from 'jotai';
import {PropsWithChildren, useEffect, useRef} from 'react';
import Video, {VideoRef} from '../Video';
import {zoomScaleAtom, videosAtom, isPanningAtom} from './atoms';
import {activeVideoIndexAtom} from '@/segmenter/atoms';
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';
import {EffectIndex} from '../effects/Effects';

const styles = stylex.create({
  editorContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '0.375rem',
    overflow: {
      default: 'clip',
      '@media screen and (max-width: 768px)': 'visible',
    },
  },
  videoWrapper: {
    position: 'relative',
    marginBottom: '16px',
  },
  layers: {
    position: 'absolute',
    inset: 0,
  },
});

type Props = PropsWithChildren<{
  videos: VideoData[];
  layers?: React.ReactNode;
  loading?: boolean;
}>;

export default function VideoEditor({
  videos: inputVideos,
  layers,
  loading,
  children,
}: Props) {
  const activeIndex = useAtomValue(activeVideoIndexAtom);
  const zoomScale = useAtomValue(zoomScaleAtom);
  const videosRefs = useRef<VideoRef[]>([]);
  const setVideos = useSetAtom(videosAtom);
  const setZoomScale = useSetAtom(zoomScaleAtom);
  const setIsPanning = useSetAtom(isPanningAtom);
  const activeHighlightEffect = useAtomValue(activeHighlightEffectAtom);
  const activeVideoIndex = useAtomValue(activeVideoIndexAtom);
  const trackletInitialized = useAtomValue(areTrackletObjectsInitializedAtom);
  useEffect(() => {
    setVideos(videosRefs.current);
    return () => setVideos([]);
  }, [inputVideos, setVideos]);
  useEffect(() => {
    handleZoomChange(zoomScale);
  }, [activeIndex]);

  // set effect again when initializing tracklets to ensure zoom scale matches the atom value
  useEffect(() => {
    videosRefs.current[activeVideoIndex]?.setEffect(
      activeHighlightEffect.name,
      EffectIndex.HIGHLIGHT,
      {
        variant: activeHighlightEffect.variant,
        zoomScale: zoomScale,
      },
    );
  }, [trackletInitialized]);

  function handleZoomChange(zoomScale: number) {
    setZoomScale(zoomScale);
    videosRefs.current[activeVideoIndex]?.setEffect(
      activeHighlightEffect.name,
      EffectIndex.HIGHLIGHT,
      {
        variant: activeHighlightEffect.variant,
        zoomScale: zoomScale,
      },
    );
  }
  return (
    <div {...stylex.props(styles.editorContainer)}>
      <TransformWrapper
        initialScale={zoomScale}
        minScale={0.1}
        maxScale={10}
        limitToBounds={false}
        wheel={{step: 0.1}}
        panning={{
          allowLeftClickPan: false,
          allowMiddleClickPan: true,
          allowRightClickPan: false,
        }}
        onPanningStart={() => {
          setIsPanning(true);
        }}
        onPanningStop={() => {
          setIsPanning(false);
        }}
        doubleClick={{disabled: true}}
        onZoom={ref => {
          handleZoomChange(ref.state.scale);
        }}>
        <TransformComponent>
          <div
            style={{
              position: 'relative',
              width: inputVideos[activeVideoIndex].width,
              height: inputVideos[activeVideoIndex].height,
              imageRendering: 'pixelated',
            }}>
            {inputVideos.map((video, i) => (
              <div
                key={i}
                style={{
                  display: i === activeVideoIndex ? 'block' : 'none',
                  width: video.width,
                  height: video.height,
                }}>
                <Video
                  ref={el => {
                    if (el) videosRefs.current[i] = el;
                  }}
                  src={video.url}
                  frames={video.frames}
                  width={video.width}
                  height={video.height}
                  loading={loading}
                />
              </div>
            ))}
            <div
              style={{
                position: 'absolute',
                inset: 0,
              }}>
              {layers}
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {children}
    </div>
  );
}
