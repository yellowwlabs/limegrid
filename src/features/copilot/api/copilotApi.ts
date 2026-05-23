import { Hono } from 'hono';
import { RiskScorer } from '../services/riskScorer';
import { UserModProfile } from '../../../shared/types';

export const copilotApi = new Hono();

copilotApi.get('/user/:username', async (c) => {
  const username = c.req.param('username');
  
  // In a real app, we would fetch this from Reddit API via context.reddit
  // For the MVP, we simulate it with some deterministic data
  const profile: UserModProfile = {
    username,
    removals: Math.floor(Math.random() * 5),
    warnings: Math.floor(Math.random() * 3),
    bans: Math.floor(Math.random() * 1),
    recentFlags: Math.floor(Math.random() * 10),
    riskScore: 0,
  };
  
  profile.riskScore = RiskScorer.calculateScore(profile);
  const riskLevel = RiskScorer.getRiskLevel(profile.riskScore);
  
  return c.json({
    profile,
    riskLevel,
  });
});
