import { useState, useEffect } from 'react';
import type { Entity } from '@/lib/mshnctrl/services/ontology.service';
import { isUrgent } from '@/lib/mshnctrl/utils/urgency';

export function useInterruptDetection(rfis: Entity[], tasks: Entity[]) {
    const [lastCheck, setLastCheck] = useState<number>(Date.now());
    const [newUrgent, setNewUrgent] = useState<Entity[]>([]);

    // Initial load shouldn't trigger interrupts, only new items arriving after proper load
    // or checks happening after the user effectively "clears" the current state.
    // However, for the very first render, we might want to show what's currently pressing if we want that behavior.
    // For now, let's treat "interrupts" as things that happen *while* using the dashboard.

    useEffect(() => {
        // Detect items created after lastCheck with high/critical priority
        // Note: This relies on entities having a 'created_at' property.
        // Use a safety check for the property.

        if (!rfis.length && !tasks.length) return;

        const allEntities = [...rfis, ...tasks];

        const urgent = allEntities.filter(item => {
            // Check if urgent
            if (!isUrgent(item)) return false;

            // Check if created/modified after last check
            // Using created_at for "new" interrupts. 
            // We might want to look at 'updated_at' if priority changes, 
            // but let's stick to new urgent items for now as per plan.
            const timestamp = item.created_at || item.properties?.created_at;
            if (!timestamp) return false;

            return new Date(timestamp).getTime() > lastCheck;
        });

        if (urgent.length > 0) {
            setNewUrgent(prev => {
                // Avoid duplicates
                const prevIds = new Set(prev.map(p => p.id));
                const uniqueNew = urgent.filter(u => !prevIds.has(u.id));
                if (uniqueNew.length === 0) return prev;
                return [...prev, ...uniqueNew];
            });
        }
    }, [rfis, tasks, lastCheck]);

    const markAsChecked = () => {
        setLastCheck(Date.now());
        setNewUrgent([]); // Clear current notifications
    };

    const dismissItem = (id: string) => {
        setNewUrgent(prev => prev.filter(item => item.id !== id));
    };

    return {
        newUrgent,
        markAsChecked,
        dismissItem
    };
}
