export interface User {
    id: number;
    email: string;
}

export interface Lead {
    id: number;
    user_id: number;
    name: string;
    email: string;
    company: string | null;
    last_contacted_date: string | null;
    last_message: string | null;
    status: 'active' | 'needs_followup' | 'stalled';
    contact_type: 'client' | 'recruiter' | 'hr';
    resume_link?: string | null;
    tech_stack?: string | null;
    source_url?: string | null;
    phone?: string | null;
    sequence_id?: number | null;
    current_step_number: number;
    created_at: string;
    updated_at: string;
}

export interface SequenceStep {
    id: number;
    sequence_id: number;
    step_number: number;
    wait_days: number;
    action_type: 'email' | 'whatsapp';
    template_name?: string | null;
}

export interface Sequence {
    id: number;
    name: string;
    description?: string | null;
    steps: SequenceStep[];
    created_at: string;
}

export interface LeadCreate {
    name: string;
    email: string;
    company?: string;
    last_contacted_date?: string;
    last_message?: string;
    contact_type?: 'client' | 'recruiter' | 'hr';
    resume_link?: string;
    tech_stack?: string;
    source_url?: string;
    phone?: string;
}

export interface AgentRunResult {
    success: boolean;
    leads_processed: number;
    emails_sent: number;
    activities: Array<{
        lead_id: number;
        action_type: string;
        details: Record<string, any>;
    }>;
    message: string;
}

export interface ActivityLog {
    id: number;
    user_id: number;
    lead_id: number | null;
    action_type: string;
    details: Record<string, any> | null;
    created_at: string;
}

export interface DashboardStats {
    total_leads: number;
    active: number;
    needs_followup: number;
    stalled: number;
    emails_sent_today: number;
    career_leads: number;
    freelance_leads: number;
}
