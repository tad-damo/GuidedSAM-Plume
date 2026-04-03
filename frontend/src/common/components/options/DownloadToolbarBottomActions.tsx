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
 * Modifications:
 * - Replaced `RestartSessionButton` with `CloseSessionsButton` for multi-video handling.
 * - Removed `EFFECT_TOOLBAR_INDEX` references; only `OBJECT_TOOLBAR_INDEX` used.
 * - Added `useNavigate` to reset session state in history when closing sessions.
 * - Updated button labels to match segmenter workflow ("Edit Masks").
 */
import CloseSessionsButton from '@/common/components/session/CloseSessionsButton';
import {OBJECT_TOOLBAR_INDEX} from '@/common/components/toolbar/ToolbarConfig';
import {ChevronLeft} from '@carbon/icons-react';
import {Button} from 'react-daisyui';
import ToolbarBottomActionsWrapper from '../toolbar/ToolbarBottomActionsWrapper';
import {useNavigate} from 'react-router-dom';

type Props = {
  onTabChange: (newIndex: number) => void;
};

export default function DownloadToolbarBottomActions({onTabChange}: Props) {
  const navigate = useNavigate();

  function handleReturnToObjectsTab() {
    onTabChange(OBJECT_TOOLBAR_INDEX);
  }

  function handleOnCloseSessions() {
    navigate(
      {pathname: location.pathname, search: location.search},
      {state: {videos: undefined}},
    );
    onTabChange(OBJECT_TOOLBAR_INDEX);
  }
  return (
    <ToolbarBottomActionsWrapper>
      <CloseSessionsButton onCloseSessions={handleOnCloseSessions} />
      <Button
        color="ghost"
        onClick={handleReturnToObjectsTab}
        className="h-12 !px-4 !rounded-full font-medium text-white hover:bg-black flex items-center justify-center gap-2"
        startIcon={<ChevronLeft />}>
        Edit Masks
      </Button>
    </ToolbarBottomActionsWrapper>
  );
}
