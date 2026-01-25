
import { createLazyFileRoute } from '@tanstack/react-router';
import { BattleRhythmManagement } from '@/features/operations/BattleRhythmManagement';

export const Route = createLazyFileRoute('/smartops/battle-rhythm')({
    component: BattleRhythmManagement,
});
