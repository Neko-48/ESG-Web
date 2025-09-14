export interface Project {
  project_id: number;
  project_name: string;
  submitted_at: string;
  industry: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING_EVALUATION';
  description?: string;
  user_id: number;
  annual_revenue?: number;
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
  recommendations?: string[];
  strengths?: string[];
  risks?: string[];
  overall_score: number;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'PENDING_RAG';
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
  description?: string;
  msci_weight: number;
  standard_id: number;
  criteria_key?: string;
  input_type?: 'dropdown' | 'numeric' | 'text';
  dropdown_options?: string[];
  criteria?: Record<string, unknown>;
  benchmark?: Record<string, unknown>;
}

// Updated interface for creating new projects
export interface CreateProjectFormData {
  project_name: string;
  industry: string;
  description?: string;
  annual_revenue?: number;
  project_data: Array<{
    issue_id: number;
    value: string;
  }>;
}

// Interface for backend API request
export interface CreateProjectRequest {
  project_name: string;
  industry: string;
  description?: string;
  annual_revenue?: number;
  project_data: Array<{
    issue_id: number;
    value: string;
  }>;
}

// For backward compatibility with existing components
export interface ProjectWithEvaluation extends Project {
  // Legacy fields mapped to new structure
  name?: string; // Maps to project_name
  created_at?: string; // Maps to submitted_at
}

// Interface for evaluation results
export interface Evaluation {
  evaluation_id: number;
  recommendations?: string[];
  strengths?: string[];
  risks?: string[];
  overall_score: number;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'PENDING_RAG';
  project_id: number;
  pillar_scores?: PillarScore[];
}

// Interface for MSCI standards
export interface MSCIStandard {
  standard_id: number;
  benchmark: Record<string, unknown>;
  updated_at: string;
  version: string;
  criteria: Record<string, unknown>;
}

// Interface for vector embeddings (for RAG system)
export interface VectorEmbedding {
  embedding_id: number;
  chunk_index: number;
  vector: number[]; // VECTOR(768) from database
  content: string;
  token_count: number;
  source_type: string;
  metadata?: Record<string, unknown>;
  evaluation_id?: number;
  standard_id?: number;
}

// Interface for revenue display
export interface RevenueInfo {
  amount: number;
  currency: string;
  formatted: string;
}

// Helper function to format revenue
export const formatRevenue = (amount?: number): string => {
  if (!amount || amount === 0) return 'ไม่ระบุ';
  
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  
  return `${amount.toLocaleString()}`;
};

// Interface for ESG scoring
export interface ESGScoring {
  pillar: 'E' | 'S' | 'G';
  score: number;
  weight: number;
  pass_threshold: number;
  key_issues: Array<{
    issue_id: number;
    name: string;
    weight: number;
    score: number;
    value: string;
  }>;
}

// Interface for project statistics
export interface ProjectStats {
  total_projects: number;
  pending_projects: number;
  completed_projects: number;
  passed_projects: number;
  failed_projects: number;
  average_score: number;
}

// Interface for dashboard data
export interface DashboardData {
  recent_projects: Project[];
  project_stats: ProjectStats;
  pillar_averages: {
    environmental: number;
    social: number;
    governance: number;
  };
}