import { Hono } from 'hono';
import { PriorityEngine, PostMetadata } from '../services/priorityEngine';
import { KVStore } from '@devvit/public-api';

export const priorityApi = new Hono();

priorityApi.post('/score/:itemId', async (c) => {
  const itemId = c.req.param('itemId');
  const metadata = (await c.req.json()) as PostMetadata;
  const score = PriorityEngine.scoreItem(itemId, metadata);

  // Cache in KV
  const kv = (c.env as { kv?: KVStore }).kv;
  if (kv) {
    await kv.put(`priority:${itemId}`, JSON.stringify(score));
  }

  return c.json(score);
});

priorityApi.get('/score/:itemId', async (c) => {
  const itemId = c.req.param('itemId');
  const kv = (c.env as { kv?: KVStore }).kv;
  if (kv) {
    const data = await kv.get<string>(`priority:${itemId}`);
    if (data) return c.json(JSON.parse(data));
  }
  return c.json({ error: 'Not found' }, 404);
});
