import { Hono } from 'hono';
import { PresenceStore } from '../store/presenceStore';
import { KVStore } from '@devvit/public-api';

export const presenceApi = new Hono();

presenceApi.get('/:itemId', async (c) => {
  const itemId = c.req.param('itemId');
  const kv = (c.env as { kv: KVStore }).kv; // Assuming kv is injected in env
  const state = await PresenceStore.getPresence(kv, itemId);
  return c.json(state);
});

presenceApi.post('/:itemId/review', async (c) => {
  const itemId = c.req.param('itemId');
  const { username } = await c.req.json();
  const kv = (c.env as { kv: KVStore }).kv;
  const state = await PresenceStore.setReviewing(kv, itemId, username);
  return c.json(state);
});

presenceApi.post('/:itemId/handled', async (c) => {
  const itemId = c.req.param('itemId');
  const kv = (c.env as { kv: KVStore }).kv;
  const state = await PresenceStore.setHandled(kv, itemId);
  return c.json(state);
});
