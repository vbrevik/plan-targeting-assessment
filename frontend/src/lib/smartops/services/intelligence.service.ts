import { store, LATENCY } from './store';
import type {
    RequestForInformation,
    UUID,
    ProductReport,
    CenterOfGravity,
    CriticalVulnerability,
    Unit
} from '../types';

export const IntelligenceService = {
    getRFIs: async (direction?: 'Inbound' | 'Outbound'): Promise<RequestForInformation[]> => {
        return new Promise(resolve => setTimeout(() => {
            const data = direction ? store.rfis.filter(r => r.direction === direction) : store.rfis;
            resolve([...data]);
        }, LATENCY));
    },

    getUnits: async (): Promise<Unit[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.units]), LATENCY));
    },

    createRFI: async (rfi: Omit<RequestForInformation, 'id' | 'createdAt' | 'responses'>): Promise<RequestForInformation> => {
        return new Promise(resolve => setTimeout(() => {
            const newRfi: RequestForInformation = {
                ...rfi,
                id: `rfi-${Date.now()}`,
                createdAt: new Date().toISOString(),
                responses: []
            };
            store.rfis.unshift(newRfi);
            resolve(newRfi);
        }, LATENCY));
    },

    addRFIResponse: async (rfiId: UUID, text: string, responder: string): Promise<RequestForInformation> => {
        return new Promise((resolve, reject) => setTimeout(() => {
            const rfi = store.rfis.find(r => r.id === rfiId);
            if (!rfi) return reject('RFI not found');
            rfi.responses.push({
                id: `resp-${Date.now()}`,
                text,
                responder,
                date: new Date().toISOString()
            });
            rfi.status = 'Pending';
            resolve({ ...rfi });
        }, LATENCY));
    },

    updateRFIStatus: async (rfiId: UUID, status: 'Open' | 'Pending' | 'Closed'): Promise<RequestForInformation> => {
        return new Promise((resolve, reject) => setTimeout(() => {
            const rfi = store.rfis.find(r => r.id === rfiId);
            if (!rfi) return reject('RFI not found');
            rfi.status = status;
            resolve({ ...rfi });
        }, LATENCY));
    },

    getProductReports: async (): Promise<ProductReport[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.productReports]), LATENCY));
    },

    generateProductReport: async (title: string, type: ProductReport['type'], content: any, author: string): Promise<ProductReport> => {
        return new Promise(resolve => setTimeout(() => {
            const hash = IntelligenceService._generateMockHash(JSON.stringify(content) + title + author);
            const report: ProductReport = {
                id: `prod-${Date.now()}`,
                title,
                type,
                content,
                author,
                summary: 'Automatically generated report based on operational data.',
                generatedAt: new Date().toISOString(),
                integrityHash: hash,
                status: 'Draft',
                version: 1
            };
            store.productReports.unshift(report);
            resolve(report);
        }, LATENCY));
    },

    _generateMockHash: (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const hex = Math.abs(hash).toString(16).padStart(8, '0');
        return `sha256-${hex}${hex}${hex}${hex}`.substring(0, 71);
    },

    getInformationRequirements: async () => {
        return new Promise(resolve => setTimeout(() => resolve([...store.informationRequirements]), LATENCY));
    },

    getInformationFlows: async () => {
        return new Promise(resolve => setTimeout(() => resolve([...store.informationFlows]), LATENCY));
    },

    getCOGs: async (side?: CenterOfGravity['side']): Promise<CenterOfGravity[]> => {
        return new Promise(resolve => setTimeout(() => {
            const data = side ? store.cogs.filter(c => c.side === side) : store.cogs;
            resolve([...data]);
        }, LATENCY));
    },

    updateCVStatus: async (cvId: UUID, status: CriticalVulnerability['status']): Promise<void> => {
        return new Promise((resolve, reject) => setTimeout(() => {
            for (const cog of store.cogs) {
                for (const cc of cog.capabilities) {
                    for (const cr of cc.requirements) {
                        const cv = cr.vulnerabilities.find(v => v.id === cvId);
                        if (cv) {
                            cv.status = status;
                            return resolve();
                        }
                    }
                }
            }
            reject('Vulnerability not found');
        }, LATENCY));
    },

    updateCVProtection: async (cvId: UUID, protection: CriticalVulnerability['protectionStatus'], resilience?: number): Promise<void> => {
        return new Promise((resolve, reject) => setTimeout(() => {
            for (const cog of store.cogs) {
                for (const cc of cog.capabilities) {
                    for (const cr of cc.requirements) {
                        const cv = cr.vulnerabilities.find(v => v.id === cvId);
                        if (cv) {
                            if (protection) cv.protectionStatus = protection;
                            if (resilience !== undefined) cv.resilienceScore = resilience;
                            return resolve();
                        }
                    }
                }
            }
            reject('Vulnerability not found');
        }, LATENCY));
    },

    getOrbat: async (side?: 'Blue' | 'Red' | 'Grey') => {
        return new Promise(resolve => setTimeout(() => {
            const data = side ? store.units.filter((u: Unit) => u.affiliation === side) : store.units;
            resolve(data);
        }, LATENCY));
    }
};
