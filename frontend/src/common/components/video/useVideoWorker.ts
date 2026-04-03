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
 * - Added `frames` parameter to `useVideoWorker` to support pre-rendered image frames alongside `src`.
 * - Updated `worker.setSource` call to pass both `src` and `frames` instead of just `src`.
 * - Updated the `useEffect` dependency array to include `frames`.
 */
import {RefObject, useEffect, useMemo, useRef} from 'react';
import VideoWorkerBridge from './VideoWorkerBridge';

type Options = {
  createVideoWorker?: () => Worker;
  createWorkerBridge?: CreateWorkerBridgeFunction;
};

const DEFAULT_OPTIONS: Options = {
  createVideoWorker: () =>
    new Worker(new URL('./VideoWorker', import.meta.url), {
      type: 'module',
    }),
};

type WorkerFactory = () => Worker;

type CreateWorkerBridgeFunction = (
  workerFactory: WorkerFactory,
) => VideoWorkerBridge;

export default function useVideoWorker(
  src: string,
  frames: Array<string> | null | undefined,
  canvasRef: RefObject<HTMLCanvasElement>,
  options: Options = {},
) {
  const isControlTransferredToOffscreenRef = useRef(false);

  const mergedOptions = useMemo(() => {
    const definedProps = (o: Options) =>
      Object.fromEntries(
        Object.entries(o).filter(([_k, v]) => v !== undefined),
      );
    return Object.assign(
      DEFAULT_OPTIONS,
      definedProps(options),
    ) as Required<Options>;
  }, [options]);

  const worker = useMemo(() => {
    if (mergedOptions.createWorkerBridge) {
      return mergedOptions.createWorkerBridge(mergedOptions.createVideoWorker);
    }
    return VideoWorkerBridge.create(mergedOptions.createVideoWorker);
  }, [mergedOptions]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas == null) {
      return;
    }

    if (isControlTransferredToOffscreenRef.current) {
      return;
    }

    isControlTransferredToOffscreenRef.current = true;

    worker.setCanvas(canvas);

    return () => {
      // Cannot terminate worker in DEV mode
      // workerRef.current?.terminate();
    };
  }, [canvasRef, mergedOptions, worker]);

  useEffect(() => {
    worker.setSource(src, frames);
  }, [src, frames, worker]);

  return worker;
}
