export interface Project {
  project_id: number;
  project_name: string;
  submitted_at: Date;
  industry: string;
  annual_revenue: number; // New field for annual revenue in million baht
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  description?: string;
  user_id: number;
}

export interface ProjectData {
  data_id: number;
  value: string;
  project_id: number;
  issue_id: number;
}

export interface Evaluation {
  evaluation_id: number;
  // recommendations: string[];
  // strengths: string[];
  // risks: string[];
  overall_score: number;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  project_id: number;
}

export interface KeyIssue {
  issue_id: number;
  name: string;
  pillar: 'E' | 'S' | 'G';
  description: string;
  msci_weight: number;
  standard_id: number;
}

export interface MSCIStandard {
  standard_id: number;
  benchmark: Record<string, any>;
  updated_at: Date;
  version: string;
  criteria: Record<string, any>;
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

export interface VectorEmbedding {
  embedding_id: number;
  chunk_index: number;
  vector: number[]; // Vector array for embeddings
  content: string;
  token_count: number;
  source_type: string;
  metadata: Record<string, any>;
  evaluation_id: number;
  standard_id: number;
}

// Request/Response types
export interface CreateProjectRequest {
  project_name: string;
  industry: string;
  annual_revenue: number; // New field for annual revenue
  description?: string;
  project_data: Array<{
    issue_id: number;
    value: string;
  }>;
}

export interface ProjectWithEvaluation extends Project {
  evaluation?: EvaluationWithScores;
  project_data?: ProjectData[];
}

export interface EvaluationWithScores extends Evaluation {
  pillar_scores: PillarScore[];
}