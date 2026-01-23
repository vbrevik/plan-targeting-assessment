import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface RoleCapabilities {
    // Intelligence
    canEditIntel: boolean;
    canViewIntel: boolean;
    // Operations
    canEditOperations: boolean;
    canViewOperations: boolean;
    // Planning
    canEditPlans: boolean;
    canViewPlans: boolean;
    canEditAssumptions: boolean;
    // Targeting
    canEditTargets: boolean;
    canApproveTargets: boolean;
    canViewTargets: boolean;
    // Logistics
    canEditLogistics: boolean;
    canRequestSupply: boolean;
    canViewLogistics: boolean;
    // Legal
    canEditLegal: boolean;
    canApproveROE: boolean;
    canViewLegal: boolean;
    // General
    canApproveDecisions: boolean;
    canSubmitProposals: boolean;
}

export interface Role {
    id: string;
    name: string;
    shortName: string;
    description: string;
    permissions: string[];
    color: string; // For UI styling
    capabilities: RoleCapabilities;
}

// Demo roles for the system
export const AVAILABLE_ROLES: Role[] = [
    {
        id: 'commander',
        name: 'Commander',
        shortName: 'CDR',
        description: 'Overall operational command authority',
        permissions: ['*'], // All permissions
        color: 'red',
        capabilities: {
            canEditIntel: true,
            canViewIntel: true,
            canEditOperations: true,
            canViewOperations: true,
            canEditPlans: true,
            canViewPlans: true,
            canEditAssumptions: true,
            canEditTargets: true,
            canApproveTargets: true,
            canViewTargets: true,
            canEditLogistics: true,
            canRequestSupply: true,
            canViewLogistics: true,
            canEditLegal: false,
            canApproveROE: true,
            canViewLegal: true,
            canApproveDecisions: true,
            canSubmitProposals: true,
        }
    },
    {
        id: 'j2-intel',
        name: 'J2 Intelligence Officer',
        shortName: 'J2',
        description: 'Intelligence analysis and assessments',
        permissions: ['uncertainty.view', 'intelligence.view', 'rxp.view', 'social.view', 'digital_twin.view', 'triage.view'],
        color: 'blue',
        capabilities: {
            canEditIntel: true,
            canViewIntel: true,
            canEditOperations: false,
            canViewOperations: true,
            canEditPlans: false,
            canViewPlans: true,
            canEditAssumptions: false,
            canEditTargets: false,
            canApproveTargets: false,
            canViewTargets: true,
            canEditLogistics: false,
            canRequestSupply: false,
            canViewLogistics: true,
            canEditLegal: false,
            canApproveROE: false,
            canViewLegal: true,
            canApproveDecisions: false,
            canSubmitProposals: true,
        }
    },
    {
        id: 'j3-ops',
        name: 'J3 Operations Officer',
        shortName: 'J3',
        description: 'Current operations management',
        permissions: ['cop.view', 'battle_rhythm.view', 'proposals.view', 'rfis.view', 'targeting.view', 'cnr.view'],
        color: 'green',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: true,
            canViewOperations: true,
            canEditPlans: false,
            canViewPlans: true,
            canEditAssumptions: false,
            canEditTargets: false,
            canApproveTargets: false,
            canViewTargets: true,
            canEditLogistics: false,
            canRequestSupply: true,
            canViewLogistics: true,
            canEditLegal: false,
            canApproveROE: false,
            canViewLegal: true,
            canApproveDecisions: false,
            canSubmitProposals: true,
        }
    },
    {
        id: 'j5-plans',
        name: 'J5 Plans Officer',
        shortName: 'J5',
        description: 'Strategic planning and OPLAN development',
        permissions: ['oplan.view', 'campaign.view', 'cog.view', 'coa.view', 'conops.view', 'strategic.view', 'assumptions.view'],
        color: 'purple',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: false,
            canViewOperations: true,
            canEditPlans: true,
            canViewPlans: true,
            canEditAssumptions: true,
            canEditTargets: false,
            canApproveTargets: false,
            canViewTargets: true,
            canEditLogistics: false,
            canRequestSupply: false,
            canViewLogistics: true,
            canEditLegal: false,
            canApproveROE: false,
            canViewLegal: true,
            canApproveDecisions: false,
            canSubmitProposals: true,
        }
    },
    {
        id: 'j4-log',
        name: 'J4 Logistics Officer',
        shortName: 'J4',
        description: 'Logistics and supply chain management',
        permissions: ['logistics.view', 'infrastructure.view', 'supply_chain.view'],
        color: 'amber',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: false,
            canViewOperations: true,
            canEditPlans: false,
            canViewPlans: true,
            canEditAssumptions: false,
            canEditTargets: false,
            canApproveTargets: false,
            canViewTargets: false,
            canEditLogistics: true,
            canRequestSupply: true,
            canViewLogistics: true,
            canEditLegal: false,
            canApproveROE: false,
            canViewLegal: false,
            canApproveDecisions: false,
            canSubmitProposals: true,
        }
    },
    {
        id: 'legad',
        name: 'Legal Advisor (LEGAD)',
        shortName: 'LEGAD',
        description: 'Legal review and ROE guidance',
        permissions: ['advisory.view', 'roe.view', 'targeting.view', 'decision_board.view'],
        color: 'slate',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: false,
            canViewOperations: true,
            canEditPlans: false,
            canViewPlans: true,
            canEditAssumptions: false,
            canEditTargets: false,
            canApproveTargets: false,
            canViewTargets: true,
            canEditLogistics: false,
            canRequestSupply: false,
            canViewLogistics: false,
            canEditLegal: true,
            canApproveROE: true,
            canViewLegal: true,
            canApproveDecisions: true,
            canSubmitProposals: false,
        }
    },
    {
        id: 'targeting-cell',
        name: 'Targeting Cell',
        shortName: 'TC',
        description: 'Targeting operations and strike coordination',
        permissions: [
            'targeting.view',
            'targeting.nominate',
            'targeting.manage',
            'strike.view',
            'bda.view',
            'a2ad.view',
            'roe.view',
            'rxp.view',
            'orbat.view',
            'cop.view',
            'uncertainty.view',
        ],
        color: 'orange',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: false,
            canViewOperations: true,
            canEditPlans: false,
            canViewPlans: true,
            canEditAssumptions: false,
            canEditTargets: true,
            canApproveTargets: false,
            canViewTargets: true,
            canEditLogistics: false,
            canRequestSupply: false,
            canViewLogistics: true,
            canEditLegal: false,
            canApproveROE: false,
            canViewLegal: true,
            canApproveDecisions: false,
            canSubmitProposals: true,
        }
    },
    {
        id: 'analyst',
        name: 'Intelligence Analyst',
        shortName: 'ANLY',
        description: 'Junior analyst with limited access',
        permissions: ['cop.view', 'rxp.view', 'orbat.view', 'weather.view'],
        color: 'cyan',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: false,
            canViewOperations: true,
            canEditPlans: false,
            canViewPlans: true,
            canEditAssumptions: false,
            canEditTargets: false,
            canApproveTargets: false,
            canViewTargets: true,
            canEditLogistics: false,
            canRequestSupply: false,
            canViewLogistics: false,
            canEditLegal: false,
            canApproveROE: false,
            canViewLegal: false,
            canApproveDecisions: false,
            canSubmitProposals: false,
        }
    }
];

interface RoleContextType {
    currentRole: Role;
    setRole: (roleId: string) => void;
    availableRoles: Role[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
    // Load role from localStorage or default to Commander
    const [currentRole, setCurrentRole] = useState<Role>(() => {
        const stored = localStorage.getItem('demo-role');
        if (stored) {
            const role = AVAILABLE_ROLES.find(r => r.id === stored);
            if (role) return role;
        }
        return AVAILABLE_ROLES[0]; // Default to Commander
    });

    const setRole = (roleId: string) => {
        const role = AVAILABLE_ROLES.find(r => r.id === roleId);
        if (role) {
            setCurrentRole(role);
            localStorage.setItem('demo-role', roleId);
        }
    };

    return (
        <RoleContext.Provider value={{ currentRole, setRole, availableRoles: AVAILABLE_ROLES }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRoleContext() {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRoleContext must be used within a RoleProvider');
    }
    return context;
}
