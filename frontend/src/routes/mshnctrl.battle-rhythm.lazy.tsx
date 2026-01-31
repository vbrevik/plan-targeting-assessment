
import { createLazyFileRoute } from '@tanstack/react-router';
import { BattleRhythmManagement } from '@/features/operations/BattleRhythmManagement';

export const Route = createLazyFileRoute('/mshnctrl/battle-rhythm')({
    component: BattleRhythmManagement,
});
