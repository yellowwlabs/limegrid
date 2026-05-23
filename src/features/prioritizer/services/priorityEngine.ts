import { PriorityScore, PriorityTier } from '../../../shared/types';
import { IMPACT_WEIGHTS } from '../../../shared/constants';

export interface PostMetadata {
  title: string;
  body?: string;
  upvotes: number;
  commentCount: number;
  timeLiveHours: number;
  reportReason?: string;
}

export class PriorityEngine {
  static scoreItem(itemId: string, metadata: PostMetadata): PriorityScore {
    const urgency = this.calculateUrgency(metadata);
    const impact = this.calculateImpact(metadata);
    const difficulty = this.calculateDifficulty(metadata);

    const totalScore = urgency * 0.4 + impact * 0.4 + difficulty * 0.2;
    const tier = this.assignTier(totalScore, urgency, impact);

    return {
      itemId,
      urgencyScore: urgency,
      impactScore: impact,
      difficultyScore: difficulty,
      tier,
      isEdgeCase: difficulty > 80,
      scoredAt: Date.now(),
    };
  }

  private static calculateUrgency(metadata: PostMetadata): number {
    let score = 0;
    const criticalKeywords = [
      'harassment',
      'threat',
      'dox',
      'hate',
      'suicide',
      'self-harm',
      'violence',
    ];
    const urgentKeywords = ['spam', 'scam', 'porn', 'nsfw', 'illegal', 'raid'];

    const text =
      `${metadata.title} ${metadata.body || ''} ${metadata.reportReason || ''}`.toLowerCase();

    for (const word of criticalKeywords) {
      if (text.includes(word)) score += 40;
    }
    for (const word of urgentKeywords) {
      if (text.includes(word)) score += 15;
    }

    // Boost score if multiple reports
    if (metadata.reportReason && metadata.reportReason.length > 1) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private static calculateImpact(metadata: PostMetadata): number {
    // Impact = Reach * Velocity
    const reachScore =
      metadata.upvotes / IMPACT_WEIGHTS.UPVOTE +
      metadata.commentCount / IMPACT_WEIGHTS.COMMENT;
    let velocityScore = 1;

    if (metadata.timeLiveHours < 1) velocityScore = 2.0;
    else if (metadata.timeLiveHours < 4) velocityScore = 1.5;
    else if (metadata.timeLiveHours > 24) velocityScore = 0.5;

    let score = reachScore * velocityScore * 10;

    // High visibility boost
    if (metadata.upvotes > 500) score += 30;

    return Math.min(100, score);
  }

  private static calculateDifficulty(metadata: PostMetadata): number {
    // Difficulty score based on report ambiguity or lack of clear signals
    let score = 50;
    if (metadata.reportReason === 'spam') score -= 20;
    return Math.min(100, score);
  }

  private static assignTier(
    score: number,
    urgency: number,
    impact: number
  ): PriorityTier {
    if (urgency > 80 || (impact > 80 && urgency > 40)) return 'P1';
    if (score > 60) return 'P2';
    if (score > 30) return 'P3';
    return 'P4';
  }
}
