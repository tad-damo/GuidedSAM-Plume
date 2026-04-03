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
 * - Removed `WebGLContextError` and `'webgl_context'` type since WebGL errors are no longer tracked.
 * - Updated `RenderingErrorType` type to only include `'draw_frame' | 'create_filmstrip' | 'error'`.
 * - Removed corresponding conditional check for `WebGLContextError` in `getRenderErrorType`.
 */
import CreateFilmstripError from '@/graphql/errors/CreateFilmstripError';
import DrawFrameError from '@/graphql/errors/DrawFrameError';
import {deserializeError, type ErrorObject} from 'serialize-error';

export type RenderingErrorType = 'draw_frame' | 'create_filmstrip' | 'error';

export function getRenderErrorType(error?: ErrorObject): RenderingErrorType {
  const deserializedError = deserializeError(error);

  if (deserializedError instanceof DrawFrameError) {
    return 'draw_frame';
  }
  if (deserializedError instanceof CreateFilmstripError) {
    return 'create_filmstrip';
  }
  return 'error';
}

/**
 * This function extracts the title from an error message.
 * The title is defined as the text before the first newline character.
 *
 * @param error The error object from which the title is to be extracted.
 * @returns The title of the error message.
 * @example
 * ```ts
 * const error = new Error('This is the title\nThis is the body');
 * const title = getErrorTitle(error);
 * console.log(title); // 'This is the title'
 * ```
 */
export function getErrorTitle({message}: Error): string {
  const idx = message.indexOf('\n');
  return idx < 0 ? message : message.substring(0, idx);
}
