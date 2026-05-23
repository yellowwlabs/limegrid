import { Devvit } from '@devvit/public-api';
import { Dashboard } from './features/prioritizer/ui/Dashboard';
import { PriorityScore } from './shared/types';

Devvit.addMenuItem({
  location: 'post',
  label: 'Limgrid: Quick Review',
  onPress: async (_, context) => {
    context.ui.showForm(reviewForm);
  },
});

Devvit.addCustomPostType({
  name: 'Limgrid Dashboard',
  height: 'tall',
  render: () => {
    // Mock prioritized items
    const mockItems: PriorityScore[] = [
      {
        itemId: 't3_1',
        urgencyScore: 90,
        impactScore: 80,
        difficultyScore: 10,
        tier: 'P1',
        isEdgeCase: false,
        scoredAt: Date.now(),
      },
      {
        itemId: 't3_2',
        urgencyScore: 40,
        impactScore: 60,
        difficultyScore: 20,
        tier: 'P2',
        isEdgeCase: false,
        scoredAt: Date.now(),
      },
    ];

    return <Dashboard items={mockItems} />;
  },
});

const reviewForm = Devvit.createForm(
  {
    fields: [
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
    title: 'Limgrid Quick Review',
  },
  async (_, context) => {
    context.ui.showToast('Moderation action submitted via Limgrid!');
  }
);

export default Devvit;
