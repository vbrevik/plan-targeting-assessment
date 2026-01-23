
import { createLazyFileRoute } from '@tanstack/react-router';
import { BattleRhythmManagement } from '@/features/smartops/components/BattleRhythmManagement';

export const Route = createLazyFileRoute('/smartops/battle-rhythm')({
    component: BattleRhythmManagement,
});
