export type ApplicationStatus =
  | 'Watching'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Ghosted'
  | 'Closed'
  | 'Custom';

export type UpdateType =
  | 'note'
  | 'status_change'
  | 'follow_up'
  | 'rejection'
  | 'interview_note'
  | 'offer_note';

export type WorkType =
  | 'Full Time'
  | 'Part Time'
  | 'Contract'
  | 'Remote'
  | 'Hybrid'
  | 'On-site';

export type InterviewRoundType =
  | 'Phone Screen'
  | 'Technical'
  | 'Take-home'
  | 'Panel'
  | 'Culture Fit'
  | 'Final'
  | 'Offer Call'
  | 'Other';

export type DocumentType = 'Resume' | 'Cover Letter' | 'Portfolio' | 'Other';

export interface Application {
  id: string;
  user_id: string;
  role: string;
  company: string;
  status: ApplicationStatus;
  custom_status?: string;
  date_applied?: string;
  location?: string;
  work_type?: WorkType;
  job_url?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // joined relations
  interview_rounds?: InterviewRound[];
  contacts?: Contact[];
  documents?: Document[];
  reminders?: Reminder[];
}

export interface InterviewRound {
  id: string;
  application_id: string;
  user_id: string;
  round_number: number;
  round_type: InterviewRoundType;
  scheduled_at?: string;
  notes?: string;
  outcome?: 'Passed' | 'Failed' | 'Pending' | 'Cancelled';
  created_at: string;
}

export interface Contact {
  id: string;
  application_id: string;
  user_id: string;
  name: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  notes?: string;
  created_at: string;
}

export interface Document {
  id: string;
  application_id: string;
  user_id: string;
  doc_type: DocumentType;
  label: string;
  file_url?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  application_id: string;
  user_id: string;
  message: string;
  remind_at: string;
  done: boolean;
  created_at: string;
}

export interface ApplicationUpdate {
  id: string;
  application_id: string;
  user_id: string;
  type: UpdateType;
  message: string;
  metadata: Record<string, string>;
  created_at: string;
}

export interface ApplicationStats {
  total: number;
  by_status: Record<ApplicationStatus, number>;
  response_rate: number;
  offer_rate: number;
}
