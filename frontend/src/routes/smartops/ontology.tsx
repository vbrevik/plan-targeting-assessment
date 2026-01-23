import { createFileRoute } from '@tanstack/react-router';
import { OntologyProofView } from '@/features/smartops/components/OntologyProofView';

export const Route = createFileRoute('/smartops/ontology')({
    component: OntologyProofView,
});
