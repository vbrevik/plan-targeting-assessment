// Test Fixtures for Targeting Workbench E2E Tests
// Provides consistent test data across all test suites

export interface TestTarget {
  id?: string;
  name: string;
  type: 'HVT' | 'TST' | 'STANDARD' | 'HPT';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  coordinates: string;
  status: 'NOMINATED' | 'VALIDATED' | 'APPROVED' | 'ENGAGED' | 'ASSESSED';
  f3ead_stage?: 'FIND' | 'FIX' | 'FINISH' | 'EXPLOIT' | 'ANALYZE' | 'DISSEMINATE';
  classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET';
  tst_deadline?: Date;
  description?: string;
}

export interface TestUser {
  id: string;
  name: string;
  role: 'COMMANDER' | 'TARGETEER' | 'J2_OFFICER' | 'J3_OFFICER' | 'JTB_CHAIR' | 'BDA_ANALYST';
  clearance: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET';
  unit: string;
}

export interface TestMissionIntent {
  id: string;
  commanders_intent: string;
  targeting_guidance: string;
  decision_authority: string;
  operational_tempo: 'HIGH' | 'MEDIUM' | 'LOW';
  classification: string;
  is_current: boolean;
}

export interface TestBDAReport {
  id: string;
  target_id: string;
  strike_id: string;
  bda_status: 'PENDING' | 'ASSESSING' | 'COMPLETE';
  effectiveness_pct: number;
  description: string;
  images: string[];
  classification: string;
}

// Test Data Sets
export const testTargets = {
  // High-Value Target for standard workflow
  hvt: {
    name: 'HVT-TEST-001',
    type: 'HVT' as const,
    priority: 'CRITICAL' as const,
    coordinates: '31.7683N, 35.2137E',
    status: 'NOMINATED' as const,
    f3ead_stage: 'FIND' as const,
    classification: 'SECRET' as const,
    description: 'Enemy command and control center'
  },

  // Time-Sensitive Target for rapid workflow
  tst: {
    name: 'TST-TEST-002',
    type: 'TST' as const,
    priority: 'TIME_CRITICAL' as const,
    coordinates: '31.7500N, 35.2000E',
    status: 'NOMINATED' as const,
    f3ead_stage: 'FIX' as const,
    classification: 'SECRET' as const,
    tst_deadline: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
    description: 'Mobile missile launcher preparing to launch'
  },

  // Standard target for normal workflow
  standard: {
    name: 'STD-TEST-003',
    type: 'STANDARD' as const,
    priority: 'MEDIUM' as const,
    coordinates: '31.7800N, 35.2200E',
    status: 'NOMINATED' as const,
    f3ead_stage: 'FIND' as const,
    classification: 'CONFIDENTIAL' as const,
    description: 'Enemy ammunition storage facility'
  },

  // High-Priority Target
  hpt: {
    name: 'HPT-TEST-004',
    type: 'HPT' as const,
    priority: 'HIGH' as const,
    coordinates: '31.7600N, 35.2100E',
    status: 'NOMINATED' as const,
    f3ead_stage: 'FINISH' as const,
    classification: 'SECRET' as const,
    description: 'Air defense radar system'
  }
};

export const testUsers = {
  commander: {
    id: 'user-commander-001',
    name: 'COL John Smith',
    role: 'COMMANDER' as const,
    clearance: 'SECRET' as const,
    unit: 'HQ, 1ST BDE'
  },

  targeteer: {
    id: 'user-targeteer-001',
    name: 'CPT Jane Doe',
    role: 'TARGETEER' as const,
    clearance: 'SECRET' as const,
    unit: 'S3, 1ST BDE'
  },

  j2_officer: {
    id: 'user-j2-001',
    name: 'MAJ Bob Johnson',
    role: 'J2_OFFICER' as const,
    clearance: 'SECRET' as const,
    unit: 'S2, 1ST BDE'
  },

  j3_officer: {
    id: 'user-j3-001',
    name: 'MAJ Sarah Wilson',
    role: 'J3_OFFICER' as const,
    clearance: 'SECRET' as const,
    unit: 'S3, 1ST BDE'
  },

  jtb_chair: {
    id: 'user-jtb-001',
    name: 'LTC Mike Brown',
    role: 'JTB_CHAIR' as const,
    clearance: 'SECRET' as const,
    unit: 'JTB, 1ST BDE'
  },

  bda_analyst: {
    id: 'user-bda-001',
    name: 'SSG Emily Davis',
    role: 'BDA_ANALYST' as const,
    clearance: 'CONFIDENTIAL' as const,
    unit: 'BDA Team, 1ST BDE'
  }
};

