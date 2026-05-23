export type PriorityTier = 'P1' | 'P2' | 'P3' | 'P4';

export interface PriorityScore {
  itemId: string;
  urgencyScore: number;
  impactScore: number;
  difficultyScore: number;
  tier: PriorityTier;
  predictedRule?: string;
  isEdgeCase: boolean;
  scoredAt: number;
  metadata?: {
    title: string;
    author: string;
    subreddit: string;
    score: number;
    numComments: number;
    permalink: string;
  };
}

export interface PresenceState {
  itemId: string;
  reviewer?: string;
  status: 'available' | 'reviewing' | 'handled';
  expiresAt?: number;
}

export interface UserModProfile {
  username: string;
  warnings: number;
  removals: number;
  bans: number;
  recentFlags: number;
  riskScore: number;
}

export interface RuleTemplate {
  id: string;
  title: string;
  message: string;
  ruleRef?: string;
}
