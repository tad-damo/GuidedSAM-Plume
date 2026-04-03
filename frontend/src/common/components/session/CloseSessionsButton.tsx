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
 * - Updated session hook from single-video `useRestartSession` → multi-video `useCloseSessions`.
 * - Updated prop and handler names: `onRestartSession` → `onCloseSessions`.
 * - Updated button click logic to call `closeSessions(onCloseSessions)` instead of `restartSession`.
 * - Adjusted styling slightly for multi-video context (`h-12`, `flex items-center gap-2`) while keeping the "Start over" label and loading icon logic.
 */
import useCloseSessions from '@/common/components/session/useCloseSessions';
import {Reset} from '@carbon/icons-react';
import {Button, Loading} from 'react-daisyui';

type Props = {
  onCloseSessions: () => void;
};

export default function CloseSessionsButton({
  onCloseSessions: onCloseSessions,
}: Props) {
  const {closeSessions, isLoading} = useCloseSessions();

  function handleCloseSession() {
    closeSessions(onCloseSessions);
  }

  return (
    <Button
      color="ghost"
      onClick={handleCloseSession}
      className="!px-4 h-12 !rounded-full font-medium text-white hover:bg-black flex items-center gap-2"
      startIcon={isLoading ? <Loading size="sm" /> : <Reset size={20} />}>
      Start over
    </Button>
  );
}
