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
 * - Removed demo-specific text in the suspense fallback (`"Loading demo..."` → `"Loading..."`).
 * - Commented out debug actions and settings modal code that were specific to the demo.
 */
import LoadingStateScreen from '@/common/loading/LoadingStateScreen';
import stylex from '@stylexjs/stylex';
import {Suspense} from 'react';
import {Outlet} from 'react-router-dom';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: '100vh',
    backgroundColor: '#000',
  },
  content: {
    position: 'relative',
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'auto',
    overflowY: {
      default: 'auto',
      '@media screen and (max-width: 768px)': 'auto',
    },
  },
  debugActions: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 100,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 3,
  },
});

export default function RootLayout() {
  // const {openModal, hasChanged} = useSettingsContext();

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.content)}>
        <Suspense
          fallback={
            <LoadingStateScreen
              title="Loading..."
              description="This may take a few moments, you're almost there!"
            />
          }>
          <Outlet />
        </Suspense>
      </div>
      {/* <div {...stylex.props(styles.debugActions)}>
        <Indicator>
          {hasChanged && (
            <Indicator.Item
              className="badge badge-primary scale-50"
              horizontal="start"
              vertical="top"
            />
          )}
          <Button
            color="ghost"
            onClick={openModal}
            shape="circle"
            size="xs"
            startIcon={<Cog6ToothIcon className="w-4 h-4" />}
            title="Bugnub"
          />
        </Indicator>
      </div> */}
    </div>
  );
}
