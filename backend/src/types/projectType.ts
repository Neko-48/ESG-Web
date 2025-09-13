export interface Project {
  project_id: number;
  user_id: number;
  project_name: string;
  industry: string;
  environmental_data: string;
  social_data: string;
  governance_data: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectRequest {
  project_name: string;
  industry: string;
  environmental_data: string;
  social_data: string;
  governance_data: string;
}

export interface ProjectEvaluation {
  evaluation_id: number;
  project_id: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  overall_score: number;
  pass_fail: 'PASS' | 'FAIL';
  recommendations: string;
  strengths: string;
  risks: string;
  created_at: Date;
}

export interface ProjectWithEvaluation extends Project {
  evaluation?: ProjectEvaluation;
}