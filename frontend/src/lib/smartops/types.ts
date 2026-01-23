export type UUID = string;

// HQ Workflow Types
export enum WorkflowState {
    Draft = 'Draft',
    Proposed = 'Proposed',
    UnderReview = 'UnderReview',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Revision = 'Revision',
    Executed = 'Executed',
    Assessed = 'Assessed',
}

export enum CommandLevel {
    Strategic = 'Strategic',
    Operational = 'Operational',
    Tactical = 'Tactical',
    SubTactical = 'Sub-Tactical',
}

export enum ProposalType {
    TargetNomination = 'Target Nomination',
    CourseOfAction = 'Course of Action',
    OrderIssuance = 'Order Issuance',
    MissionAssignment = 'Mission Assignment',
    ResourceRequest = 'Resource Request',
    PlanActivation = 'Plan Activation',
    AssessmentFinding = 'Assessment Finding',
    ROERelease = 'ROE Release Request',
    BriefReview = 'Brief Review',
    DecisionBoard = 'Decision Board',
}

export interface Proposal {
    id: UUID;
    type: ProposalType;
    title: string;
    body: string; // Markdown content
    originatorId: UUID;
    status: WorkflowState;
    relatedEntityId?: UUID;
    relatedEntityType?: string;
    createdAt: string; // ISO Date
    updatedAt: string;
    approvers: UUID[];
    decisions: DecisionRecord[];
    targetSessionId?: UUID; // The outcome is decided in this session
    briefId?: UUID; // The brief explaining this proposal
    operationId?: string;
    campaignId?: string;
}

export interface DecisionRecord {
    id: UUID;
    proposalId: UUID;
    deciderId: UUID;
    decision: 'Approve' | 'Reject' | 'RequestRevision';
    rationale: string;
    timestamp: string;
}

// Information Management (CCIR/PIR/FFIR)
// Information Management (CCIR/PIR/FFIR)
export interface LogicCondition {
    subjectType: 'Unit' | 'Target' | 'SupplyNode' | 'CivilAgency' | 'BioSensor';
    subjectId?: string; // Optional: Specific entity
    property: 'location' | 'status' | 'affiliation' | 'uncertainty';
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'inRegion';
    value: any;
}

export interface CCIR {
    id: UUID;
    type: RequirementType;
    description: string; // Natural language summary
    conditions: LogicCondition[]; // Machine-readable logic
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Active' | 'Met' | 'Expired';
    linkedEntityId?: UUID;
    triggeredAt?: string;
    createdAt: string;
    feedback?: CCIRFeedback[];
    operationId?: string;
    campaignId?: string;
}

export interface CCIRFeedback {
    id: UUID;
    userId: string;
    comment: string;
    createdAt: string;
}

export interface CCIRHit {
    id: UUID;
    ccirId: UUID;
    entityId: UUID;
    entityType: string;
    timestamp: string;
    valueObserved: any;
    status: 'New' | 'Verified' | 'FalsePositive' | 'Archived';
    feedback?: CCIRFeedback[];
    operationId?: string;
    campaignId?: string;
}

// ==========================================
// CORE ONTOLOGY (Sprint 2 Standard)
// ==========================================

export type EntityType = 'Unit' | 'Target' | 'Facility' | 'Event' | 'Track' | 'Sensor';
export type Affiliation = 'Blue' | 'Red' | 'Green' | 'Grey' | 'White';
export type OperationalStatus = 'Active' | 'Degraded' | 'Destroyed' | 'Inactive' | 'Unknown';

export interface GeoPoint {
    lat: number;
    lng: number;
    alt?: number; // Meters MSL
    mgrs?: string; // Military Grid Reference System (optional for now)
}

export interface BaseEntity {
    id: UUID;
    name: string; // Unified display name
    description?: string;
    type: EntityType;
    affiliation: Affiliation;
    location?: GeoPoint;
    status: OperationalStatus;
    validFrom?: string; // ISO
    validUntil?: string; // ISO
    parentId?: UUID; // Hierarchical ownership
    uncertainty?: number; // 0.0 (Certain) to 1.0 (Unknown) - Trusted Data Layer
    lastVerified?: string; // ISO Date - Trusted Data Layer
    // Context linkage
    operationId?: string;
    campaignId?: string;
}

// --- CIVIL-MILITARY INTEGRATION (Total Defence) ---

export enum InfrastructureType {
    // Energy
    PowerPlant = 'PowerPlant',
    Substation = 'Substation',
    Refinery = 'Refinery',
    Pipeline = 'Pipeline',

    // Transport
    Port = 'Port',
    Airport = 'Airport',
    Bridge = 'Bridge',
    Tunnel = 'Tunnel',
    RailYard = 'RailYard',
    Highway = 'Highway', // MSR

    // Telecom
    DataCenter = 'DataCenter',
    CellTower = 'CellTower',
    FiberJunction = 'FiberJunction',

    // Industrial
    Factory = 'Factory', // e.g. Ammo production
    Warehouse = 'Warehouse',

    // Critical Services
    Hospital = 'Hospital',
    WaterTreatment = 'WaterTreatment'
}

export interface CivilAgency {
    id: UUID;
    name: string;
    type: 'Government' | 'Commercial' | 'NGO';
    sector: 'Energy' | 'Transport' | 'Health' | 'Telecom' | 'Industrial';
    jurisdiction: string;
    contactInfo: string;
}

