import { api } from '@/lib/api';

export interface MeetingProperties {
    start_time?: string;
    end_time?: string;
    location?: string;
    meeting_type?: string;
    [key: string]: any;
}

export interface AgendaPointProperties {
    presenter?: string;
    duration_minutes?: number;
    order?: number;
    [key: string]: any;
}

export interface Meeting {
    id: string;
    title: string;
    description: string;
    start_time: string; // RFC3339
    end_time: string;   // RFC3339
    location: string;
    status: string;
    meeting_type: string;
    properties?: MeetingProperties;
}

export interface Tor {
    id: string;
    title: string;
    text: string;
    properties?: any;
}

export interface AgendaPoint {
    id: string;
    title: string;
    presenter?: string;
    duration_minutes?: number;
    order?: number;
    properties?: AgendaPointProperties;
}

export interface MeetingDetails {
    meeting: Meeting;
    tor?: Tor;
    agenda_points: AgendaPoint[];
    decisions?: any[];
}

export interface CreateMeetingRequest {
    title: string;
    description: string;
    start_time: string; // RFC3339
    end_time: string;   // RFC3339
    location: string;
    meeting_type: string;
}

// Meeting Minutes types
export interface ActionItem {
    id: string;
    minutes_id: string;
    task: string;
    assigned_to: string;
    due_date?: string;
    status: string; // 'OPEN' | 'COMPLETE'
}

export interface LessonLearned {
    id: string;
    minutes_id: string;
    content: string;
    category?: string;
}

export interface MeetingMinutes {
    id: string;
    meeting_id: string;
    attendees: string[];
    discussion_summary: string;
    recorded_by: string;
    recorded_at: string;
    classification?: string;
    created_at: string;
    updated_at: string;
    action_items: ActionItem[];
    lessons_learned: LessonLearned[];
}

export interface RecordMinutesRequest {
    attendees: string[];
    discussion_summary: string;
    recorded_by: string;
    classification?: string;
    action_items?: { task: string; assigned_to: string; due_date?: string }[];
    lessons_learned?: { content: string; category?: string }[];
}

export const MeetingsApi = {
    /**
     * List all meetings
     */
    listMeetings: async (): Promise<Meeting[]> => {
        return api.get<Meeting[]>('/c2/meetings');
    },

    /**
     * Get detailed meeting info including TOR and Agenda
     */
    getMeetingDetails: async (id: string): Promise<MeetingDetails> => {
        return api.get<MeetingDetails>(`/c2/meetings/${id}`);
    },

    /**
     * Create a new meeting
     */
    createMeeting: async (req: CreateMeetingRequest): Promise<Meeting> => {
        return api.post<Meeting>('/c2/meetings', req);
    },

    /**
     * Get meeting minutes (returns null if none recorded)
     */
    getMinutes: async (meetingId: string): Promise<MeetingMinutes | null> => {
        try {
            return await api.get<MeetingMinutes>(`/operations/meetings/${meetingId}/minutes`);
        } catch {
            return null;
        }
    },

    /**
     * Record new minutes for a meeting
     */
    recordMinutes: async (meetingId: string, data: RecordMinutesRequest): Promise<MeetingMinutes> => {
        return api.post<MeetingMinutes>(`/operations/meetings/${meetingId}/minutes`, data);
    },

    /**
     * Update existing minutes
     */
    updateMinutes: async (meetingId: string, data: Partial<RecordMinutesRequest>): Promise<MeetingMinutes> => {
        return api.patch<MeetingMinutes>(`/operations/meetings/${meetingId}/minutes`, data);
    }
};
