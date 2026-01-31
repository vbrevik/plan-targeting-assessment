import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { OperationalContext, OperationPhase } from '@/lib/mshnctrl/types';

// Default strategic context (view all)
const DEFAULT_CONTEXT: OperationalContext = {
    level: 'Strategic',
    campaignId: null,
    operationId: null,
    oplanId: null,
    missionId: null,
    name: 'Strategic Overview',
    phase: undefined
};

interface OperationalContextValue {
    context: OperationalContext;
    setContext: (ctx: OperationalContext) => void;
    isStrategic: boolean;
    filterByContext: <T extends { operationId?: string; campaignId?: string }>(entity: T) => boolean;
    setOperationalFocus: (operationId: string, name: string, phase: OperationPhase, campaignId: string, oplanId?: string) => void;
    returnToStrategic: () => void;
}

const OperationalContextInstance = createContext<OperationalContextValue | null>(null);

const STORAGE_KEY = 'mshnctrl_operational_context';

export function OperationalContextProvider({ children }: { children: ReactNode }) {
    const [context, setContextState] = useState<OperationalContext>(DEFAULT_CONTEXT);

    // Load from localStorage on mount, or fetch active campaign
    useEffect(() => {
        const initialize = async () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setContextState(parsed);
                    return;
                } catch {
                    // Invalid stored data, fall through to fetch
                }
            }

            // If no local state, try to get active campaign from backend
            try {
                const { MshnCtrlService } = await import('@/lib/mshnctrl/mock-service');
                const activeCampaign = await MshnCtrlService.getActiveCampaign();

                if (activeCampaign) {
                    const initialContext: OperationalContext = {
                        level: 'Operational',
                        campaignId: activeCampaign.id,
                        operationId: null,
                        oplanId: null,
                        missionId: null,
                        name: activeCampaign.name,
                        phase: undefined
                    };
                    setContextState(initialContext);
                    // Don't save to localStorage yet, only on user interaction or if you want it sticky immediately
                    // localStorage.setItem(STORAGE_KEY, JSON.stringify(initialContext)); 
                }
            } catch (e) {
                console.error("Failed to initialize context from backend", e);
            }
        };

        initialize();
    }, []);

    // Persist to localStorage on change
    const setContext = (ctx: OperationalContext) => {
        setContextState(ctx);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    };

    // Derived state
    const isStrategic = context.level === 'Strategic';

    // Filter helper for data views
    const filterByContext = <T extends { operationId?: string; campaignId?: string }>(entity: T): boolean => {
        if (isStrategic) return true; // Strategic view shows everything
        if (context.operationId && entity.operationId) {
            return entity.operationId === context.operationId;
        }
        if (context.campaignId && entity.campaignId) {
            return entity.campaignId === context.campaignId;
        }
        return true; // If entity has no context fields, show it
    };

    // Convenience method to set operational focus
    const setOperationalFocus = (
        operationId: string,
        name: string,
        phase: OperationPhase,
        campaignId: string,
        oplanId?: string
    ) => {
        setContext({
            level: 'Operational',
            campaignId,
            operationId,
            oplanId: oplanId || null,
            missionId: null,
            name,
            phase
        });
    };

    // Return to strategic view
    const returnToStrategic = () => {
        setContext(DEFAULT_CONTEXT);
    };

    return (
        <OperationalContextInstance.Provider
            value={{
                context,
                setContext,
                isStrategic,
                filterByContext,
                setOperationalFocus,
                returnToStrategic
            }}
        >
            {children}
        </OperationalContextInstance.Provider>
    );
}

export function useOperationalContext(): OperationalContextValue {
    const ctx = useContext(OperationalContextInstance);
    if (!ctx) {
        throw new Error('useOperationalContext must be used within OperationalContextProvider');
    }
    return ctx;
}

// Phase color helper
export function getPhaseColor(phase?: OperationPhase): string {
    switch (phase) {
        case 'Capacity Building':
        case 'Crisis Response Planning':
            return 'bg-blue-600 text-white';
        case 'Execution':
            return 'bg-emerald-600 text-white';
        case 'Transition':
            return 'bg-amber-600 text-white';
        case 'Lessons Learned':
            return 'bg-purple-600 text-white';
        default:
            return 'bg-slate-700 text-slate-300';
    }
}
