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
 * - Renamed `DemoPageLayout` to `SegmenterPageLayout`.
 */
import {spacing} from '@/theme/tokens.stylex';
import stylex from '@stylexjs/stylex';
import {PropsWithChildren} from 'react';

type Props = PropsWithChildren;

const styles = stylex.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    gap: spacing[12],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
    '@media screen and (max-width: 768px)': {
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: 0,
      marginTop: spacing[0],
      marginBottom: spacing[0],
      paddingHorizontal: spacing[0],
      paddingBottom: spacing[0],
    },
  },
});

export default function SegmenterPageLayout({children}: Props) {
  return <div {...stylex.props(styles.container)}>{children}</div>;
}
