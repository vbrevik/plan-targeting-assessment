
export interface SystemModule {
    id: string;
    name: string;
    epic: string;
    status: 'PLANNED' | 'Under Construction' | 'Mocked' | 'Connected' | 'Verified';
    sprint: number; // 0=done, 1=current, 2=next
    health: number; // 0-100
    description: string;
    owner: string;
    coordinates: { x: number; y: number; z: number };
}

export const systemModules: SystemModule[] = [
    // --- FOUNDATION (Done) ---
    {
        id: 'auth',
        name: 'Auth & ABAC',
        epic: 'Foundation',
        status: 'Verified',
        sprint: 0,
        health: 100,
        description: 'Identity management and role-based access control.',
        owner: 'Platform Team',
        coordinates: { x: 0, y: 0, z: 0 }
    },
    {
        id: 'dashboard',
        name: 'Command Dashboard',
        epic: 'Foundation',
        status: 'Verified',
        sprint: 0,
        health: 98,
        description: 'Main landing page and status overview.',
        owner: 'Platform Team',
        coordinates: { x: 0, y: 10, z: 0 }
    },

    // --- SPRINT 1: FOUNDATION & FEEDBACK (Active) ---
    {
        id: 'feedback',
        name: 'Feedback Engine',
        epic: 'Foundation',
        status: 'Under Construction',
        sprint: 1,
        health: 65,
        description: 'Variance detection and lesson learning loops.',
        owner: 'Platform Team',
        coordinates: { x: 20, y: 0, z: 10 }
    },
    {
        id: 'digital_twin',
        name: 'Digital Twin',
        epic: 'Core Ops',
        status: 'Mocked',
        sprint: 1,
        health: 80,
        description: 'Operational environment visualization and state engine.',
        owner: 'Sim Team',
        coordinates: { x: 10, y: 20, z: 5 }
    },
    {
        id: 'proposals',
        name: 'Proposals / C2',
        epic: 'Core Ops',
        status: 'Mocked',
        sprint: 1,
        health: 85,
        description: 'Workflow engine for plans and orders.',
        owner: 'J5 Plans',
        coordinates: { x: -10, y: 20, z: 5 }
    },

    // --- SPRINT 2: TRUSTED DATA ---
    {
        id: 'uncertainty',
        name: 'Data Quality',
        epic: 'Trusted Data',
        status: 'Mocked',
        sprint: 2,
        health: 90,
        description: 'Uncertainty quantification and assumptions registry.',
        owner: 'J2 Intel',
        coordinates: { x: 30, y: 30, z: 0 }
    },
    {
        id: 'targeting',
        name: 'Targeting',
        epic: 'Core Ops',
        status: 'Mocked',
        sprint: 2,
        health: 90,
        description: 'Target folder management and validation.',
        owner: 'Targeting Cell',
        coordinates: { x: 30, y: 10, z: 20 }
    },

    // --- SPRINT 3: FUSION ---
    {
        id: 'fusion',
        name: 'Data Fusion',
        epic: 'Intel Fusion',
        status: 'PLANNED',
        sprint: 3,
        health: 20,
        description: 'JDL Level 1-2 fusion and entity resolution.',
        owner: 'J2 Intel',
        coordinates: { x: 40, y: 40, z: 10 }
    },

    // --- SPRINT 4: ADVANCED ---
    {
        id: 'mdo',
        name: 'MDO Sync',
        epic: 'Advanced Ops',
        status: 'Mocked',
        sprint: 4,
        health: 85,
        description: 'Multi-domain synchronization matrix.',
        owner: 'J3 Ops',
        coordinates: { x: 50, y: 0, z: 30 }
    },
    {
        id: 'ai_copilot',
        name: 'AI Planning',
        epic: 'Advanced Ops',
        status: 'PLANNED',
        sprint: 4,
        health: 10,
        description: 'LLM-assisted planning and decision support.',
        owner: 'Research',
        coordinates: { x: 50, y: 20, z: 40 }
    }
];

export const sprints = [
    { id: 1, name: 'Foundation', status: 'ACTIVE' },
    { id: 2, name: 'Trusted Data', status: 'PLANNED' },
    { id: 3, name: 'Fusion & State', status: 'PLANNED' },
    { id: 4, name: 'Advanced Ops', status: 'PLANNED' }
];