export interface InfrastructureNode {
    id: UUID;
    name: string;
    type: InfrastructureType;
    location: GeoPoint;
    capacity: number; // e.g., MW, Tons/Day
    currentLoad: number; // Utilization
    status: 'Operational' | 'Degraded' | 'Offline' | 'Destroyed';
    ownerId: UUID; // CivilAgency ID
    criticality: 'Strategic' | 'Operational' | 'Tactical';
}

export interface CivilDependency {
    id: UUID;
    militaryEntityId: UUID; // Unit or Operation ID
    civilEntityId: UUID; // InfrastructureNode ID
    dependencyType: 'Logistical' | 'Informational' | 'Mobility' | 'Medical';
    impactIfLost: 'Critical' | 'Severe' | 'Moderate' | 'Low';

    // Supply Chain Specifics
    resourceType?: 'Fuel' | 'Ammo' | 'Food' | 'Bandwidth' | 'Power';
    flowRateRequired?: number;
}

// --- COMBAT NET RADIO (CNR) ---

export type RadioModulation = 'FM' | 'AM' | 'SatCom' | 'Link16' | 'HF';
export type NetworkStatus = 'Active' | 'Jammed' | 'Silence' | 'Compromised';
export type KeyType = 'TEK' | 'KEK'; // Traffic/Key Encryption Key

export interface ComsecKey {
    id: UUID;
    name: string; // e.g., "US-NATO-A-24"
    type: KeyType;
    status: 'Active' | 'Expired' | 'Compromised' | 'Reserve';
    validUntil: string; // ISO Date
    algorithm: 'AES-256' | 'TYPE-1';
}

export interface RadioNetwork {
    id: UUID;
    name: string; // e.g. "CMD NET A"
    frequency: number; // MHz
    modulation: RadioModulation;
    status: NetworkStatus;
    encryptionKeyId: UUID; // Link to active TEK
    signalQuality: number; // 0-100%
    participants: UUID[]; // Unit IDs on this net
}

// --- COGNITIVE HEALTH / HUMAN DOMAIN ---

export type StaffRole = 'Commander' | 'J2_Intel' | 'J3_Ops' | 'J4_Logistics' | 'J6_Comms' | 'Fires_Officer';
export type CognitiveStatus = 'Optimal' | 'Degraded' | 'Critical';

export interface StaffMember {
    id: UUID;
    name: string;
    role: StaffRole;
    assignedUnitId: UUID; // Link to Unit
    rank: string;
    qualifications: string[];
    trainingLevel: 'Junior' | 'Senior' | 'Master' | 'Expert';
    cognitiveStatus: CognitiveStatus;
    shiftStartedAt: string; // ISO Date
    fatigueScore: number; // 0-100 (100 = Exhausted)
}

export interface BiometricReading {
    id: UUID;
    staffId: UUID;
    type: 'HeartRate' | 'HRV' | 'SleepQuality' | 'VoiceStress';
    value: number;
    timestamp: string; // ISO Date
}

// --- METOC / ENVIRONMENT ---
export interface WeatherReport {
    id: UUID;
    location: string;
    temperature: number;
    condition: 'Clear' | 'Cloudy' | 'Rain' | 'Storm' | 'Fog';
    windSpeed: number; // knots
    windDirection: number; // degrees
    humidity: number; // percentage
    pressure: number; // hPa
    visibility: number; // km
    updatedAt: string;
}

