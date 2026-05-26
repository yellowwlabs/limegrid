import { Devvit, useState, useAsync, JSONObject, JSONArray, Form } from '@devvit/public-api';
import { Dashboard } from './features/prioritizer/ui/Dashboard';
import { PriorityScore } from './shared/types';
import { PriorityEngine } from './features/prioritizer/services/priorityEngine';
import { Post } from '@devvit/public-api';

const LOCKED_POST_KEY_PREFIX = 'limgrid:locked-post:';

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
    context.ui.showForm(reviewForm, { itemId: context.postId ?? '' });
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

Devvit.addTrigger({
  event: 'CommentSubmit',
  async onEvent(event, context) {
    const postId = normalizePostId(event.comment?.postId || event.post?.id || '');
    if (!postId) return;

    const isLimgridLocked = await isPostMarkedLocked(context.kvStore, postId);
    const isRedditLocked = event.post?.isLocked ?? false;
    if (!isLimgridLocked && !isRedditLocked) return;

    const commentId = normalizeCommentId(event.comment?.id || '');
    if (!commentId) return;

    await context.reddit.remove(commentId, false);

    if (event.author?.name && event.subreddit?.name) {
      await context.reddit.addModNote({
        subreddit: event.subreddit.name,
        user: event.author.name,
        redditId: commentId as `t1_${string}`,
        label: 'ABUSE_WARNING',
        note: 'Removed comment submitted after post comments were locked.',
      });
    }
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
            { label: 'Remove + Lock Comments', value: 'remove_lock' },
            { label: 'Warn User', value: 'warn' },
            { label: 'Approve', value: 'approve' },
            { label: 'Lock Comments', value: 'lock_comments' },
            { label: 'Unlock Comments', value: 'unlock_comments' },
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
    const itemId = (rawValues.itemId as string) || context.postId || '';
    const action = (rawValues.action as string[])?.[0] || 'none';
    console.log('Form submitted:', { itemId, action });

    if (!itemId) {
      context.ui.showToast('No post or comment ID found for this action.');
      return;
    }

    try {
      await applyModerationAction(itemId, action, context);
      context.ui.showToast(`Moderation action '${action}' applied to ${itemId}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Moderation action failed:', { itemId, action, error });
      context.ui.showToast(`Action failed: ${message}`);
    }
  }
);

async function applyModerationAction(
  itemId: string,
  action: string,
  context: Devvit.Context
): Promise<void> {
  switch (action) {
    case 'approve':
      await context.reddit.approve(itemId);
      return;
    case 'remove_1':
      await context.reddit.remove(itemId, false);
      return;
    case 'remove_lock':
      await context.reddit.remove(itemId, false);
      await setPostCommentsLocked(itemId, context, true);
      return;
    case 'lock_comments':
      await setPostCommentsLocked(itemId, context, true);
      return;
    case 'unlock_comments':
      await setPostCommentsLocked(itemId, context, false);
      return;
    case 'warn':
      return;
    default:
      throw new Error('Select a moderation action first.');
  }
}

async function setPostCommentsLocked(
  itemId: string,
  context: Devvit.Context,
  locked: boolean
): Promise<void> {
  const postId = await getPostIdForItem(itemId, context);
  const post = await context.reddit.getPostById(postId);

  if (locked) {
    await post.lock();
    await markPostLocked(context.kvStore, postId);
    return;
  }

  await post.unlock();
  await unmarkPostLocked(context.kvStore, postId);
}

async function getPostIdForItem(
  itemId: string,
  context: Devvit.Context
): Promise<string> {
  if (itemId.startsWith('t3_')) {
    return itemId;
  }

  if (itemId.startsWith('t1_')) {
    const comment = await context.reddit.getCommentById(itemId);
    return comment.postId;
  }

  if (/^[a-z0-9]+$/i.test(itemId)) {
    return `t3_${itemId}`;
  }

  throw new Error('Expected a post ID or comment ID.');
}

async function markPostLocked(
  kvStore: Devvit.Context['kvStore'],
  postId: string
): Promise<void> {
  await kvStore.put(`${LOCKED_POST_KEY_PREFIX}${postId}`, true);
}

async function unmarkPostLocked(
  kvStore: Devvit.Context['kvStore'],
  postId: string
): Promise<void> {
  await kvStore.delete(`${LOCKED_POST_KEY_PREFIX}${postId}`);
}

async function isPostMarkedLocked(
  kvStore: Devvit.Context['kvStore'],
  postId: string
): Promise<boolean> {
  return (await kvStore.get<boolean>(`${LOCKED_POST_KEY_PREFIX}${postId}`)) === true;
}

function normalizePostId(id: string): string {
  if (!id) return '';
  if (id.startsWith('t3_')) return id;
  return `t3_${id}`;
}

function normalizeCommentId(id: string): string {
  if (!id) return '';
  if (id.startsWith('t1_')) return id;
  return `t1_${id}`;
}

export default Devvit;
