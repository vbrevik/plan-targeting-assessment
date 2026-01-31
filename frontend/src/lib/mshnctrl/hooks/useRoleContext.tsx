import { createContext, useContext, useState } from 'react';
import { useAuth } from '@/features/auth/lib/context';
import type { ReactNode } from 'react';

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
    },
    {
        id: 'im',
        name: 'Information Manager',
        shortName: 'IM',
        description: 'Information lifecycle and knowledge management',
        permissions: [
            'rfis.view',
            'ontology.view',
            'ontology.manage',
            'digital_twin.view',
            'cop.view',
            'rxp.view',
            'documents.view',
            'menu.manage',
            'tor.manage',
            'battle_rhythm.view'
        ],
        color: 'teal',
        capabilities: {
            canEditIntel: false,
            canViewIntel: true,
            canEditOperations: true, // IM can edit some operational data like TOR
            canViewOperations: true,
            canEditPlans: true, // IM can edit ontology-based plans
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
            canViewLegal: false,
            canApproveDecisions: false,
            canSubmitProposals: true,
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
    const { user, isAuthenticated } = useAuth();

    // Local state for demo mode (when not logged in)
    const [demoRole, setDemoRole] = useState<Role>(() => {
        const stored = localStorage.getItem('demo-role');
        if (stored) {
            const role = AVAILABLE_ROLES.find(r => r.id === stored);
            if (role) return role;
        }
        return AVAILABLE_ROLES[0]; // Default to Commander
    });

    // Derive current role implies merging Auth state when available
    // We construct a Role object from the authenticated user profile if available
    const authenticatedRole: Role | null = isAuthenticated && user ? {
        id: user.roles?.[0]?.role_name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-role',
        name: user.roles?.[0]?.role_name || 'Authenticated User',
        shortName: user.username?.substring(0, 3).toUpperCase() || 'USR',
        description: 'Authenticated User Role',
        permissions: user.permissions || [],
        color: 'blue', // Default color
        // Capabilities could be derived from permissions in a real app, 
        // for now we default to a safe view-only set + permission overrides if needed
        capabilities: {
            canEditIntel: user.permissions?.includes('intelligence.edit') || false,
            canViewIntel: true,
            canEditOperations: user.permissions?.includes('operations.edit') || false,
            canViewOperations: true,
            canEditPlans: user.permissions?.includes('plans.edit') || false,
            canViewPlans: true,
            canEditAssumptions: user.permissions?.includes('assumptions.edit') || false,
            canEditTargets: user.permissions?.includes('targeting.edit') || false,
            canApproveTargets: user.permissions?.includes('targeting.approve') || false,
            canViewTargets: true,
            canEditLogistics: user.permissions?.includes('logistics.edit') || false,
            canRequestSupply: user.permissions?.includes('logistics.request') || false,
            canViewLogistics: true,
            canEditLegal: user.permissions?.includes('legal.edit') || false,
            canApproveROE: user.permissions?.includes('roe.approve') || false,
            canViewLegal: true,
            canApproveDecisions: user.permissions?.includes('decisions.approve') || false,
            canSubmitProposals: true,
        }
    } : null;

    // Use authenticated role if logged in, otherwise demo role (or overridden)
    const currentRole = isAuthenticated ? (demoRole.id === authenticatedRole?.id ? authenticatedRole : demoRole) : demoRole;

    const setRole = (roleId: string) => {
        const role = AVAILABLE_ROLES.find(r => r.id === roleId);
        if (role) {
            setDemoRole(role);
            localStorage.setItem('demo-role', roleId);

            // If authenticated, we allow override but maybe warn
            if (isAuthenticated) {
                console.info(`Debug: Overriding authenticated role ${authenticatedRole?.shortName} with demo role ${role.shortName}`);
            }
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
