import { createFileRoute } from '@tanstack/react-router';
import { OntologyManager } from '@/features/smartops/components/OntologyManager';

export const Route = createFileRoute('/smartops/ontology')({
    component: OntologyManager,
});
