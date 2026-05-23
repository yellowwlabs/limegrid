import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { presenceApi } from './features/presence/api/presenceApi';
import { priorityApi } from './features/prioritizer/api/priorityApi';
import { copilotApi } from './features/copilot/api/copilotApi';

const app = new Hono();

// Middleware to inject KV and other Devvit tools into Hono context
app.use('*', async (c, next) => {
  // @ts-expect-error - devvit context is injected by createServer
  c.env = c.req.raw.context;
  await next();
});

app.route('/api/presence', presenceApi);
app.route('/api/priority', priorityApi);
app.route('/api/copilot', copilotApi);

app.get('/', (c) => c.text('Limgrid API is live!'));

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
