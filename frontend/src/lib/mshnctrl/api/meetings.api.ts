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
    }
};
