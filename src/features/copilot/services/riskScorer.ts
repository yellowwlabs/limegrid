import { UserModProfile } from '../../../shared/types';
import { RISK_THRESHOLDS } from '../../../shared/constants';

export class RiskScorer {
  static calculateScore(profile: UserModProfile): number {
    let score = 0;

    // Heuristics
    score += profile.removals * 10;
    score += profile.warnings * 5;
    score += profile.bans * 25;
    score += profile.recentFlags * 2;

    // Normalize to 0-100
    return Math.min(100, score);
  }

  static getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score < RISK_THRESHOLDS.LOW) return 'Low';
    if (score < RISK_THRESHOLDS.MEDIUM) return 'Medium';
    if (score < RISK_THRESHOLDS.HIGH) return 'High';
    return 'Critical';
  }
}
