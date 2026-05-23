import { Devvit, useState, useAsync, JSONObject, JSONArray, Form } from '@devvit/public-api';
import { Dashboard } from './features/prioritizer/ui/Dashboard';
import { PriorityScore } from './shared/types';
import { PriorityEngine } from './features/prioritizer/services/priorityEngine';
import { Post } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  kvStore: true,
});

interface DashboardData extends JSONObject {
  items: JSONArray;
}

// Menu Item for standard Moderation
Devvit.addMenuItem({
  location: 'post',
  label: 'Limgrid: Quick Review',
  onPress: async (_, context) => {
    context.ui.showForm(reviewForm);
  },
});

// Manual Dashboard Creation
Devvit.addMenuItem({
  location: 'post',
  label: 'Limgrid: Create Dashboard Here',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Limgrid Dashboard',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading Limgrid Dashboard...</text>
        </vstack>
      ),
    });
    ui.showToast('Limgrid Dashboard post created!');
  },
});

// The Custom Post Type Implementation
Devvit.addCustomPostType({
  name: 'Limgrid Dashboard',
  height: 'tall',
  render: (context) => {
    const { reddit } = context;
    const [refreshCount, setRefreshCount] = useState(0);

    // Fetch and Score real modqueue items
    const { data, loading, error } = useAsync(async () => {
      console.log('Fetching modqueue, refreshCount:', refreshCount);
      const subreddit = await reddit.getCurrentSubreddit();
      const modqueue = await reddit.getModQueue({
        subreddit: subreddit.name,
        limit: 10,
        type: 'post', 
      }).all() as Post[];

      const scoredItems: PriorityScore[] = modqueue.map((post) => {
        const rawPost = post as unknown as Record<string, unknown>;
        const numComments = typeof rawPost.numComments === 'number' ? rawPost.numComments : 0;
        const reports = rawPost.reports as [string, number][] | undefined;
        const firstReport = reports?.[0]?.[0] || '';

        const score = PriorityEngine.scoreItem(post.id, {
          title: post.title,
          body: post.body || '',
          upvotes: post.score,
          commentCount: numComments,
          timeLiveHours: (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60),
          reportReason: firstReport,
        });

        return {
          ...score,
          metadata: {
            title: post.title,
            author: post.authorName,
            subreddit: post.subredditName,
            score: post.score,
            numComments: numComments,
            permalink: post.permalink,
          }
        };
      });

      const sorted = scoredItems.sort((a, b) => {
        const tiers = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4 };
        return tiers[a.tier] - tiers[b.tier];
      });

      return { items: sorted as unknown as JSONArray };
    }, {
      depends: refreshCount
    });

    const items = ((data as unknown as DashboardData | null)?.items || []) as unknown as PriorityScore[];

    if (error) {
      return (
        <vstack padding="large" alignment="middle center">
          <text color="red">Failed to load mod queue: {error.message}</text>
          <button onPress={() => {
            console.log('Retry button pressed');
            setRefreshCount(c => c + 1);
          }}>Retry</button>
        </vstack>
      );
    }

    return (
      <Dashboard 
        items={items} 
        loading={loading} 
        onRefresh={() => {
          console.log('onRefresh triggered');
          setRefreshCount(c => c + 1);
        }}
        onReview={(itemId) => {
          console.log('onReview triggered for', itemId);
          context.ui.showToast(`Reviewing ${itemId}...`);
          context.ui.showForm(reviewForm, { itemId });
        }}
      />
    );
  },
});

// Global Review Form
const reviewForm = Devvit.createForm(
  (data) => {
    const itemId = (data as JSONObject)?.itemId as string | undefined;
    console.log('Creating review form for itemId:', itemId);
    return {
      fields: [
        {
          name: 'itemId',
          label: 'Item ID',
          type: 'string',
          defaultValue: itemId || '',
        },
        {
          name: 'action',
          label: 'Select Action',
          type: 'select',
          options: [
            { label: 'Remove (Rule 1)', value: 'remove_1' },
            { label: 'Warn User', value: 'warn' },
            { label: 'Approve', value: 'approve' },
          ],
        },
        {
          name: 'note',
          label: 'Internal Mod Note',
          type: 'string',
        },
      ],
      title: `Limgrid Quick Review: ${itemId || 'Item'}`,
    } as const satisfies Form;
  },
  async (values, context) => {
    const rawValues = values as Record<string, unknown>;
    const itemId = (rawValues.itemId as string) || 'unknown';
    const action = (rawValues.action as string[])?.[0] || 'none';
    console.log('Form submitted:', { itemId, action });
    context.ui.showToast(`Moderation action '${action}' applied to ${itemId}!`);
  }
);

export default Devvit;
