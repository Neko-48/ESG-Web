export interface Project {
  project_id: number;
  user_id: number;
  project_name: string;
  industry: string;
  environmental_data: string;
  social_data: string;
  governance_data: string;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  created_at: string;
  updated_at: string;
  evaluation?: ProjectEvaluation;
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
  created_at: string;
}

export interface CreateProjectFormData {
  project_name: string;
  industry: string;
  environmental_data: string;
  social_data: string;
  governance_data: string;
  [key: string]: string; 
}