export interface WeatherImpact {
    id: UUID;
    assetType: string;
    impact: 'Optimal' | 'Limited' | 'Degraded' | 'Grounded';
    reason: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

// --- LOGISTICS & SUSTAINMENT ---
export type SupplyClass = 'Class I' | 'Class III' | 'Class V' | 'Class VII';

export interface SupplyStatus {
    id: UUID;
    class: SupplyClass;
    name: string;
    level: number; // 0-100%
    status: 'Optimal' | 'Warning' | 'Critical';
}

export interface VehicleAsset {
    id: UUID;
    name: string;
    type: string;
    status: 'Ready' | 'Maintenance' | 'Destroyed' | 'Deployed';
    health: number; // 0-100
    unitId?: UUID;
}

// --- LEGAL / ROE ---
export interface LegalAdvisory {
    id: UUID;
    text: string;
    region: string;
    severity: 'Info' | 'Warning' | 'Critical';
}

// ==========================================
// DOMAIN TYPES
// ==========================================

// Module 1: Capacity
export interface ForceElement {
    id: UUID;
    name: string;
    type: string;
    level: CommandLevel;
    parentId?: UUID; // Commanding unit
    readiness: number; // 0-100
    location: string;
}

// Module 4: Campaign & Orders
export interface Campaign {
    id: UUID;
    name: string;
    objective: string;
    endState: string;
    startDate: string;
    endDate?: string;
    status: 'Active' | 'Planned' | 'Concluded';
}

// Operational Context (application-wide focus state)
export type OperationPhase =
    | 'Capacity Building'
    | 'Crisis Response Planning'
    | 'Execution'
    | 'Transition'
    | 'Lessons Learned';

export interface OperationalContext {
    level: 'Strategic' | 'Operational' | 'Tactical';
    campaignId: string | null;
    operationId: string | null;
    oplanId: string | null;
    missionId: string | null;
    name: string;
    phase?: OperationPhase;
}

export interface Operation {
    id: UUID;
    campaignId: UUID;
    name: string;
    phase: OperationPhase;
    oplanId?: UUID;
    commander: string;
    forcesAssigned: string[];
    status: 'Planning' | 'Executing' | 'Complete';
}

export interface Mission {
    id: UUID;
    operationId: UUID;
    objective: string;
    assignedUnit: string;
    startTime: string;
    endTime: string;
    status: 'Assigned' | 'InProgress' | 'Complete' | 'Aborted';
}

export interface JointCoordinationOrder {
    id: UUID;
    campaignId: UUID;
    serial: string; // e.g., JCO-24-001
    validFrom: string;
    validUntil: string;
    body: string;
    status: 'Draft' | 'Active' | 'Superseded';
}

export interface FragmentaryOrder {
    id: UUID;
    parentOrderId: UUID;
    serial: string; // e.g., FRAGO-01-05
    date: string;
    changes: string;
    status: 'Draft' | 'Published';
}

// Operational Design Entities
export type LOOType = 'Logical' | 'Physical';

export interface LineOfOperation {
    id: UUID;
    campaignId: UUID;
    name: string;
    type: LOOType;
    description: string;
    sequence: number;
    color: string; // For UI rendering
}

export type DCStatus = 'Pending' | 'InProgress' | 'Achieved' | 'AtRisk';

export interface DecisiveCondition {
    id: UUID;
    campaignId: UUID;
    looId: UUID;
    name: string;
    description: string;
    criteria: string;
    status: DCStatus;
    targetDate?: string;
}

export interface CourseOfAction {
    id: UUID;
    operationId: UUID;
    name: string;
    description: string;
    selected: boolean;
    status: 'Draft' | 'Analyzed' | 'Selected' | 'Archived';
    riskLevel: 'Low' | 'Medium' | 'High';
    advantages: string[];
    disadvantages: string[];
    effectiveness: number; // 0-100
    wargamingMetrics?: WargamingMetrics;
}

export interface WargamingMetrics {
    probabilityOfSuccess: number; // 0-1
    estimatedRisk: number; // 0-1
    resourceConsumption: number; // 0-1
    predictedCasualties: 'Low' | 'Medium' | 'High';
    politicalCapitalImpact: number; // -1 to 1
    durationDays: number;
}

// Module 6: Targeting
// Module 6: Targeting
export type TargetStatus = 'Identified' | 'Nominated' | 'Validated' | 'Approved' | 'Engaged' | 'Neutralized';

export interface Target extends BaseEntity {
    type: 'Target';
    designator: string; // e.g. "T-1001"
    targetId: string; // Deprecated, use designator
    beNumber?: string; // Basic Encyclopedia Number
    category: string; // e.g. "C2", "Logistics", "Airfield"
    catCode: string; // e.g. "12000"
    priority: 'High' | 'Medium' | 'Low';
    // location inherited from BaseEntity (GeoPoint)
    desiredEffect: string; // e.g. "Neutralize", "Disrupt", "Delay"
    collateralDamageEstimate: 'Low' | 'Medium' | 'High';
    // Expanded Ontology
    // Expanded Ontology
    functionalType?: string;
    patternOfLife?: any[];
    timeWindow?: any;
    legalStatus?: any;
    weatherConstraints?: any;
    classification?: string;
    targetStatus: TargetStatus; // Specific lifecycle status (renamed from status to avoid conflict, or overlap?)
    // Actually BaseEntity.status is OperationalStatus. We keep targetStatus for the Workflow status.
    nominatedById: string;
    validatedById?: string;
    approvedById?: string;
    targetFolderUrl?: string;
    requiredRoeId?: UUID;
    killChainPhase: KillChainPhase;
    supplyNodeId?: UUID;
    bdaStatus?: 'None' | 'Assess' | 'Re-strike' | 'Effect Achieved' | 'Monitor';
    assessmentStatus?: 'Pending Imagery' | 'Initial' | 'Supplemental' | 'Final';
}

export type KillChainPhase = 'Find' | 'Fix' | 'Track' | 'Target' | 'Engage' | 'Assess';

// Deep Dive: Targeting Systems
export interface TargetSystem {
    id: UUID;
    name: string; // e.g. "Redland IADS"
    type: 'IADS' | 'Power' | 'Logistics' | 'C2';
    status: 'Operational' | 'Degraded' | 'Non-Functional';
    components: string[]; // Target IDs
    criticality: number; // 0-1
}

// Deep Dive: Weaponeering
export interface WeaponSystem {
    id: UUID;
    name: string;
    type: 'Air-to-Ground' | 'Surface-to-Surface' | 'Cyber';
    warhead: string;
    blastRadius: number; // meters
    collateralRisk: 'Low' | 'Medium' | 'High';
}

// Deep Dive: Pattern of Life
export interface ActivityLog {
    id: UUID;
    targetId: UUID;
    timestamp: string;
    description: string; // e.g. "Shift change observed"
    activityType: 'Movement' | 'Comms' | 'Logistics' | 'Maintenance';
    confidence: number;
}

// Module 7: Assessment
export type Trend = 'Improving' | 'Stable' | 'Degrading';

export interface MeasurementOfEffectiveness {
    id: UUID;
    name: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    trend: Trend;
    lastUpdated: string;
}

export interface MeasurementOfPerformance {
    id: UUID;
    name: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
}

export interface AssessmentReport {
    id: UUID;
    campaignId: UUID;
    title: string;
    date: string;
    status: 'Draft' | 'Final' | 'Archived';
    overallProgress: number; // 0-100
    confidenceLevel: 'Low' | 'Medium' | 'High';
    executiveSummary: string;
    findings: string[];
    recommendations: string[];
    moes: MeasurementOfEffectiveness[];
    mops: MeasurementOfPerformance[];
}

export interface EffectivenessGap {
    id: UUID;
    campaignId: UUID;
    looId: UUID;
    name: string; // e.g. "Security LOO Progress"
    plannedTrajectory: {
        date: string;
        value: number;
    }[];
    actualTrajectory: {
        date: string;
        value: number;
    }[];
    currentGap: number; // e.g. -15 (negative is underperformance)
    status: 'OnTrack' | 'MinorDeviance' | 'CriticalGap';
    rootCause?: string; // e.g. "Vendor Delay"
    recommendations: string[];
}

// Scenarios
export interface Scenario {
    id: UUID;
    name: string;
    type: 'HADR' | 'Exercise' | 'Defensive' | 'Stabilization';
    description: string;
    isActive: boolean;
}

// Module 9: Rules of Engagement

export interface ROE {
    id: UUID;
    code: string; // e.g. "421"
    name: string; // e.g. "Self-Defense Only"
    description: string;
    status: ROEStatus;
    constraints: string[];
}

// Module 10: Supply Chain
export type SupplyOwner = 'Blue' | 'Red' | 'Grey';

export interface SupplyNode {
    id: UUID;
    name: string;
    owner: SupplyOwner;
    type: 'Source' | 'Transport' | 'Terminal';
    location: string;
    criticality: number; // 0-1
    vulnerability: number; // 0-1
}

export interface SupplyEdge {
    id: UUID;
    fromNodeId: UUID;
    toNodeId: UUID;
    modality: 'Sea' | 'Air' | 'Land';
}

export interface Vendor {
    id: UUID;
    name: string;
    alignment: SupplyOwner;
    conflictInterestLevel: 'Low' | 'Medium' | 'High';
    contracts: { unitId: string; side: SupplyOwner }[];
    revenueFromWar: number; // Percentage
}

// Module 11: Strike Analysis
export interface StrikeAnalysis {
    targetId: UUID;
    selectionScore: number; // 0-100
    tacticalGain: number; // 0-100
    strategicGain: number; // 0-100
    economicImpact: number; // negative is bad
    legalCompliance: 'Clear' | 'Pending' | 'Violated';
    reasoning: string;
}

export interface BDAReport {
    id: UUID;
    targetId: UUID;
    strikes: {
        timeOnTarget: string; // ISO
        weaponSystem: string;
        munition: string;
        impactCoordinates: string;
    }[];
    physicalDamage: 'None' | 'Light' | 'Moderate' | 'Severe' | 'Destroyed';
    functionalDamage: 'None' | 'Degraded' | 'Non-Mission Capable';
    collateralDamageReported: boolean;
    recommendation: 'Re-strike' | 'Effect Achieved' | 'Monitor';
    confidence: number; // 0-1
    notes: string;
    assessorId: string;
    submittedAt: string;
    status: 'Draft' | 'Submitted' | 'Approved';
    assessmentType: 'Initial' | 'Supplemental' | 'Final';
    imageUrl?: string; // Placeholder for before/after
}

export interface CollectionRequest {
    id: UUID;
    targetId: UUID;
    assetType: 'IMINT' | 'SIGINT' | 'HUMINT' | 'OSINT';
    status: 'Planned' | 'Tasked' | 'In-Orbit' | 'Processing' | 'Completed';
    priority: 'Critical' | 'High' | 'Normal' | 'Routine';
    eta: string; // ISO
    requirements: string;
}

// Module 12: Information Management
export type RequirementType = 'PIR' | 'FFIR' | 'SIR' | 'EEFI';
export type InfoStatus = 'Pending' | 'Collection' | 'Analysis' | 'Disseminated';

export interface InformationRequirement {
    id: UUID;
    type: RequirementType;
    description: string;
    priority: 'Critical' | 'High' | 'Normal';
    status: InfoStatus;
    deadline: string;
    assignedCell: string;
}

export interface InformationFlow {
    id: UUID;
    source: string;
    destination: string;
    dataType: string;
    timestamp: string;
    status: 'Routing' | 'Delivered' | 'Delayed';
}

// Module 13: Briefing & Decision Boards
export interface BriefSlide {
    id: UUID;
    title: string;
    content: string; // Markdown or structured JSON
    visualType: 'Map' | 'Chart' | 'Table' | 'Network' | 'Text';
    metadata?: any;
}

export interface Brief {
    id: UUID;
    title: string;
    description: string;
    ownerCell: string;
    bluf: string;
    slides: BriefSlide[];
    status: 'Draft' | 'Final' | 'Archived';
    createdAt: string;
}

export interface DecisionBoard {
    id: UUID;
    title: string;
    dateTime: string;
    chair: string;
    briefId: UUID;
    pendingDecisions: string[];
    outcomes: { decision: string; status: 'Approved' | 'Rejected' | 'Deferred'; rationale: string }[];
}

// Module 14: Order of Battle (ORBAT)
// Module 14: Order of Battle (ORBAT)
export enum UnitType {
    Infantry = 'Infantry',
    Armor = 'Armor',
    Artillery = 'Artillery',
    C2 = 'C2',
    Logistics = 'Logistics',
    Air = 'Air',
    SOF = 'SOF',
    Naval = 'Naval',
    Cyber = 'Cyber'
}

export enum UnitEchelon {
    Corps = 'Corps',
    Division = 'Division',
    Brigade = 'Brigade',
    Battalion = 'Battalion',
    Company = 'Company',
    Platoon = 'Platoon',
    Squad = 'Squad'
}

export enum Capability {
    DirectFire = 'Direct Fire',
    IndirectFire = 'Indirect Fire',
    AirDefense = 'Air Defense',
    ElectronicWarfare = 'Electronic Warfare',
    LogisticsSupport = 'Logistics Support',
    Intelligence = 'Intelligence',
    CyberAttack = 'Cyber Attack',
    SpecialRecon = 'Special Recon',
    CloseAirSupport = 'Close Air Support'
}

export interface Unit extends BaseEntity {
    type: 'Unit'; // Discriminator
    unitType: UnitType; // Specific domain type
    designator: string; // e.g. "1-7 AR"
    echelon: UnitEchelon;
    readiness: number; // 0-100
    combatEffectiveness: 'Effective' | 'Marginal' | 'Ineffective';
    capabilities: Capability[];
    caveats: string[];
    restrictions: string[];
}

// Battle Rhythm & Governance
export enum BattleRhythmType {
    WorkingGroup = 'Working Group',
    DecisionBoard = 'Decision Board',
    JointBoard = 'Joint Coordination Board (JCB)',
    CoordinationMeeting = 'Coordination Meeting',
    Briefing = 'Briefing'
}

export interface TermsOfReference {
    id: UUID;
    eventId: UUID; // The BattleRhythmEvent this TOR belongs to
    title: string;
    objectives: string[];
    agenda: string[];
    participants: { role: string; commandLevel: CommandLevel; required: boolean }[];
    url?: string;
    feedback: { id: UUID; userId: string; comment: string; date: string; status: 'Pending' | 'Addressed' }[];
}

export interface GovernanceSession {
    id: UUID;
    title: string;
    type: BattleRhythmType;
    startTime: string; // ISO Date
    endTime: string; // ISO Date
    chair: string; // The person/role making the calls
    location: string;
    attendees: { role: string; cell: string; type: 'Authority' | 'Contributor' | 'Observer' }[];
    inputs: { fromCell: string; type: string; title: string }[];
    outputs: { toCell: string; type: string; title: string }[];
    status: 'Scheduled' | 'InProgress' | 'Concluded' | 'Cancelled';
    agendaItems?: UUID[]; // List of Proposal IDs to be decided
    meetingRecord?: MeetingRecord; // The official record of the meeting
    operationId?: string;
    campaignId?: string;
}

export interface MeetingRecord {
    sessionId: UUID;
    actualStartTime: string;
    actualEndTime?: string;
    rollCall: {
        attendeeName: string;
        role: string;
        status: 'Present' | 'Absent' | 'Remote';
    }[];
    readinessStatus: {
        cell: string;
        status: 'Green' | 'Amber' | 'Red';
        comment?: string;
    }[];
    outcomes: {
        proposalId: UUID;
        decision: 'Approved' | 'Rejected' | 'Deferred';
        rationale: string;
        provisos?: string;
    }[];
    agendaCoverage: { // Tracks progress against TOR Agenda
        item: string;
        status: 'Covered' | 'Skipped' | 'Deferred';
        notes: string;
    }[];
    riskAccepted: string[];
    guidanceIssued: string[];
    notes: string;
}

export interface BattleRhythmEvent {
    id: UUID;
    name: string;
    type: BattleRhythmType;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'AdHoc';
    nextSlot: string; // ISO Date
    daysOfWeek?: number[]; // 0-6 for weekly
    chairRole: string;
    contributingCells: string[];
    governingAuthority: string;
    feedsInto?: UUID; // ID of the parent BattleRhythmEvent (e.g., WG -> Board)
    torId?: UUID;
}

// RFI & Product Reporting
export interface RequestForInformation {
    id: UUID;
    direction: 'Inbound' | 'Outbound';
    subject: string;
    description: string;
    requestor: string; // User/Role
    assignee: string; // Target Role/Cell
    priority: 'Critical' | 'Routine';
    status: 'Open' | 'Pending' | 'Closed';
    deadline: string;
    createdAt: string;
    responses: {
        id: UUID;
        text: string;
        responder: string;
        date: string;
    }[];
}

export interface ProductReport {
    id: UUID;
    title: string;
    type: 'SITREP' | 'INTREP' | 'ASSESS' | 'JCO' | 'FRAGO';
    summary: string;
    content: any; // Structured data used to generate the report
    generatedAt: string;
    author: string;
    integrityHash: string; // SHA-256
    status: 'Draft' | 'Final';
    version: number;
}

// Module: COG Analysis (Dr. Joe Strange Model)
export interface CenterOfGravity {
    id: UUID;
    side: 'Blue' | 'Red' | 'Green' | 'Grey';
    name: string;
    description: string;
    capabilities: CriticalCapability[];
    operationId?: string;
    campaignId?: string;
}

export interface CriticalCapability {
    id: UUID;
    cogId: UUID;
    name: string;
    description: string;
    requirements: CriticalRequirement[];
}

export interface CriticalRequirement {
    id: UUID;
    capabilityId: UUID;
    name: string;
    description: string;
    vulnerabilities: CriticalVulnerability[];
}

export interface CriticalVulnerability {
    id: UUID;
    requirementId: UUID;
    name: string;
    description: string;
    relatedTargetId?: UUID; // Links to Targeting Module
    status: 'Observed' | 'Analyzed' | 'Targeted' | 'Neutralized';
    // Defensive Attributes
    protectionStatus?: 'Unprotected' | 'Guarded' | 'Fortified';
    resilienceScore?: number; // 0-100
}

// --- OPLAN Management Types ---

export interface OntologyEntityRef {
    id: string;
    name: string;
    type: string; // e.g., 'Unit', 'Location', 'Effect'
    entityId: string; // ID in the actual store/ontology
}

export type SecurityClassification = 'Unclassified' | 'Restricted' | 'Confidential' | 'Secret' | 'Top Secret';

export interface PlanFeedback {
    id: string;
    sectionId: string;
    userId: string;
    userRole: string; // e.g., 'J4 Planner'
    content: string;
    timestamp: string;
    status: 'open' | 'addressed' | 'resolved';
}

export interface ConsistencyCheck {
    id: string;
    rule: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    affectedSectionIds: string[];
}

export interface PlanSection {
    id: string;
    title: string;
    content: string; // Main text content (HTML or Markdown)
    type: 'main-body' | 'annex' | 'appendix' | 'tab';
    order: number;
    parentSectionId?: string;
    subSections: PlanSection[];
    audience: string[]; // Role tags, e.g., ['J2', 'J5']
    classification: SecurityClassification;
    referencedEntities: OntologyEntityRef[]; // Linked ontology items
    overlays?: string[]; // IDs of map overlays relevant to this section
    status: 'draft' | 'review' | 'final';
    feedback: PlanFeedback[];
}

export interface OPLAN {
    id: string;
    campaignId: string;
    name: string;
    classification: SecurityClassification;
    status: 'draft' | 'active' | 'latent' | 'archived';
    version: string;
    lastUpdated: string;
    sections: PlanSection[]; // Top level sections (Main Body, Annexes)
    consistencyChecks: ConsistencyCheck[];
}

// Module: Situational Awareness (Recognised Picture - RxP)
export type TrackDomain = 'Air' | 'Maritime' | 'Ground' | 'Cyber' | 'Social' | 'Space';

export interface Track extends BaseEntity {
    type: 'Track';
    callsign: string; // Maps to BaseEntity.name usually, but can keep specific alias
    domain: TrackDomain;
    // side Maps to Affiliation
    // position Maps to Location
    vector: {
        speed: number; // Knots or km/h
        heading: number; // Degrees 0-359
    };
    trackType: string; // e.g., 'F-35', 'Type-45 Destroyer', 'T-90 Tank' (renamed from type to avoid BaseEntity conflict)
    classification: string; // e.g., 'HOSTILE', 'FRIENDLY', 'SUSPECT'
    lastUpdated: string;
    relatedUnitId?: UUID; // Link to ORBAT if applicable
}

export interface StrategicGuidance {
    id: UUID;
    title: string;
    source: string; // e.g., 'SACEUR', 'NAC'
    intent: string;
    objectives: {
        id: string;
        text: string;
        status: 'On track' | 'At risk' | 'Achieved';
        tasks: string[];
    }[];
    lastUpdated: string;
    operationId?: string;
    campaignId?: string;
}

export interface PMESIIData {
    area: string;
    political: number; // 0-1 stability score
    military: number;
    economic: number;
    social: number;
    infrastructure: number;
    information: number;
}

// ============================================================================
// External Context & PMESII Factors
// ============================================================================

export type ContextFactorType = 'Political' | 'Military' | 'Economic' | 'Social' | 'Information' | 'Infrastructure' | 'Physical' | 'Time';

export interface ExternalContextFactor {
    id: UUID;
    type: ContextFactorType;
    name: string;
    description: string;
    timestamp: string;
    source: string;
    confidence: number; // 0-1
    impactLevel: 'Strategic' | 'Operational' | 'Tactical';
    // Linkage
    affectedOperationIds: string[]; // Operations this factor influences
}

// Political
export interface PoliticalStatement extends ExternalContextFactor {
    type: 'Political';
    speaker: string;
    role: string; // e.g., 'President', 'Foreign Minister'
    sentiment: 'Hostile' | 'Neutral' | 'Supportive';
    requiresAction: boolean;
}

// Environmental / Physical
export interface NaturalDisaster extends ExternalContextFactor {
    type: 'Physical';
    disasterType: 'Earthquake' | 'Flood' | 'Wildfire' | 'Hurricane';
    severity: number; // 1-10 scale
    location: string; // Geo-string or region ID
    impactOnLogistics: number; // 0-1 degradation factor
}

// Information Warfare
export interface Attribution {
    actorId?: string;
    actorName: string;
    confidence: number;
    evidence: string[];
}

export interface DisinformationEvent extends ExternalContextFactor {
    type: 'Information';
    narrative: string;
    targetAudience: string;
    platform: 'Social Media' | 'Broadcast' | 'Dark Web';
    amplification: 'Viral' | 'High' | 'Moderate' | 'Low';
    debunked: boolean;
    attribution?: Attribution;
}

export interface FakeMedia extends ExternalContextFactor {
    type: 'Information';
    mediaType: 'Video' | 'Audio' | 'Image';
    isDeepfake: boolean;
    detectionConfidence: number; // 0-1
    originalSourceUrl?: string;
    manipulationTechnique?: string;
}

// ============================================================================
// Decision Options & Consequences System
// ============================================================================

export type DecisionUrgency = 'critical' | 'high' | 'medium' | 'low';
export type DecisionComplexity = 'high' | 'medium' | 'low';
export type DecisionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred';

// ROE (Rules of Engagement) Status
export type ROEStatus =
    | 'within_approved_roe'      // Can proceed under current ROE
    | 'requires_roe_release'     // Needs new ROE authorization
    | 'roe_pending_approval'     // ROE release request submitted
    | 'roe_approved'             // New ROE approved, can proceed
    | 'roe_rejected'             // ROE request rejected
    | 'Released'                 // ROE has been released for use
    | 'Draft';                   // ROE is still in draft phase
export type DecisionCategory = 'strike' | 'maneuver' | 'resource_allocation' | 'policy' | 'personnel';
export type ConsequenceDomain = 'operational' | 'political' | 'economic' | 'environmental' | 'personnel' | 'legal';
export type ConsequenceType = 'positive' | 'negative' | 'neutral';
export type ConsequenceSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ConsequenceTimeframe = 'immediate' | 'short_term' | 'medium_term' | 'long_term';
export type ResourceType = 'personnel' | 'equipment' | 'budget' | 'time';
export type ResourceAvailability = 'available' | 'constrained' | 'unavailable';

// Stakeholder affected by or involved in decision
export interface Stakeholder {
    name: string;
    role: string;
    impact: 'direct' | 'indirect';
    mustConsult: boolean;
}

// Decision Context (what this decision is about)
export interface DecisionContext {
    category: DecisionCategory;
    relatedEntityIds: UUID[];
    backgroundBriefId?: UUID;
    triggeringEvent?: string;
    stakeholders: Stakeholder[];
    politicalSensitivity: 'high' | 'medium' | 'low';
    mediaVisibility: 'high' | 'medium' | 'low';
}

// Resource requirements for an option
export interface ResourceRequirement {
    resourceType: ResourceType;
    quantity: number;
    unit: string;
    availability: ResourceAvailability;
    conflict?: string;
}

// Timeline for option execution and consequences
export interface OptionTimeline {
    executionDuration: string; // "30 minutes", "6 hours", "3 days"
    firstImpactTime: string; // When first consequences appear
    fullImpactTime: string; // When all consequences manifest
    reversibilityWindow?: string; // How long to reverse if needed
}

// A specific consequence (positive or negative)
export interface Consequence {
    domain: ConsequenceDomain;
    type: ConsequenceType;
    severity: ConsequenceSeverity;
    description: string;
    likelihood: number; // 0-1 probability
    impactScore: number; // -100 to +100
    timeframe: ConsequenceTimeframe;
    affectedMetrics?: string[]; // Links to balanced scorecard metrics
    cascades?: Consequence[]; // Secondary consequences triggered by this one
}

// Dimension impact in trade-off analysis
export interface DimensionImpact {
    currentScore: number; // 0-100
    projectedImpact: number; // -50 to +50
    newScore: number; // currentScore + projectedImpact
    threshold: number; // Minimum acceptable score
    breachesThreshold: boolean;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

// Trade-off analysis across balanced scorecard dimensions
export interface TradeOffAnalysis {
    dimensions: {
        operational: DimensionImpact;
        personnel: DimensionImpact;
        budget: DimensionImpact;
        environmental: DimensionImpact;
        political: DimensionImpact;
        legal: DimensionImpact;
    };
    overallScore: number; // -100 to +100
    recommendedOption?: UUID; // Option ID
}

// Each option available to the commander
export interface DecisionOption {
    id: UUID;
    label: string; // "APPROVE", "DEFER 24H", "MODIFY & APPROVE", "REJECT"
    description: string;
    recommended: boolean; // System recommendation based on analysis
    immediateConsequences: Consequence[];
    secondaryConsequences: Consequence[];
    resourceRequirements?: ResourceRequirement[];
    timeline: OptionTimeline;
    confidence: number; // 0-1, AI/system confidence in consequence predictions
    precedents?: string[]; // Similar past decisions
    tradeOffAnalysis?: TradeOffAnalysis;
    overallScore?: number; // Calculated score
}

// Risk factor that should influence the decision
export interface RiskFactor {
    id: UUID;
    description: string;
    severity: ConsequenceSeverity;
    category: 'political' | 'operational' | 'legal' | 'environmental' | 'safety';
    mitigation?: string; // How to reduce this risk
    detectedBy: 'system' | 'human' | 'ai';
}

// Decision Routing Plan (from backend)
export interface RoutingPlan {
    venue_id?: string;
    venue_name: string;
    meeting_instance_id?: string;
    meeting_date?: string;
    meeting_time?: string;
    agenda_order?: number;
    presenter?: string;
    estimated_duration?: number;
    routing_reason?: string;
    routed_at: string;
    can_proceed: boolean; // Whether decision can proceed to meeting (ROE integration)
    urgency_override?: string; // e.g., "ROE_BLOCKER"
}

// Core Decision Type
export interface Decision {
    id: UUID;
    title: string;
    description: string;
    urgency: DecisionUrgency;
    complexity: DecisionComplexity;
    deadline?: string; // ISO datetime
    context: DecisionContext;
    options: DecisionOption[];
    riskFactors: RiskFactor[];
    requiredApprovers: UUID[];
    status: DecisionStatus;
    roeStatus: ROEStatus; // Rules of Engagement authorization status
    roeNotes?: string; // Additional ROE context or requirements
    routing?: RoutingPlan; // Routing plan with ROE blocking status
    createdAt: string;
    createdBy: UUID;
    selectedOptionId?: UUID;
    justification?: string;
    operationId?: string;
    campaignId?: string;
}

// Decision analysis result (from backend)
export interface DecisionAnalysis {
    decisionId: UUID;
    analyzedOptions: {
        option: DecisionOption;
        immediateConsequences: Consequence[];
        secondaryConsequences: Consequence[];
        tradeOffAnalysis: TradeOffAnalysis;
        resourceAvailability: ResourceRequirement[];
        overallScore: number;
    }[];
    riskFactors: RiskFactor[];
    precedents: {
        decisionId: UUID;
        title: string;
        date: string;
        chosenOption: string;
        outcome: string;
    }[];
    recommendation: UUID; // Recommended option ID
    aiConfidence: number; // 0-1
    cognitiveLoadWarning?: {
        timeOnDuty: number; // minutes
        fatigueLevel: 'low' | 'medium' | 'high' | 'critical';
        recommendConsultation: boolean;
        recommendBreak: boolean;
    };
}

// ============================================================================
// Decision Tracking & Impact Monitoring System
// ============================================================================

export type TrackingStatus = 'unfolding' | 'complete' | 'needs_review' | 'closed';
export type ConsequenceStatus = 'pending' | 'on_track' | 'complete' | 'risk_avoided' | 'unexpected';
export type DiscrepancyType = 'over_predicted' | 'under_predicted' | 'unexpected_consequence' | 'risk_materialized';
export type TrendStatus = 'improving' | 'stable' | 'declining' | 'critical';

// Individual consequence outcome tracking
export interface ConsequenceOutcome {
    consequenceId: UUID;
    description: string;
    predicted: {
        impactScore: number;
        likelihood: number;
        timeframe: string;
    };
    actual: {
        impactScore?: number; // null if not yet manifested
        occurred: boolean;
        occurredAt?: string;
        notes?: string;
    };
    status: ConsequenceStatus;
    variance: number; // actual - predicted
}

// Discrepancy between predicted and actual
export interface Discrepancy {
    type: DiscrepancyType;
    description: string;
    predictedImpact: number;
    actualImpact: number;
    rootCause?: string;
    recommendation?: string;
}

// Learning from decision outcomes
export interface Learning {
    category: 'prediction_accuracy' | 'risk_assessment' | 'cascade_detection';
    insight: string;
    actionable: string; // What to do differently
    modelUpdate: boolean; // Should ML model be updated?
}

// Full decision tracking
export interface DecisionTracking {
    decisionId: UUID;
    decisionTitle: string;
    approvedAt: string; // ISO timestamp
    approvedBy: UUID;
    selectedOption: DecisionOption;
    status: TrackingStatus;
    daysElapsed: number;
    expectedDuration: number; // days

