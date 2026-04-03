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
 * - Updated import paths.
 * - Added support for box mode via `promptTypeAtom`.
 * - Integrated `zoomScaleAtom` to adjust point and box coordinates.
 * - Added panning state handling via `isPanningAtom`.
 * - Added mouse event handlers to support drawing a `Box` with drag.
 * - Updated `onPoint` and added `onBox` callbacks in props.
 * - Added dynamic SVG rendering to show the temporary box while dragging.
 * - Maintained backward-compatible point clicking behavior for non-box prompts.
 */
import {useState, useRef} from 'react';
import useVideo from '@/common/components/video/editor/useVideo';
import {getPointInImage} from '@/common/components/video/editor/VideoEditorUtils';
import {SegmentationPoint, Box} from '@/common/tracker/Tracker';
import {promptTypeAtom} from '@/segmenter/atoms';
import stylex from '@stylexjs/stylex';
import {useAtomValue} from 'jotai';
import type {MouseEvent} from 'react';
import {isPanningAtom, zoomScaleAtom} from '../editor/atoms';

const styles = stylex.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  crosshair: {
    cursor: 'crosshair',
  },
  grabbing: {
    cursor: 'grabbing',
  },
});

type Props = {
  onPoint: (point: SegmentationPoint) => void;
  onBox: (box: Box) => void;
};

export default function InteractionLayer({onPoint, onBox}: Props) {
  const video = useVideo();
  const promptType = useAtomValue(promptTypeAtom);
  const zoomScale = useAtomValue(zoomScaleAtom);
  const isPanning = useAtomValue(isPanningAtom);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const [currentPos, setCurrentPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  function calculateBox(
    start: {x: number; y: number},
    end: {x: number; y: number},
  ): Box {
    const x0 = Math.min(start.x, end.x);
    const y0 = Math.min(start.y, end.y);
    const x1 = Math.max(start.x, end.x);
    const y1 = Math.max(start.y, end.y);

    return [x0, y0, x1, y1];
  }

  // Handle clicks (only if not in box mode)
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (promptType === 'box') {
      // In box mode, clicks are not for points
      return;
    }
    const canvas = video?.getCanvas();
    if (!canvas) return;
    const point = getPointInImage(event, canvas, zoomScale);
    // label 1 for positive, 0 for negative points
    onPoint([...point, promptType === 'positive' ? 1 : 0]);
  }

  // Handle right-click (only if not in box mode)
  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    if (promptType === 'box') {
      return;
    }
    const canvas = video?.getCanvas();
    if (!canvas) return;
    const point = getPointInImage(event, canvas, zoomScale);
    // opposite label on right click
    onPoint([...point, promptType === 'positive' ? 0 : 1]);
  }

  // Box drawing handlers (only active in box mode)
  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.button == 1) {
      // Wheel click is used for panning
      return;
    }
    if (promptType !== 'box') return;
    const canvas = video?.getCanvas();
    if (!canvas) return;
    const point = getPointInImage(event, canvas, zoomScale);
    dragStart.current = {
      x: point[0],
      y: point[1],
    };
    setCurrentPos({x: point[0], y: point[1]});
    setIsDragging(true);
  }

  function handleMouseUp(event: MouseEvent<HTMLDivElement>) {
    if (!isDragging || promptType !== 'box') return;
    const canvas = video?.getCanvas();
    if (!canvas || !dragStart.current) return;
    const end = getPointInImage(event, canvas, zoomScale);
    const box = calculateBox(dragStart.current, {x: end[0], y: end[1]});
    onBox(box);
    setIsDragging(false);
    dragStart.current = null;
    setCurrentPos(null); // clear temporary box
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!isDragging || promptType !== 'box' || !dragStart.current) return;
    const canvas = video?.getCanvas();
    if (!canvas) return;
    const pos = getPointInImage(event, canvas, zoomScale);
    setCurrentPos({x: pos[0], y: pos[1]});
  }

  return (
    <div
      {...stylex.props(
        styles.container,
        promptType === 'box' && styles.crosshair,
        isPanning && styles.grabbing,
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}>
      {isDragging && dragStart.current && currentPos && (
        <svg
          {...stylex.props(styles.container)}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${video?.getCanvas()?.width ?? 0} ${video?.getCanvas()?.height ?? 0}`}>
          {isDragging && dragStart.current && currentPos && (
            <rect
              x={Math.min(dragStart.current.x, currentPos.x)}
              y={Math.min(dragStart.current.y, currentPos.y)}
              width={Math.abs(currentPos.x - dragStart.current.x)}
              height={Math.abs(currentPos.y - dragStart.current.y)}
              fill="none"
              stroke="#2E7D32"
              strokeWidth={4 / zoomScale}
              strokeDasharray={`${20 / zoomScale},${10 / zoomScale}`}
              pointerEvents="none"
            />
          )}
        </svg>
      )}
    </div>
  );
}
