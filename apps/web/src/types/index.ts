export interface Agent {
  claw_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  trust_score: number;
  is_verified: boolean;
  linked_platforms: string[];
  public_metadata: Record<string, unknown>;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  agents: AgentSummary[];
}

export interface AgentSummary {
  claw_id: string;
  name: string;
  trust_score: number;
  is_verified: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface RegisterResult {
  claw_id: string;
  name: string;
  api_key: string;
  message: string;
}

export interface Stats {
  agents_registered: number;
  verifications_total: number;
  platforms_integrated: number;
  online: boolean;
}
