import type {
    Proposal,
    CCIR,
    CCIRHit,
    Campaign,
    JointCoordinationOrder,
    Operation,
    LineOfOperation,
    DecisiveCondition,
    Target,
    AssessmentReport,
    Scenario,
    CourseOfAction,
    StrategicGuidance,
    PMESIIData,
    ROE,
    SupplyNode,
    SupplyEdge,
    Vendor,
    StrikeAnalysis,
    InformationRequirement,
    InformationFlow,
    Unit,
    Brief,
    DecisionBoard,
    BattleRhythmEvent,
    GovernanceSession,
    BDAReport,
    CollectionRequest,
    EffectivenessGap,
    TermsOfReference,
    RequestForInformation,
    ProductReport,
    CenterOfGravity,
    Track,
    CivilAgency,
    InfrastructureNode,
    CivilDependency,
    RadioNetwork,
    ComsecKey,
    StaffMember,
    BiometricReading,
    WeatherReport,
    WeatherImpact,
    SupplyStatus,
    VehicleAsset,
    LegalAdvisory,
    TargetSystem,
    WeaponSystem,
    ActivityLog,
    PoliticalStatement,
    NaturalDisaster,
    DisinformationEvent,
    FakeMedia
} from '../types';
import {
    UnitType,
    UnitEchelon,
    Capability,
    ProposalType,
    WorkflowState,
    BattleRhythmType,
    CommandLevel,
    InfrastructureType
} from '../types';
import { mockOPLANs } from './mock-oplan';

export const LATENCY = 400; // ms

// Mock Data Store
class MockDataStore {
    // --- CIVIL DOMAIN MOCK DATA ---
    oplans = mockOPLANs;

    civilAgencies: CivilAgency[] = [
        { id: 'ca-energy-nat', name: 'National Power Grid', type: 'Commercial', sector: 'Energy', jurisdiction: 'National', contactInfo: 'OPS-CENTER-1' },
        { id: 'ca-road-auth', name: 'Public Roads Admin', type: 'Government', sector: 'Transport', jurisdiction: 'Region North', contactInfo: 'TRAFFIC-HQ' },
        { id: 'ca-fuel-corp', name: 'EnergiCorp Logistics', type: 'Commercial', sector: 'Industrial', jurisdiction: 'Global', contactInfo: 'SUPPLY-DESK' }
    ];

    infrastructure: InfrastructureNode[] = [
        // ENERGY
        {
            id: 'inf-power-sub-a', name: 'Substation Alpha (Sector 4)', type: InfrastructureType.Substation,
            location: { lat: 60.1, lng: 11.2, alt: 100 },
            capacity: 500, currentLoad: 320, status: 'Operational', ownerId: 'ca-energy-nat', criticality: 'Operational'
        },
        // TRANSPORT (Mobility for Kill Chain)
        {
            id: 'inf-bridge-tynta', name: 'Tynta River Bridge', type: InfrastructureType.Bridge,
            location: { lat: 60.15, lng: 11.25, alt: 50 },
            capacity: 100, currentLoad: 40, status: 'Operational', ownerId: 'ca-road-auth', criticality: 'Tactical'
        },
        // LOGISTICS (Fuel for Kill Chain)
        {
            id: 'inf-fuel-depot-civ', name: 'Civil Fuel Depot West', type: InfrastructureType.Refinery,
            location: { lat: 59.95, lng: 10.9, alt: 20 },
            capacity: 50000, currentLoad: 45000, status: 'Operational', ownerId: 'ca-fuel-corp', criticality: 'Strategic'
        }
    ];

    civilDependencies: CivilDependency[] = [
        // 1st BDE depends on Civil Fuel Depot
        {
            id: 'dep-1', militaryEntityId: 'u-blue-1bde', civilEntityId: 'inf-fuel-depot-civ',
            dependencyType: 'Logistical', impactIfLost: 'Critical', resourceType: 'Fuel', flowRateRequired: 5000
        },
        // Adv Party depends on Bridge for mobility
        {
            id: 'dep-2', militaryEntityId: 'u-blue-adv', civilEntityId: 'inf-bridge-tynta',
            dependencyType: 'Mobility', impactIfLost: 'Severe'
        },
        // HQ depends on Power Substation
        {
            id: 'dep-3', militaryEntityId: 'u-blue-hq', civilEntityId: 'inf-power-sub-a',
            dependencyType: 'Logistical', impactIfLost: 'Critical', resourceType: 'Power', flowRateRequired: 150
        }
    ];

    // --- CNR (Combat Net Radio) MOCK DATA ---
    comsecKeys: ComsecKey[] = [
        { id: 'key-tek-main', name: 'NATO-SEC-TEK-01', type: 'TEK', status: 'Active', validUntil: '2026-06-01T00:00:00Z', algorithm: 'AES-256' },
        { id: 'key-tek-res', name: 'NATO-SEC-TEK-02', type: 'TEK', status: 'Reserve', validUntil: '2026-12-01T00:00:00Z', algorithm: 'AES-256' },
        { id: 'key-kek-master', name: 'NATO-MASTER-KEK', type: 'KEK', status: 'Active', validUntil: '2027-01-01T00:00:00Z', algorithm: 'TYPE-1' }
    ];

    radioNetworks: RadioNetwork[] = [
        {
            id: 'net-cmd-a', name: 'CMD NET ALPHA', frequency: 35.500, modulation: 'FM', status: 'Active',
            encryptionKeyId: 'key-tek-main', signalQuality: 95, participants: ['u-shq', 'u-blue-hq']
        },
        {
            id: 'net-fires', name: 'FIRES COORD', frequency: 42.125, modulation: 'FM', status: 'Active',
            encryptionKeyId: 'key-tek-main', signalQuality: 88, participants: ['u-blue-hq']
        },
        {
            id: 'net-air-gnd', name: 'AIR-GND PRIMARY', frequency: 243.000, modulation: 'AM', status: 'Active',
            encryptionKeyId: 'key-tek-main', signalQuality: 72, participants: ['u-blue-adv']
        },
        {
            id: 'net-sat-hi', name: 'SATCOM HIGH', frequency: 2500.0, modulation: 'SatCom', status: 'Jammed',
            encryptionKeyId: 'key-kek-master', signalQuality: 15, participants: ['u-shq']
        }
    ];

