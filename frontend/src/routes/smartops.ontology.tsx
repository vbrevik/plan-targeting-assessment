import { createFileRoute } from '@tanstack/react-router';
import { OntologyProofView } from '@/features/intelligence/OntologyProofView';

export const Route = createFileRoute('/smartops/ontology')({
    component: OntologyProofView,
});