    // Predicted vs Actual comparison
    predictedScore: number;
    actualScore: number; // Calculated from actual consequences
    accuracy: number; // 0-1 (actual/predicted)

    // Individual consequence tracking
    consequenceTracking: ConsequenceOutcome[];

    // Discrepancies and learnings
    discrepancies: Discrepancy[];
    learnings: Learning[];

    // Related impacts
    affectedDimensions: string[];
}

// Cascaded impact from a decision
export interface CascadeImpact {
    source: string; // Which consequence triggered this
    description: string;
    impact: number;
    triggeredAt: string;
}

// How a decision is contributing to current metrics
export interface DecisionContribution {
    decisionId: UUID;
    decisionTitle: string;
    approvedAt: string;
    daysAgo: number;

    // Impact
    directImpact: number; // Immediate consequence
    cascadedImpacts: CascadeImpact[]; // Secondary consequences
    totalImpact: number;

    // Status
    isOngoing: boolean; // Still affecting?
    expectedDuration: number; // Days
    decayRate: number; // How fast impact fades

    // Reversal
    reversible: boolean;
    reversalAction?: string;
}

// Alert for a dimension
export interface DimensionAlert {
    severity: 'info' | 'warning' | 'critical';
    message: string;
    threshold: number;
    daysToThreshold?: number; // If declining
    recommendedAction?: string;
}

// Impact monitoring for a dimension
export interface DecisionImpactMonitor {
    dimension: string; // 'operational', 'political', etc.
    currentScore: number;
    baseline: number; // Score before recent decisions
    netImpact: number; // Current - baseline
    trend: TrendStatus;

