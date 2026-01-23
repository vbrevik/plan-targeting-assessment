import { store, LATENCY } from './store';
import type { Target, TargetStatus, ROE, UUID, StrikeAnalysis, BDAReport, TargetSystem, WeaponSystem, ActivityLog, CollectionRequest } from '../types';

export const TargetingService = {
    getTargets: async (): Promise<Target[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.targets]), LATENCY));
    },

    getTarget: async (id: UUID): Promise<Target | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(store.targets.find(t => t.id === id)), LATENCY));
    },

    updateTargetStatus: async (id: UUID, status: TargetStatus): Promise<Target> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = store.targets.findIndex(t => t.id === id);
                if (idx === -1) return reject('Target not found');
                store.targets[idx] = { ...store.targets[idx], status: status as any };
                resolve(store.targets[idx]);
            }, LATENCY);
        });
    },

    getROEs: async (): Promise<ROE[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.roes]), LATENCY));
    },

    releaseROE: async (id: UUID): Promise<ROE> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = store.roes.findIndex(r => r.id === id);
                if (idx === -1) return reject('ROE not found');
                store.roes[idx] = { ...store.roes[idx], status: 'Released' };
                resolve(store.roes[idx]);
            }, LATENCY);
        });
    },

    getStrikeAnalysis: async (targetId: UUID): Promise<StrikeAnalysis | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(store.strikeAnalyses.find(a => a.targetId === targetId)), LATENCY));
    },

    getBDAReports: async (targetId?: UUID): Promise<BDAReport[]> => {
        return new Promise(resolve => setTimeout(() => {
            const reports = targetId ? store.bdaReports.filter(r => r.targetId === targetId) : store.bdaReports;
            resolve(reports);
        }, LATENCY));
    },

    submitStrikeRequest: async (_targetId: UUID, _weaponSystem: string, _justification: string): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const target = store.targets.find(t => t.id === _targetId);
                if (target) {
                    target.status = 'Engaged' as any;
                    target.bdaStatus = 'Assess';
                }
                resolve();
            }, LATENCY);
        });
    },

    // --- DEEP DIVE: TARGETING SYSTEMS ---
    getTargetSystems: async (): Promise<TargetSystem[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.targetSystems]), LATENCY));
    },

    getWeaponSystems: async (): Promise<WeaponSystem[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.weaponSystems]), LATENCY));
    },

    getActivityLogs: async (targetId?: UUID): Promise<ActivityLog[]> => {
        return new Promise(resolve => setTimeout(() => {
            if (targetId) {
                resolve(store.activityLogs.filter(log => log.targetId === targetId));
            } else {
                resolve([...store.activityLogs]);
            }
        }, LATENCY));
    },

    getCollectionRequests: async (targetId?: UUID): Promise<CollectionRequest[]> => {
        return new Promise(resolve => setTimeout(() => {
            if (targetId) {
                resolve(store.collectionRequests.filter(cr => cr.targetId === targetId));
            } else {
                resolve([...store.collectionRequests]);
            }
        }, LATENCY));
    },

    updateBDAReport: async (report: Partial<BDAReport> & { id: UUID }): Promise<BDAReport> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = store.bdaReports.findIndex(r => r.id === report.id);
                if (idx === -1) return reject('Report not found');
                store.bdaReports[idx] = { ...store.bdaReports[idx], ...report };
                resolve(store.bdaReports[idx]);
            }, LATENCY);
        });
    },

    resolveAssessment: async (targetId: UUID, recommendation: 'Re-strike' | 'Effect Achieved' | 'Monitor'): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const target = store.targets.find(t => t.id === targetId);
                if (!target) return reject('Target not found');

                target.bdaStatus = recommendation;
                target.killChainPhase = recommendation === 'Re-strike' ? 'Target' : 'Assess';

                if (recommendation === 'Re-strike') {
                    target.targetStatus = 'Nominated'; // Move back to nominated for re-strike consideration
                }

                resolve();
            }, LATENCY);
        });
    }
};
