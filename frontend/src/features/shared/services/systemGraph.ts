
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

    // --- CORE OPS (Connected to real backend) ---
    {
        id: 'targeting',
        name: 'Targeting',
        epic: 'Core Ops',
        status: 'Connected',
        sprint: 1,
        health: 90,
        description: 'Target folder management and validation.',
        owner: 'Targeting Cell',
        coordinates: { x: 30, y: 10, z: 20 }
    },
    {
        id: 'bda',
        name: 'BDA',
        epic: 'Core Ops',
        status: 'Connected',
        sprint: 1,
        health: 92,
        description: 'Battle Damage Assessment phases and reporting.',
        owner: 'Targeting Cell',
        coordinates: { x: 30, y: 0, z: 10 }
    },
    {
        id: 'roe',
        name: 'ROE Engine',
        epic: 'Core Ops',
        status: 'Connected',
        sprint: 1,
        health: 95,
        description: 'Rules of Engagement management and compliance.',
        owner: 'LEGAD',
        coordinates: { x: 20, y: 0, z: 10 }
    },
    {
        id: 'ontology',
        name: 'Ontology / IM',
        epic: 'Foundation',
        status: 'Connected',
        sprint: 0,
        health: 94,
        description: 'Entity and relationship graph model for information management.',
        owner: 'Platform Team',
        coordinates: { x: 10, y: 0, z: 0 }
    },
    {
        id: 'strategy',
        name: 'Strategy',
        epic: 'Core Ops',
        status: 'Connected',
        sprint: 1,
        health: 85,
        description: 'Strategic planning and commander intent.',
        owner: 'J5 Plans',
        coordinates: { x: -10, y: 10, z: 5 }
    },
    {
        id: 'assumptions',
        name: 'Planning / Assumptions',
        epic: 'Core Ops',
        status: 'Connected',
        sprint: 1,
        health: 80,
        description: 'Assumption management and campaign planning.',
        owner: 'J5 Plans',
        coordinates: { x: -10, y: 20, z: 5 }
    },

    // --- MOCKED (Frontend only, no backend) ---
    {
        id: 'decisions',
        name: 'Decisions / C2',
        epic: 'Core Ops',
        status: 'Mocked',
        sprint: 2,
        health: 65,
        description: 'Decision tracking and workflow engine.',
        owner: 'J3 Ops',
        coordinates: { x: -20, y: 20, z: 10 }
    },
    {
        id: 'logistics',
        name: 'Logistics',
        epic: 'Core Ops',
        status: 'Mocked',
        sprint: 2,
        health: 40,
        description: 'Supply chain and logistics management.',
        owner: 'J4 Log',
        coordinates: { x: -20, y: 30, z: 15 }
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

    // --- PLANNED ---
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
