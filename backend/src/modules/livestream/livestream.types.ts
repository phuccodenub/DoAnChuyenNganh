export interface CreateLiveSessionDto {
  course_id: string;
  instructor_id: string;
  title: string;
  description?: string;
  scheduled_at: string | Date;
  duration_minutes?: number;
  meeting_url?: string;
}

export interface UpdateLiveSessionStatusDto {
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recording_url?: string;
  started_at?: string | Date;
  ended_at?: string | Date;
}



















