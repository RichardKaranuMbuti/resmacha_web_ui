// src/types/jobMatch.ts
export interface JobMatch {
  job_id: string;
  match_score: number;
  should_apply: boolean;
  score_justification: string;
  judgment_justification: string;
  missing_keywords: string[];
  improvement_tips: string[];
  date_processed: string;
  job_details: {
    job_id: string;
    job_title: string;
    company_name: string;
    location: string;
    job_url: string;
    seniority_level: string;
    employment_type: string;
    job_function: string;
    industries: string;
    applicants: string;
    date_posted: string;
    date_scraped: string;
    is_analysed: boolean;
  };
}

export interface MatchResponse {
  user_id: string;
  total_jobs_analyzed: number;
  total_jobs_queued: number;
  status: string;
  message: string;
  analyzed_jobs: JobMatch[];
}

export interface MatchingStats {
  total_analyzed: number;
  total_queued: number;
}