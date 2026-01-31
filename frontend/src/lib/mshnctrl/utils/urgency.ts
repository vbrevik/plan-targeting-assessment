import type { Entity } from '@/lib/mshnctrl/services/ontology.service';

export function isUrgent(entity: Entity): boolean {
    const priority = entity.properties?.priority?.toLowerCase();
    return priority === 'critical' || priority === 'high';
}

export function shouldInterrupt(entity: Entity): boolean {
    const priority = entity.properties?.priority?.toLowerCase();
    return priority === 'critical';
}

export function getUrgencyLevel(entity: Entity): 'critical' | 'high' | 'normal' | 'low' {
    const priority = entity.properties?.priority?.toLowerCase();
    if (priority === 'critical') return 'critical';
    if (priority === 'high') return 'high';
    if (priority === 'low') return 'low';
    return 'normal';
}