    // --- HUMAN DOMAIN MOCK DATA ---
    staffMembers: StaffMember[] = [
        {
            id: 'staff-cmd', name: 'James Hawkins', role: 'Commander', assignedUnitId: 'u-blue-hq',
            rank: 'BG', qualifications: ['Joint Command', 'Ranger', 'Strat-Plan'], trainingLevel: 'Expert',
            cognitiveStatus: 'Optimal', shiftStartedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), fatigueScore: 15
        },
        {
            id: 'staff-j3', name: 'Sarah Connor', role: 'J3_Ops', assignedUnitId: 'u-blue-hq',
            rank: 'MAJ', qualifications: ['Jumpmaster', 'Ops-Core'], trainingLevel: 'Senior',
            cognitiveStatus: 'Degraded', shiftStartedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), fatigueScore: 65
        },
        {
            id: 'staff-j2', name: 'Alan Turing', role: 'J2_Intel', assignedUnitId: 'u-blue-hq',
            rank: 'CPT', qualifications: ['Intel-Analyst-L3', 'Crypto', 'Cyber-Def'], trainingLevel: 'Master',
            cognitiveStatus: 'Critical', shiftStartedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), fatigueScore: 88
        },
        {
            id: 'staff-j4', name: 'Ellen Ripley', role: 'J4_Logistics', assignedUnitId: 'u-blue-hq',
            rank: 'LTC', qualifications: ['Logistics-Master', 'Hazmat', 'Space-Ops'], trainingLevel: 'Expert',
            cognitiveStatus: 'Optimal', shiftStartedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), fatigueScore: 10
        },
        {
            id: 'staff-j6', name: 'Neo Anderson', role: 'J6_Comms', assignedUnitId: 'u-blue-hq',
            rank: 'WO1', qualifications: ['Net-Ops', 'Cyber-Off', 'Matrix-L1'], trainingLevel: 'Junior',
            cognitiveStatus: 'Optimal', shiftStartedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), fatigueScore: 30
        }
    ];

    biometrics: BiometricReading[] = [
        // J3 Ops - High Stress signs
        { id: 'bio-1', staffId: 'staff-j3', type: 'HRV', value: 35, timestamp: new Date().toISOString() },
        { id: 'bio-2', staffId: 'staff-j3', type: 'HeartRate', value: 95, timestamp: new Date().toISOString() },
        // J2 Intel - Sleep Deprived
        { id: 'bio-3', staffId: 'staff-j2', type: 'SleepQuality', value: 20, timestamp: new Date().toISOString() },
        { id: 'bio-4', staffId: 'staff-j2', type: 'VoiceStress', value: 75, timestamp: new Date().toISOString() }
    ];

    // --- ONTOLOGY SPRINT 8 MOCK DATA ---
    weatherReport: WeatherReport = {
        id: 'wx-curr', location: 'Sector 4 (AO VULCAN)', temperature: 12, condition: 'Storm',
        windSpeed: 48, windDirection: 285, humidity: 88, pressure: 1012, visibility: 4, updatedAt: new Date().toISOString()
    };

    weatherImpacts: WeatherImpact[] = [
        { id: 'wi-1', assetType: 'UAV Fleet', impact: 'Grounded', reason: 'High Winds (>45kts)', severity: 'Critical' },
        { id: 'wi-2', assetType: 'Armor Mobility', impact: 'Degraded', reason: 'Flash Flooding', severity: 'Medium' },
        { id: 'wi-3', assetType: 'Sat IMINT', impact: 'Limited', reason: '100% Cloud Cover', severity: 'Medium' },
        { id: 'wi-4', assetType: 'Optical Sensors', impact: 'Optimal', reason: 'High Visibility (Below Cloud Ceiling)', severity: 'Low' },
    ];

    supplyStatuses: SupplyStatus[] = [
        { id: 'sup-1', class: 'Class I', name: 'Subsistence', level: 92, status: 'Optimal' },
        { id: 'sup-2', class: 'Class III', name: 'POL (Fuel)', level: 34, status: 'Critical' },
        { id: 'sup-3', class: 'Class V', name: 'Ammunition', level: 88, status: 'Optimal' },
        { id: 'sup-4', class: 'Class VII', name: 'Equipment', level: 65, status: 'Warning' },
    ];

    vehicleAssets: VehicleAsset[] = [
        { id: 'V-101', name: 'Leopard 2A7+', type: 'Main Battle Tank', status: 'Ready', health: 100, unitId: 'u-1' },
        { id: 'V-102', name: 'Leopard 2A7+', type: 'Main Battle Tank', status: 'Maintenance', health: 45, unitId: 'u-1' },
        { id: 'V-103', name: 'Puma IFV', type: 'Infantry Fighting Vehicle', status: 'Ready', health: 95, unitId: 'u-2' },
        { id: 'V-104', name: 'Puma IFV', type: 'Infantry Fighting Vehicle', status: 'Ready', health: 92, unitId: 'u-2' },
        { id: 'V-105', name: 'Boxer MRAV', type: 'Transport', status: 'Deployed', health: 88, unitId: 'u-3' },
    ];

    legalAdvisories: LegalAdvisory[] = [
        { id: 'leg-1', text: 'Hostile Intent must be demonstrated prior to use of lethal force.', region: 'Sector Delta', severity: 'Critical' },
        { id: 'leg-2', text: 'ROE 421 active for all MECH elements. Synchronize fires.', region: 'AO VULCAN', severity: 'Info' }
    ];

    // --- TARGETING DEEP DIVE MOCK DATA ---
    targetSystems: TargetSystem[] = [
        {
            id: 'ts-iads-red',
            name: 'Redland Integrated Air Defense System',
            type: 'IADS',
            status: 'Operational',
            components: ['t-002', 't-004'], // Links to Targets
            criticality: 0.95
        },
        {
            id: 'ts-log-supply',
            name: 'Redland Supply Chain North',
            type: 'Logistics',
            status: 'Degraded',
            components: ['t-002'],
            criticality: 0.8
        }
    ];

    weaponSystems: WeaponSystem[] = [
        { id: 'ws-gbu31', name: 'GBU-31 JDAM', type: 'Air-to-Ground', warhead: '2000lb BLAST', blastRadius: 120, collateralRisk: 'High' },
        { id: 'ws-sdb', name: 'GBU-39 SDB', type: 'Air-to-Ground', warhead: '250lb PRECISION', blastRadius: 15, collateralRisk: 'Low' },
        { id: 'ws-cyber', name: 'Inject: NULL_ROUTER', type: 'Cyber', warhead: 'Logic Bomb', blastRadius: 0, collateralRisk: 'Low' },
        { id: 'ws-arty', name: 'M982 Excalibur', type: 'Surface-to-Surface', warhead: '155mm GPS', blastRadius: 50, collateralRisk: 'Medium' }
    ];

    activityLogs: ActivityLog[] = [
        // For T-001 (Command Bunker)
        { id: 'act-001', targetId: 't-001', timestamp: new Date(Date.now() - 3600000).toISOString(), description: 'Shift change observed at main entrance.', activityType: 'Movement', confidence: 0.9 },
        { id: 'act-002', targetId: 't-001', timestamp: new Date(Date.now() - 7200000).toISOString(), description: 'High-frequency burst transmission detected.', activityType: 'Comms', confidence: 0.95 },
        // For T-002 (Fuel Depot)
        { id: 'act-003', targetId: 't-002', timestamp: new Date(Date.now() - 10800000).toISOString(), description: 'Civilian contractors arrived for maintenance.', activityType: 'Maintenance', confidence: 0.8 },
        { id: 'act-004', targetId: 't-002', timestamp: new Date(Date.now() - 5400000).toISOString(), description: 'Large tanker truck convoy departing.', activityType: 'Logistics', confidence: 0.85 }
    ];

    // ... existing code ...

    units: Unit[] = [
        {
            id: 'u-shq',
            type: 'Unit',
            affiliation: 'Blue', // Mapped from side
            name: 'National HQ',
            designator: 'NHQ',
            unitType: UnitType.C2,
            echelon: UnitEchelon.Corps,
            location: { lat: 59.91, lng: 10.75, alt: 0 }, // Oslo
            status: 'Active',
            readiness: 100,
            combatEffectiveness: 'Effective',
            capabilities: [Capability.DirectFire, Capability.Intelligence], // Simplified for C2
            caveats: [],
            restrictions: []
        },
        {
            id: 'u-blue-hq',
            type: 'Unit',
            affiliation: 'Blue',
            name: 'Joint Force Command',
            designator: 'JFC-NORTH',
            unitType: UnitType.C2,
            echelon: UnitEchelon.Corps,
            parentId: 'u-shq',
            location: { lat: 59.91, lng: 10.75, alt: 0 },
            status: 'Active',
            readiness: 100,
            combatEffectiveness: 'Effective',
            capabilities: [Capability.DirectFire],
            caveats: ['Host nation approval required for kinetic ops'],
            restrictions: ['No deployment outside Sector Alpha without NAC authority']
        },
        {
            id: 'u-blue-1bde',
            type: 'Unit',
            affiliation: 'Blue',
            name: '1st Mechanized Brigade',
            designator: '1 MECH BDE',
            unitType: UnitType.Armor,
            echelon: UnitEchelon.Brigade,
            parentId: 'u-blue-hq',
            location: { lat: 68.4, lng: 17.4, alt: 100 }, // Sector Alpha
            status: 'Active',
            readiness: 85,
            combatEffectiveness: 'Effective',
            capabilities: [Capability.DirectFire],
            caveats: ['Organic medical support at 60%'],
            restrictions: ['Restricted from crossing Grid 4455 without clearing PIR-01']
        },
        {
            id: 'u-blue-1bn',
            type: 'Unit',
            affiliation: 'Blue',
            name: '1st Battalion',
            designator: '1 BN',
            unitType: UnitType.Infantry,
            echelon: UnitEchelon.Battalion,
            parentId: 'u-blue-1bde',
            location: { lat: 68.5, lng: 17.5, alt: 120 },
            status: 'Active',
            readiness: 90,
            combatEffectiveness: 'Effective',
            capabilities: [Capability.DirectFire],
            caveats: [],
            restrictions: [],
            uncertainty: 0.05, // High confidence (Blue Force Tracker)
            lastVerified: new Date().toISOString()
        },
        {
            id: 'u-red-hq',
            type: 'Unit',
            affiliation: 'Red',
            name: 'Redland High Command',
            designator: 'RED-HQ',
            unitType: UnitType.C2,
            echelon: UnitEchelon.Corps,
            location: { lat: 68.9, lng: 33.0, alt: 50 }, // Murmansk
            status: 'Active',
            readiness: 95,
            combatEffectiveness: 'Effective',
            capabilities: [Capability.ElectronicWarfare],
            caveats: [],
            restrictions: [],
            uncertainty: 0.45, // Medium confidence (SIGINT/HUMINT fusion)
            lastVerified: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
            id: 'u-red-7th',
            type: 'Unit',
            affiliation: 'Red',
            name: '7th Motorized Rifles',
            designator: '7 MOT RIF',
            unitType: UnitType.Infantry,
            echelon: UnitEchelon.Division,
            parentId: 'u-red-hq',
            location: { lat: 69.0, lng: 32.5, alt: 60 },
            status: 'Active',
            readiness: 92,
            combatEffectiveness: 'Effective',
            capabilities: [Capability.DirectFire, Capability.ElectronicWarfare],
            caveats: [],
            restrictions: []
        },
    ];


    proposals: Proposal[] = [
        {
            id: 'p-101',
            type: ProposalType.TargetNomination,
            title: 'Nominate T-800 Battalion C2 Node',
            body: '# Target Nomination\n\n**Objective**: Neutralize C2 capability in Sector 4.\n**Target**: T-800 Battalion HQ (Grid 889911).\n**Effect**: Disrupt command chain for 24h.',
            originatorId: 'u-j2-01',
            status: WorkflowState.UnderReview,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString(),
            approvers: ['u-j3-leader'],
            targetSessionId: 'gs-04', // JTB-24
            decisions: [],
            operationId: 'op-iron-wall',
            campaignId: 'c-001'
        },
        {
            id: 'p-102',
            type: ProposalType.OrderIssuance,
            title: 'FRAGO 01-05: Boundary Change',
            body: '# FRAGO 01-05\n\n**Change**: Shift 1st Bde boundary 5km North.\n**Reason**: Terrain trafficability.',
            originatorId: 'u-j3-ops',
            status: WorkflowState.Draft,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date().toISOString(),
            approvers: [],
            decisions: [],
            operationId: 'op-iron-wall',
            campaignId: 'c-001'
        },
        {
            id: 'p-103',
            type: ProposalType.ResourceRequest,
            title: 'Emergency MedEvac Assets',
            body: 'Request immediate allocation of 2x UH-60 for casualtiy evacuation at FOB Alpha.',
            originatorId: 'u-j4-log',
            status: WorkflowState.Approved,
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            updatedAt: new Date().toISOString(),
            approvers: ['u-j3-leader'],
            decisions: [
                {
                    id: 'd-001',
                    proposalId: 'p-103',
                    deciderId: 'u-j3-leader',
                    decision: 'Approve',
                    rationale: 'Life, limb, or eyesight priority.',
                    timestamp: new Date().toISOString()
                }
            ],
            operationId: 'op-iron-wall',
            campaignId: 'c-001'
        }
    ];

    // --- INFORMATION MANAGEMENT (CCIR) ---
    ccirs: CCIR[] = [
        {
            id: 'pir-001',
            type: 'PIR',
            priority: 'Critical',
            description: 'Determine if Enemy Armor Regiment 309 enters Sector ALPHA',
            status: 'Active',
            createdAt: new Date().toISOString(),
            conditions: [
                { subjectType: 'Unit', property: 'affiliation', operator: 'equals', value: 'Red' },
                { subjectType: 'Unit', property: 'location', operator: 'inRegion', value: 'Sector Alpha' }
            ]
        },
        {
            id: 'pir-002',
            type: 'PIR',
            priority: 'High',
            description: 'Alert on operational status change of Target T-1001 (C2 Node)',
            status: 'Active',
            createdAt: new Date().toISOString(),
            conditions: [
                { subjectType: 'Target', subjectId: 'T-1001', property: 'status', operator: 'equals', value: 'Active' }
            ]
        },
        {
            id: 'ffir-001',
            type: 'FFIR',
            priority: 'Critical',
            description: 'Logistics Alert: Any Supply Node dropping below 20% capacity',
            status: 'Active',
            createdAt: new Date().toISOString(),
            conditions: [
                { subjectType: 'SupplyNode', property: 'status', operator: 'equals', value: 'Critical' }
            ]
        },
        {
            id: 'ffir-002',
            type: 'FFIR',
            priority: 'Medium',
            description: 'Staff Fatigue Monitoring: Alert if Critical Staff fatigue > 90%',
            status: 'Active',
            createdAt: new Date().toISOString(),
            conditions: [
                { subjectType: 'BioSensor', property: 'status', operator: 'greaterThan', value: '90' }
            ]
        },
        {
            id: 'eefi-001',
            type: 'EEFI',
            priority: 'Critical',
            description: 'Compromise of Civil Data Center DC-01',
            status: 'Active',
            createdAt: new Date().toISOString(),
            conditions: [
                { subjectType: 'CivilAgency', subjectId: 'c-infra-01', property: 'status', operator: 'equals', value: 'Compromised' }
            ]
        }
    ];

    ccirHits: CCIRHit[] = [
        {
            id: 'hit-001',
            ccirId: 'pir-001',
            entityId: 'u-red-armor-309', // Requires mock unit existence
            entityType: 'Unit',
            timestamp: new Date().toISOString(),
            valueObserved: 'Sector Alpha',
            status: 'New',
            feedback: []
        },
        {
            id: 'hit-002',
            ccirId: 'pir-002',
            entityId: 't-1001', // Target
            entityType: 'Target',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            valueObserved: 'Active',
            status: 'Verified',
            feedback: [
                { id: 'fb-1', userId: 'u-j2-intel', comment: 'Confirmed via IMINT.', createdAt: new Date().toISOString() }
            ]
        }
    ];

    campaigns: Campaign[] = [
        {
            id: 'c-001',
            name: 'Exercise Northern Shield',
            objective: 'Defend territorial integrity against invading force (Redland).',
            endState: 'Sovereignty restored; Hostile forces pushed beyond FLOT; Local governance functional.',
            startDate: '2026-03-01',
            status: 'Active'
        }
    ];

    loos: LineOfOperation[] = [
        { id: 'loo-1', campaignId: 'c-001', name: 'Security', type: 'Physical', description: 'Establish and maintain secure environment.', sequence: 1, color: 'bg-blue-600' },
        { id: 'loo-2', campaignId: 'c-001', name: 'Stability', type: 'Logical', description: 'Restore essential services and governance.', sequence: 2, color: 'bg-emerald-600' },
        { id: 'loo-3', campaignId: 'c-001', name: 'Influence', type: 'Logical', description: 'Secure local support and counter hostile narrative.', sequence: 3, color: 'bg-indigo-600' },
    ];

    decisiveConditions: DecisiveCondition[] = [
        { id: 'dc-1.1', campaignId: 'c-001', looId: 'loo-1', name: 'Local Sec Established', description: 'Sector Alpha secured by 1-64 MECH.', criteria: 'No hostile patrols inside Sect Alpha for 48h.', status: 'Achieved', targetDate: '2026-03-02' },
        { id: 'dc-1.2', campaignId: 'c-001', looId: 'loo-1', name: 'Hostile Neutralized', description: 'Neutralize Redland 5th Regt C2.', criteria: 'Battalion HQ destroyed or surrendered.', status: 'AtRisk', targetDate: '2026-03-06' },
        { id: 'dc-1.3', campaignId: 'c-001', looId: 'loo-1', name: 'Borders Sealed', description: 'Establish physical barriers at Crossings 1-4.', criteria: 'Barriers in place; sensor coverage active.', status: 'Pending', targetDate: '2026-03-10' },
        { id: 'dc-2.1', campaignId: 'c-001', looId: 'loo-2', name: 'Essential Svc Restored', description: 'Power and water functional in 80% of AO.', criteria: 'Grid uptime >95%.', status: 'InProgress', targetDate: '2026-03-15' },
        { id: 'dc-3.1', campaignId: 'c-001', looId: 'loo-3', name: 'Info Dominance', description: 'Control of local radio/TV transmitters.', criteria: 'Voice of Shield broadcasting on all frequencies.', status: 'Achieved', targetDate: '2026-03-04' },
    ];

    operations: Operation[] = [
        {
            id: 'op-iron-wall',
            campaignId: 'c-001',
            name: 'Operation Iron Wall',
            phase: 'Execution',
            oplanId: 'oplan-bravo',
            commander: 'MG Thompson',
            forcesAssigned: ['1st BDE', '3rd MECH'],
            status: 'Executing'
        },
        {
            id: 'op-sea-shield',
            campaignId: 'c-001',
            name: 'Operation Sea Shield',
            phase: 'Crisis Response Planning',
            oplanId: 'oplan-charlie',
            commander: 'RADM Jensen',
            forcesAssigned: ['TF Neptune'],
            status: 'Planning'
        },
        {
            id: 'op-cyber-fortress',
            campaignId: 'c-001',
            name: 'Operation Cyber Fortress',
            phase: 'Lessons Learned',
            commander: 'COL Martinez',
            forcesAssigned: ['6th Cyber Bn'],
            status: 'Complete'
        }
    ];

    activeJCOs: JointCoordinationOrder[] = [
        {
            id: 'jco-001',
            campaignId: 'c-001',
            serial: 'JCO 24-01',
            validFrom: '2026-03-01T06:00:00Z',
            validUntil: '2026-03-05T06:00:00Z',
            body: 'Main Defensive Effort in Sector Alpha.',
            status: 'Active'
        }
    ];

    scenarios: Scenario[] = [
        {
            id: 's-001',
            name: 'Flood Relief - Region A',
            type: 'HADR',
            description: 'Humanitarian assistance following catastrophic flooding.',
            isActive: false
        },
        {
            id: 's-002',
            name: 'Exercise Northern Shield',
            type: 'Defensive',
            description: 'Full-scale defensive exercise.',
            isActive: true
        }
    ];

    coas: CourseOfAction[] = [
        {
            id: 'coa-001',
            operationId: 'op-01',
            name: 'COA 1: Mobile Defense',
            description: 'Focus on mobility and counter-attacks in depth.',
            status: 'Draft',
            riskLevel: 'Medium',
            effectiveness: 75,
            advantages: ['High operational tempo', 'Flexibility'],
            disadvantages: ['High resource strain'],
            selected: false
        },
        {
            id: 'coa-002',
            operationId: 'op-01',
            name: 'COA 2: Static Fortress',
            description: 'Heavy emphasis on fixed fortifications and area denial.',
            status: 'Draft',
            riskLevel: 'Low',
            effectiveness: 65,
            advantages: ['Low risk', 'Strong area denial'],
            disadvantages: ['Low mobility'],
            selected: false
        }
    ];

    strategicGuidance: StrategicGuidance = {
        id: 'guidance-001',
        title: 'Operation Northern Shield - SAC Intent',
        source: 'SACEUR',
        intent: 'Maintain territorial integrity and deter further escalation through multi-domain presence and rapid response capabilities.',
        objectives: [
            {
                id: 'obj-1',
                text: 'Neutralize enemy A2/AD bubbles in the Baltic corridor.',
                status: 'On track',
                tasks: ['Operation Sea Breeze', 'F-35 Deployment Alpha']
            },
            {
                id: 'obj-2',
                text: 'Ensure vital sea lines of communication (SLOC) remain open.',
                status: 'At risk',
                tasks: ['Minesweeping 04', 'Convoy Escort Delta']
            }
        ],
        recommendedRoeIds: ['roe-421', 'roe-501'], // Suggested by Strategy
        politicalImplications: [
            'Avoid escalation in Sector Bravo',
            'Maintain coalition cohesion via strict PID'
        ]
    };

    pmesii: PMESIIData[] = [
        { area: 'Region Alpha', political: 0.8, military: 0.9, economic: 0.7, social: 0.65, infrastructure: 0.85, information: 0.4 },
        { area: 'Region Beta', political: 0.4, military: 0.6, economic: 0.3, social: 0.45, infrastructure: 0.5, information: 0.2 },
    ];

    targets: Target[] = [
        {
            id: 't-001',
            type: 'Target',
            affiliation: 'Red',
            designator: 'T-1001',
            targetId: 'T-1001',
            beNumber: '1234-5678',
            name: 'Command Bunker Alpha',
            category: 'C2',
            catCode: '10000',
            priority: 'High',
            location: { lat: 69.1, lng: 32.8, alt: 0 },
            description: 'Hardened command facility for sector defense coordination.',
            desiredEffect: 'Neutralize',
            collateralDamageEstimate: 'Low',
            status: 'Active',
            targetStatus: 'Approved',
            nominatedById: 'u-jfc',
            requiredRoeId: 'roe-421',
            killChainPhase: 'Engage',
            uncertainty: 0.1, // Highly certain
            lastVerified: new Date().toISOString(),
            assessmentStatus: 'Final'
        },
        {
            id: 't-002',
            type: 'Target',
            affiliation: 'Red',
            designator: 'T-1002',
            targetId: 'T-1002',
            beNumber: '5678-1234',
            name: 'Echo Fuel Depot',
            category: 'Logistics',
            catCode: '12000',
            priority: 'Medium',
            location: { lat: 69.2, lng: 32.9, alt: 10 },
            description: 'Strategic fuel reserve for armored units.',
            desiredEffect: 'Destroy',
            collateralDamageEstimate: 'Medium',
            status: 'Active',
            targetStatus: 'Identified',
            nominatedById: 'u-1bde',
            requiredRoeId: 'roe-501',
            killChainPhase: 'Fix',
            supplyNodeId: 'sn-red-02',
            uncertainty: 0.3, // Moderate uncertainty
            lastVerified: new Date(Date.now() - 7200000).toISOString()
        }
    ];

    assessments: AssessmentReport[] = [
        {
            id: 'as-001',
            campaignId: 'c-001',
            title: 'Week 1 Operational Assessment',
            date: '2026-03-07',
            status: 'Final',
            overallProgress: 14,
            confidenceLevel: 'Medium',
            executiveSummary: 'Operation IRON WALL is proceeding within acceptable parameters. LOO 1 (Security) shows significant progress in Sector Alpha.',
            findings: ['Sector Alpha secured.', 'Redland 5th Regt C2 node neutralized (90% confidence).'],
            recommendations: ['Shift focus to LOO 2 (Stability) in Sector Bravo.', 'Increase UAV orbits over Vulcan area.'],
            moes: [
                { id: 'moe-1', name: 'Hostile Neutralization', description: '% of high-priority targets engaged', targetValue: 80, currentValue: 64, unit: '%', trend: 'Improving', lastUpdated: '2026-03-07' },
                { id: 'moe-2', name: 'Safe Trafficability', description: 'Roads cleared of mines/IEDs', targetValue: 100, currentValue: 92, unit: '%', trend: 'Stable', lastUpdated: '2026-03-06' }
            ],
            mops: [
                { id: 'mop-1', name: 'Sorties Flown', description: 'Planned vs Actual air support', targetValue: 48, currentValue: 42, unit: 'sorties' }
            ]
        }
    ];

    effectivenessGaps: EffectivenessGap[] = [
        {
            id: 'eg-001',
            campaignId: 'c-001',
            looId: 'loo-1', // Security
            name: 'Security LOO Velocity',
            status: 'OnTrack',
            currentGap: -2,
            plannedTrajectory: [
                { date: '2026-03-01', value: 0 },
                { date: '2026-03-03', value: 15 },
                { date: '2026-03-05', value: 30 },
                { date: '2026-03-07', value: 45 },
            ],
            actualTrajectory: [
                { date: '2026-03-01', value: 0 },
                { date: '2026-03-03', value: 12 },
                { date: '2026-03-05', value: 28 },
                { date: '2026-03-07', value: 43 },
            ],
            recommendations: []
        },
        {
            id: 'eg-002',
            campaignId: 'c-001',
            looId: 'loo-2', // Stability
            name: 'Stability LOO Velocity',
            status: 'CriticalGap',
            currentGap: -25,
            rootCause: 'Contractor Logistics Failure (Globex)',
            plannedTrajectory: [
                { date: '2026-03-01', value: 0 },
                { date: '2026-03-03', value: 10 },
                { date: '2026-03-05', value: 25 },
                { date: '2026-03-07', value: 40 },
            ],
            actualTrajectory: [
                { date: '2026-03-01', value: 0 },
                { date: '2026-03-03', value: 5 },
                { date: '2026-03-05', value: 12 },
                { date: '2026-03-07', value: 15 },
            ],
            recommendations: [
                'Invoke Penalty Clause on Globex (Supply Chain)',
                'Reallocate Engineering support to Sector Bravo',
                'Request additional CIMIC teams'
            ]
        }
    ];

    roes: ROE[] = [
        {
            id: 'roe-421',
            code: '421',
            name: 'Positive Identification (PID) Required',
            description: 'Engagement is only authorized if the target is positively identified as hostile by visual or electronic means.',
            status: 'Released',
            constraints: ['Visual confirmation', 'Signal intelligence correlation']
        },
        {
            id: 'roe-501',
            code: '501',
            name: 'Authorization for Indirect Fire',
            description: 'Authorization to use indirect fire systems (Artillery/Mortars) in built-up areas.',
            status: 'Draft',
            constraints: ['CDE Low required', 'Commander approval']
        }
    ];

    supplyNodes: SupplyNode[] = [
        { id: 'sn-blue-01', name: 'Port of Shield (Blue)', owner: 'Blue', type: 'Terminal', location: 'Coast Alpha', criticality: 0.9, vulnerability: 0.3 },
        { id: 'sn-red-01', name: 'Volga Production Plant', owner: 'Red', type: 'Source', location: 'Interior Redland', criticality: 0.8, vulnerability: 0.4 },
        { id: 'sn-red-02', name: 'Echo Fuel Depot', owner: 'Red', type: 'Transport', location: 'Border Sector', criticality: 0.7, vulnerability: 0.8 },
    ];

    supplyEdges: SupplyEdge[] = [
        { id: 'se-01', fromNodeId: 'sn-red-01', toNodeId: 'sn-red-02', modality: 'Land' }
    ];

    vendors: Vendor[] = [
        {
            id: 'v-globex',
            name: 'Globex Defence Systems',
            alignment: 'Grey',
            conflictInterestLevel: 'High',
            contracts: [{ unitId: 'u-jfc', side: 'Blue' }, { unitId: 'red-hq', side: 'Red' }],
            revenueFromWar: 45
        },
        {
            id: 'v-shieldtork',
            name: 'Shield-Tork Logistics',
            alignment: 'Blue',
            conflictInterestLevel: 'Low',
            contracts: [{ unitId: 'u-1bde', side: 'Blue' }],
            revenueFromWar: 12
        }
    ];

    strikeAnalyses: StrikeAnalysis[] = [
        {
            targetId: 't-001',
            selectionScore: 92,
            tacticalGain: 95,
            strategicGain: 80,
            economicImpact: 0,
            legalCompliance: 'Clear',
            reasoning: 'Target T-001 (Command Bunker Alpha) is a purely military C2 node with minimal collateral infrastructure. Legal review confirms compliance with LOAC.'
        },
        {
            targetId: 't-002',
            selectionScore: 78,
            tacticalGain: 85,
            strategicGain: 60,
            economicImpact: -25, // Impact on Globex
            legalCompliance: 'Pending',
            reasoning: 'Striking Echo Fuel Depot yields high tactical advantage for 48h. However, GlobalX (Grey Vendor) supplies this node under contract SE-99. Possible economic blowback.'
        }
    ];

    bdaReports: BDAReport[] = [
        {
            id: 'bda-001',
            targetId: 't-002',
            strikes: [
                { timeOnTarget: '2026-01-05T14:30:00Z', weaponSystem: 'F-35A', munition: 'GBU-31', impactCoordinates: '32U PU 5678 1234' }
            ],
            physicalDamage: 'Severe',
            functionalDamage: 'Non-Mission Capable',
            collateralDamageReported: false,
            recommendation: 'Effect Achieved',
            notes: 'Primary fuel tanks ruptured. Secondary explosions observed. Fire suppression systems overwhelmed.',
            assessorId: 'u-j2-analyst',
            submittedAt: '2026-01-05T15:00:00Z',
            status: 'Approved',
            imageUrl: '/mock-bda-image.jpg',
            confidence: 0.95,
            assessmentType: 'Final'
        }
    ];

    collectionRequests: CollectionRequest[] = [
        {
            id: 'cr-001',
            targetId: 't-002',
            assetType: 'IMINT',
            status: 'Tasked',
            priority: 'High',
            eta: new Date(Date.now() + 3600000).toISOString(),
            requirements: 'Confirm presence of tanker convoy. High resolution imagery required.'
        },
        {
            id: 'cr-002',
            targetId: 't-001',
            assetType: 'SIGINT',
            status: 'In-Orbit',
            priority: 'Critical',
            eta: new Date().toISOString(),
            requirements: 'Monitor burst transmissions for shift changes.'
        }
    ];

    informationRequirements: InformationRequirement[] = [
        { id: 'pir-01', type: 'PIR', description: 'What is the current status of enemy mobile C2 assets in Sector North?', priority: 'Critical', status: 'Analysis', deadline: '2026-01-06T12:00:00Z', assignedCell: 'J2-Intel' },
        { id: 'ffir-01', type: 'FFIR', description: 'Track friendly attrition rates for Mechinized elements.', priority: 'High', status: 'Collection', deadline: '2026-01-06T08:00:00Z', assignedCell: 'J4-Logistics' },
    ];

    informationFlows: InformationFlow[] = [
        { id: 'if-01', source: 'J2-Intel', destination: 'Targeting', dataType: 'Target Location Update', timestamp: '2026-01-05T18:30:00Z', status: 'Delivered' },
        { id: 'if-02', source: 'LEGAD', destination: 'Command', dataType: 'ROE Authorization Request', timestamp: '2026-01-05T19:15:00Z', status: 'Routing' },
    ];



    briefs: Brief[] = [
        {
            id: 'b-training-01',
            title: 'System Orientation: MshnCtrl Workflow',
            description: 'Introduction to Joint Targeting and Logistics synchronization.',
            ownerCell: 'IM-Cell',
            bluf: 'MshnCtrl leverages a data-driven Ontology Layer to synchronize Targeting, Logistics, and ROE. Successful engagement requires all three nodes to be Released/Nominal.',
            status: 'Final',
            createdAt: '2026-01-05T10:00:00Z',
            slides: [
                { id: 's1', title: 'Targeting Lifecycle', content: 'Targets move from Identification to Nomination. Engagement is restricted until a linked ROE is Released.', visualType: 'Text' },
                { id: 's2', title: 'Supply Chain Impact', content: 'Every strike on a Redland node (e.g. Fuel Depots) is analyzed for economic blowback on Grey-market vendors.', visualType: 'Network' },
                { id: 's3', title: 'Conclusion', content: 'Final Approval rests with the Joint Decision Board after Strike Reasoner validation.', visualType: 'Text' }
            ]
        }
    ];

    decisionBoards: DecisionBoard[] = [
        {
            id: 'db-01',
            title: 'Joint Targeting Board (JTB-24)',
            dateTime: '2026-01-06T09:00:00Z',
            chair: 'COM JFC',
            briefId: 'b-training-01',
            pendingDecisions: ['Strike T-1002 Authorization', 'Move 1 MECH BDE to Sector Beta'],
            outcomes: []
        }
    ];

    battleRhythmEvents: BattleRhythmEvent[] = [
        {
            id: 'bre-01',
            name: 'Joint Targeting Working Group',
            type: BattleRhythmType.WorkingGroup,
            frequency: 'Daily',
            nextSlot: '2026-01-06T08:00:00Z',
            chairRole: 'J2 Targeteer',
            contributingCells: ['J2-Intel', 'J3-Ops', 'LEGAD'],
            governingAuthority: 'JFC COS',
            torId: 'tor-01',
            feedsInto: 'bre-03'
        },
        {
            id: 'bre-02',
            name: 'Operational Sync Meeting',
            type: BattleRhythmType.CoordinationMeeting,
            frequency: 'Daily',
            nextSlot: '2026-01-06T07:00:00Z',
            chairRole: 'JFC COS',
            contributingCells: ['All Cells'],
            governingAuthority: 'COM JFC',
            torId: 'tor-02',
            feedsInto: 'bre-03'
        },
        {
            id: 'bre-03',
            name: 'Joint Decision Board',
            type: BattleRhythmType.DecisionBoard,
            frequency: 'Weekly',
            nextSlot: '2026-01-08T10:00:00Z',
            daysOfWeek: [4], // Thursday
            chairRole: 'COM JFC',
            contributingCells: ['J2', 'J3', 'J4', 'LEGAD', 'POLAD'],
            governingAuthority: 'COM JFC',
            torId: 'tor-03'
        }
    ];

    tors: TermsOfReference[] = [
        {
            id: 'tor-01',
            eventId: 'bre-01',
            title: 'JTWG Terms of Reference',
            objectives: ['Validate Nominations', 'Prioritize Targeting List', 'Verify ROE Compliance'],
            agenda: ['Intel Update', 'Nomination Review', 'CDE Analysis', 'Asset Allocation'],
            participants: [
                { role: 'J2 Targeteer (Chair)', commandLevel: CommandLevel.Operational, required: true },
                { role: 'J3 Ops Chief', commandLevel: CommandLevel.Operational, required: true },
                { role: 'LEGAD', commandLevel: CommandLevel.Operational, required: true }
            ],
            url: '#',
            feedback: [
                { id: 'fb-1', userId: 'u-legad', comment: 'Agenda should include Law of Armed Conflict review for urban targets.', date: '2026-01-02', status: 'Addressed' }
            ]
        },
        {
            id: 'tor-02',
            eventId: 'bre-02',
            title: 'Ops Sync Protocols',
            objectives: ['Synchronize Daily Intent', 'Review CCIRs', 'Deconflict Airspace'],
            agenda: ['Commander\'s Update', 'J2 Weather/Intel', 'J3 Current Ops', 'J4 Logistics Status'],
            participants: [
                { role: 'COS (Chair)', commandLevel: CommandLevel.Operational, required: true },
                { role: 'All ACOS', commandLevel: CommandLevel.Operational, required: true }
            ],
            url: '#',
            feedback: []
        },
        {
            id: 'tor-03',
            eventId: 'bre-03',
            title: 'Joint Decision Board Charter',
            objectives: ['Approve Target List', 'Authorize High-Risk Ops', 'Resources Allocation'],
            agenda: ['Decision Briefs', 'Risk Acceptance', 'Commander\'s Guidance'],
            participants: [
                { role: 'COM JFC (Chair)', commandLevel: CommandLevel.Strategic, required: true },
                { role: 'POLAD', commandLevel: CommandLevel.Strategic, required: false }
            ],
            url: '#',
            feedback: []
        }
    ];

    governanceSessions: GovernanceSession[] = [
        {
            id: 'gs-01',
            title: 'Ops Sync 05-JAN',
            type: BattleRhythmType.CoordinationMeeting,
            startTime: '2026-01-05T07:00:00Z',
            endTime: '2026-01-05T07:45:00Z',
            chair: 'JFC COS',
            location: 'Main Briefing Room / VTC',
            status: 'Concluded',
            operationId: 'op-iron-wall',
            campaignId: 'c-001',
            attendees: [
                { role: 'COS', cell: 'HQ', type: 'Authority' },
                { role: 'J2-Dir', cell: 'J2', type: 'Contributor' },
                { role: 'J3-Dir', cell: 'J3', type: 'Contributor' }
            ],
            inputs: [
                { fromCell: 'J2', type: 'Intel Summary', title: 'Adversary COA Update' }
            ],
            outputs: [
                { toCell: 'All', type: 'Directive', title: 'Prioritize Sector Alpha Defense' }
            ]
        },
        {
            id: 'gs-02',
            title: 'Targeting WG 05-JAN',
            type: BattleRhythmType.WorkingGroup,
            startTime: '2026-01-05T08:00:00Z',
            endTime: '2026-01-05T10:00:00Z',
            chair: 'J2 Targeteer',
            location: 'Intel Sciff',
            status: 'Concluded',
            operationId: 'op-iron-wall',
            campaignId: 'c-001',
            attendees: [
                { role: 'J2-TGT', cell: 'J2', type: 'Authority' },
                { role: 'LEGAD', cell: 'Legal', type: 'Contributor' }
            ],
            inputs: [
                { fromCell: 'J2-Intel', type: 'Target Nom', title: 'T-1002 Fixation Report' }
            ],
            outputs: [
                { toCell: 'JFC-COS', type: 'Approval Req', title: 'Nomination for JTB-24' }
            ]
        },
        {
            id: 'gs-03',
            title: 'Ops Sync 06-JAN (Current)',
            type: BattleRhythmType.CoordinationMeeting,
            startTime: '2026-01-06T07:00:00Z',
            endTime: '2026-01-06T07:45:00Z',
            chair: 'JFC COS',
            location: 'Main Briefing Room',
            status: 'Scheduled',
            attendees: [
                { role: 'COS', cell: 'HQ', type: 'Authority' }
            ],
            inputs: [],
            outputs: []
        },
        {
            id: 'gs-04',
            title: 'Joint Targeting Board (JTB-24)',
            type: BattleRhythmType.DecisionBoard,
            startTime: '2026-01-06T09:00:00Z',
            endTime: '2026-01-06T11:00:00Z',
            chair: 'COM JFC',
            location: 'HQ Command Suite',
            status: 'Scheduled',
            attendees: [
                { role: 'COM', cell: 'Command', type: 'Authority' },
                { role: 'COS', cell: 'HQ', type: 'Observer' }
            ],
            inputs: [
                { fromCell: 'J2-TGT', type: 'Nomination List', title: 'Cycle 24 Target List' }
            ],
            agendaItems: ['p-101'], // Proposal for Nominate T-800
            outputs: [
                { toCell: 'JOC', type: 'ROE Release', title: 'Authorized Engagement Zone 4' }
            ]
        }
    ];

    rfis: RequestForInformation[] = [
        {
            id: 'rfi-001',
            direction: 'Inbound',
            subject: 'Clarification on Sector Alpha Boundaries',
            description: 'Requesting precise coordinates for the Northwestern shift mentioned in FRAGO 01-05.',
            requestor: '1 MECH BDE',
            assignee: 'J3 Ops',
            priority: 'Routine',
            status: 'Open',
            deadline: '2026-01-07T12:00:00Z',
            createdAt: '2026-01-05T10:00:00Z',
            responses: []
        },
        {
            id: 'rfi-002',
            direction: 'Outbound',
            subject: 'Supply Availability - Class V',
            description: 'Confirm current stockpiles of 155mm ammunition in Sector Alpha.',
            requestor: 'JFC-HQ',
            assignee: 'J4 Log',
            priority: 'Critical',
            status: 'Pending',
            deadline: '2026-01-06T08:00:00Z',
            createdAt: '2026-01-05T14:30:00Z',
            responses: [
                { id: 'resp-001', text: 'Counting at Depots 4 and 7 is underway. Initial estimate: 3 days of supply.', responder: 'MAJ Miller', date: '2026-01-05T16:00:00Z' }
            ]
        }
    ];

    productReports: ProductReport[] = [
        {
            id: 'prod-001',
            title: 'Daily SITREP - Jan 5th',
            type: 'SITREP',
            summary: 'Overall status stable. Minor skirmishes in Sector Alpha.',
            content: { sectorAlpha: 'Stable', logistics: 'Nominal', targetsEngaged: 2 },
            author: 'COL Henderson',
            generatedAt: '2026-01-05T20:00:00Z',
            integrityHash: 'a5f9e2c...8b7d4',
            status: 'Final',
            version: 1
        }
    ];

    cogs: CenterOfGravity[] = [
        {
            id: 'cog-blue-1',
            side: 'Blue',
            name: 'Joint Force Command (JFC) C2',
            description: 'The commander\'s ability to synchronize and direct multi-domain operations.',
            capabilities: [
                {
                    id: 'cc-blue-1',
                    cogId: 'cog-blue-1',
                    name: 'Communication Resiliency',
                    description: 'Redundant secure communication links across all domains.',
                    requirements: [
                        {
                            id: 'cr-blue-1',
                            capabilityId: 'cc-blue-1',
                            name: 'Satellite Constellation Access',
                            description: 'Uninterrupted access to MIL-SATCOM.',
                            vulnerabilities: [
                                {
                                    id: 'cv-blue-1',
                                    requirementId: 'cr-blue-1',
                                    name: 'Jamming Vulnerability at Ground Stations',
                                    description: 'Redland EW assets may target ground-to-satellite uplinks.',
                                    status: 'Analyzed'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'cog-red-1',
            side: 'Red',
            name: 'Integrated Air Defense System (IADS)',
            description: 'The cornerstone of Redland\'s anti-access/area-denial (A2/AD) strategy.',
            capabilities: [
                {
                    id: 'cc-red-1',
                    cogId: 'cog-red-1',
                    name: 'S-400 Long-Range Engagement',
                    description: 'Surface-to-air missile systems capable of multi-target tracking.',
                    requirements: [
                        {
                            id: 'cr-red-1',
                            capabilityId: 'cc-red-1',
                            name: 'Target Acquisition Radars',
                            description: 'Long-range search and acquisition radar nodes (Big Bird).',
                            vulnerabilities: [
                                {
                                    id: 'cv-red-1',
                                    requirementId: 'cr-red-1',
                                    name: 'Fixed Radar Positions in Sector North',
                                    description: 'Static positions increase susceptibility to stand-off strikes.',
                                    relatedTargetId: 't-001',
                                    status: 'Targeted'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    // --- MISSING MOCK DATA ---
    supplyWeb: SupplyNode[] = [];

    // --- EXTERNAL CONTEXT & PMESII ---
    politicalStatements: PoliticalStatement[] = [
        {
            id: 'pol-001',
            type: 'Political',
            name: 'Presidential Ultimatum',
            description: 'Public statement regarding border integrity.',
            timestamp: '2026-06-15T09:00:00Z',
            source: 'Official Broadcast',
            confidence: 1.0,
            impactLevel: 'Strategic',
            affectedOperationIds: ['op-iron-wall'],
            speaker: 'President Varga',
            role: 'Head of State',
            sentiment: 'Hostile',
            requiresAction: true
        }
    ];

    naturalDisasters: NaturalDisaster[] = [
        {
            id: 'env-001',
            type: 'Physical',
            name: 'Flash Floods in Sector North',
            description: 'Severe flooding affecting MSR ALPHA.',
            timestamp: '2026-06-16T04:30:00Z',
            source: 'Weather Satellite / Ground Sensors',
            confidence: 0.95,
            impactLevel: 'Operational',
            affectedOperationIds: ['op-iron-wall'],
            disasterType: 'Flood',
            severity: 7,
            location: 'Sector North',
            impactOnLogistics: 0.4
        }
    ];

    disinformationEvents: DisinformationEvent[] = [
        {
            id: 'info-001',
            type: 'Information',
            name: 'False CivCas Report',
            description: 'Coordinated social media campaign alleging civilian casualties.',
            timestamp: '2026-06-16T10:15:00Z',
            source: 'Social Media Monitoring',
            confidence: 0.85,
            impactLevel: 'Strategic',
            affectedOperationIds: ['op-iron-wall'],
            narrative: 'Coalition forces targeting schools.',
            targetAudience: 'International Community',
            platform: 'Social Media',
            amplification: 'High',
            debunked: false,
            attribution: {
                actorName: 'Unit 74',
                confidence: 0.7,
                evidence: ['Botnet pattern matching']
            }
        }
    ];

    fakeMedia: FakeMedia[] = [
        {
            id: 'media-001',
            type: 'Information',
            name: 'Deepfake Commander Surrender',
            description: 'AI-generated video of TF Commander surrendering.',
            timestamp: '2026-06-16T11:00:00Z',
            source: 'Enemy Propaganda Channel',
            confidence: 0.9,
            impactLevel: 'Tactical',
            affectedOperationIds: ['op-iron-wall'],
            mediaType: 'Video',
            isDeepfake: true,
            detectionConfidence: 0.98,
            manipulationTechnique: 'FaceSwap + VoiceClone'
        }
    ];

    tracks: Track[] = [
        // AIR (RAP)
        {
            id: 'track-air-1',
            type: 'Track',
            name: 'PUMA 01',
            callsign: 'PUMA 01',
            domain: 'Air',
            affiliation: 'Blue',
            location: { lat: 59.43, lng: 10.45, alt: 32000 },
            vector: { speed: 450, heading: 270 },
            trackType: 'F-35A',
            classification: 'FRIENDLY',
            status: 'Active',
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'track-air-2',
            type: 'Track',
            name: 'GHOST 99',
            callsign: 'GHOST 99',
            domain: 'Air',
            affiliation: 'Red',
            location: { lat: 59.85, lng: 11.20, alt: 28000 },
            vector: { speed: 520, heading: 180 },
            trackType: 'Su-57',
            classification: 'HOSTILE',
            status: 'Active',
            lastUpdated: new Date().toISOString()
        },
        // MARITIME (RSP)
        {
            id: 'track-mar-1',
            type: 'Track',
            name: 'SEA KING',
            callsign: 'SEA KING',
            domain: 'Maritime',
            affiliation: 'Blue',
            location: { lat: 58.20, lng: 9.50 },
            vector: { speed: 22, heading: 0 },
            trackType: 'Type-45 Destroyer',
            classification: 'FRIENDLY',
            status: 'Active',
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'track-mar-2',
            type: 'Track',
            name: 'VOLGA',
            callsign: 'VOLGA',
            domain: 'Maritime',
            affiliation: 'Red',
            location: { lat: 58.45, lng: 10.15 },
            vector: { speed: 18, heading: 340 },
            trackType: 'Kirov-class Battlecruiser',
            classification: 'SUSPECT',
            status: 'Active',
            lastUpdated: new Date().toISOString()
        },
        // GROUND (RGP)
        {
            id: 'track-grd-1',
            type: 'Track',
            name: 'IRONHORSE',
            callsign: 'IRONHORSE',
            domain: 'Ground',
            affiliation: 'Blue',
            location: { lat: 59.10, lng: 10.80 },
            vector: { speed: 35, heading: 45 },
            trackType: 'M1A2 Abrams',
            classification: 'FRIENDLY',
            status: 'Active',
            lastUpdated: new Date().toISOString()
        }
    ];
}

export const store = new MockDataStore();