    // Decisions affecting this dimension
    contributingDecisions: DecisionContribution[];

    // Forecast
    forecast: {
        projectedScore: number; // In 7 days
        confidenceInterval: [number, number]; // [min, max]
        naturalDecay: number; // How much impact will fade
        requiresIntervention: boolean;
    };

    // Alerts
    alerts: DimensionAlert[];
}

// Network node for decision visualization
export interface DecisionNetworkNode {
    id: UUID;
    type: 'decision' | 'consequence' | 'cascade';
    label: string;
    timestamp: string;
    dimension?: string; // For consequence nodes
    impact?: number;
    severity: 'info' | 'warning' | 'critical';
}

// Network edge connecting nodes
export interface DecisionNetworkEdge {
    from: UUID; // Node ID
    to: UUID; // Node ID
    relationship: 'causes' | 'cascades_to' | 'compounds_with';
    strength: number; // 0-1 (how strong is the connection)
    timeDelay: number; // Days between cause and effect
}

// Cluster of related decisions
export interface DecisionCluster {
    dimension: string;
    affectedBy: UUID[]; // Decision IDs
    totalImpact: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Insight from network analysis
export interface NetworkInsight {
    type: 'cascade_depth' | 'compound_effect' | 'unexpected_connection';
    description: string;
    affectedDecisions: UUID[];
    severity: string;
    recommendation: string;
}

// Complete decision network
export interface DecisionNetwork {
    nodes: DecisionNetworkNode[];
    edges: DecisionNetworkEdge[];
    clusters: DecisionCluster[];
    insights: NetworkInsight[];
}