export const testMissionData = {
  intent: {
    id: 'mission-intent-001',
    commanders_intent: 'Disrupt enemy C2 capabilities in sector Alpha to enable ground maneuver',
    targeting_guidance: 'Prioritize C2 nodes, communications facilities, and command bunkers. Avoid collateral damage near civilian areas.',
    decision_authority: 'BDE CMDR has approval authority for all targets in sector Alpha',
    operational_tempo: 'HIGH' as const,
    classification: 'SECRET',
    is_current: true
  }
};

export const testBDAData = {
  successful_strike: {
    id: 'bda-001',
    target_id: 'target-001',
    strike_id: 'strike-001',
    bda_status: 'COMPLETE' as const,
    effectiveness_pct: 85,
    description: 'Target destroyed with secondary explosions observed',
    images: ['post-strike-001.jpg', 'post-strike-002.jpg'],
    classification: 'SECRET'
  },

  partial_strike: {
    id: 'bda-002',
    target_id: 'target-002',
    strike_id: 'strike-002',
    bda_status: 'COMPLETE' as const,
    effectiveness_pct: 40,
    description: 'Target damaged but functional, re-attack recommended',
    images: ['post-strike-003.jpg'],
    classification: 'SECRET'
  }
};

// Helper functions for test data
export function createTestTarget(overrides: Partial<TestTarget> = {}): TestTarget {
  return {
    ...testTargets.standard,
    ...overrides
  };
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    ...testUsers.targeteer,
    ...overrides
  };
}

export function createTestMissionIntent(overrides: Partial<TestMissionIntent> = {}): TestMissionIntent {
  return {
    ...testMissionData.intent,
    ...overrides
  };
}

export function createTestBDAReport(overrides: Partial<TestBDAReport> = {}): TestBDAReport {
  return {
    ...testBDAData.successful_strike,
    ...overrides
  };
}

// API response mocks
export const mockApiResponses = {
  targetCreated: {
    id: 'target-001',
    name: 'HVT-TEST-001',
    type: 'HVT',
    priority: 'CRITICAL',
    status: 'NOMINATED',
    created_at: new Date().toISOString()
  },

  decisionGates: {
    roe: { name: 'ROE', status: 'GREEN', value: 'WEAPON FREE', classification: 'SECRET' },
    cde: { name: 'CDE', status: 'YELLOW', value: 'MODERATE RISK', classification: 'SECRET' },
    weather: { name: 'Weather', status: 'GREEN', value: 'CLEAR', classification: 'UNCLASSIFIED' },
    deconfliction: { name: 'Deconfliction', status: 'GREEN', value: 'CLEAR', classification: 'SECRET' }
  },

  dtlEntries: [
    {
      id: 'dtl-001',
      target_id: 'target-001',
      target_name: 'HVT-TEST-001',
      priority_score: 95,
      feasibility_score: 88,
      combined_score: 91.5,
      aging_hours: 2.5,
      tst_deadline: null
    }
  ],

  missionCommand: {
    intent: testMissionData.intent,
    targeting_guidance: testMissionData.intent.targeting_guidance,
    authority_matrix: testMissionData.intent.decision_authority,
    operational_tempo: testMissionData.intent.operational_tempo
  }
};

// Performance benchmarks
export const performanceBenchmarks = {
  pageLoad: 2000,        // 2 seconds
  apiResponse: 1000,     // 1 second
  decisionGateRefresh: 30000, // 30 seconds
  targetCreation: 5000,  // 5 seconds
  bdaSubmission: 3000    // 3 seconds
};