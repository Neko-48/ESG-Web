export interface Project {
  project_id: number;
  project_name: string;
  submitted_at: string;
  industry: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  description?: string;
  user_id: number;
  evaluation?: ProjectEvaluation;
  project_data?: ProjectData[];
}

export interface ProjectData {
  data_id: number;
  value: string;
  project_id: number;
  issue_id: number;
  issue_name?: string;
  pillar?: 'E' | 'S' | 'G';
}

export interface ProjectEvaluation {
  evaluation_id: number;
  recommendations: string[];
  strengths: string[];
  risks: string[];
  overall_score: number;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  project_id: number;
  pillar_scores?: PillarScore[];
}

export interface PillarScore {
  score_id: number;
  pillar_type: 'E' | 'S' | 'G';
  score: number;
  weight: number;
  pass_status: boolean;
  key_count: number;
  total_weight: number;
  weighted_sum: number;
  evaluation_id: number;
  standard_id: number;
}

export interface KeyIssue {
  issue_id: number;
  name: string;
  pillar: 'E' | 'S' | 'G';
  description: string;
  msci_weight: number;
  standard_id: number;
  criteria?: Record<string, unknown>;
  benchmark?: Record<string, unknown>;
}

export interface CreateProjectFormData {
  project_name: string;
  industry: string;
  description?: string;
  project_data: Array<{
    issue_id: number;
    value: string;
  }>;
}

// For backward compatibility with existing components
export interface ProjectWithEvaluation extends Project {
  // Legacy fields mapped to new structure
  name: string; // Maps to project_name
  created_at: string; // Maps to submitted_at
}