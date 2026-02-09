/**
 * Central API Client Exports
 *
 * This file aggregates all API clients for easy importing.
 * Use these instead of MshnCtrlService for ontology-first, data-driven approach.
 *
 * Migration Guide:
 * OLD: import { MshnCtrlService } from '@/lib/mshnctrl/mock-service'
 *      MshnCtrlService.getTargets()
 *
 * NEW: import { TargetingApi } from '@/lib/mshnctrl/api'
 *      TargetingApi.getTargets()
 */

// Targeting & BDA
export { targetingApi as TargetingApi } from './targeting.api';
export type {
    DecisionGate,
    DecisionGatesResponse,
    Target,
    StrikePlatform,
    BDAAssessment,
    MissionIntent,
    TargetingGuidance,
    DecisionAuthority,
    OperationalTempo,
    OntologySchema,
    DtlEntry,
} from './targeting.api';

// BDA (Battle Damage Assessment)
export { BdaApi as BDAApi } from './bda';
export type {
    BdaReport,
    BdaStatus,
    BdaPeerReview,
    BdaImagery,
} from './bda';

// ROE (Rules of Engagement)
export { roeApi as ROEApi } from './roe.api';
export type {
    ROERequest,
    DecisionROEStatus,
} from './roe.api';

// Operations & Meetings
export { OperationsApi } from './operations';
export { MeetingsApi } from './meetings.api';
export type {
    MeetingMinutes,
    ActionItem,
    LessonLearned,
} from './meetings.api';

// Intelligence
export { intelligenceApi as IntelligenceApi } from './intelligence';

// Decisions
export { decisionsApi as DecisionsApi } from './decisions.api';

// Feedback
export { feedbackApi as FeedbackApi } from './feedback.api';
export type {
    CreateFeedbackEventRequest,
    UpdateFeedbackEventRequest,
} from './feedback.api';

/**
 * Usage Examples:
 *
 * // Targeting
 * const targets = await TargetingApi.getTargets({ status: 'Active' });
 * const target = await TargetingApi.getTarget(id);
 * await TargetingApi.updateTarget(id, { priority: 'HIGH' });
 *
 * // BDA
 * const reports = await BDAApi.getReports();
 * const report = await BDAApi.getReport(id);
 * await BDAApi.createReport(data);
 *
 * // ROE
 * const roeRules = await ROEApi.getRules();
 * await ROEApi.createRequest(request);
 *
 * // Operations
 * const campaigns = await OperationsApi.getCampaigns();
 * const operations = await OperationsApi.getOperations(campaignId);
 *
 * // Intelligence (uses Ontology)
 * const rfis = await IntelligenceApi.getRFIs();
 * await IntelligenceApi.createRFI(data);
 *
 * // Meetings
 * const meetings = await MeetingsApi.getMeetings();
 * await MeetingsApi.createMeeting(data);
 *
 * // Decisions
 * const decisions = await DecisionsApi.getDecisions();
 * await DecisionsApi.createDecision(data);
 */
