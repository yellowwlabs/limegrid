import { Devvit } from '@devvit/public-api';
import { PriorityScore, PriorityTier } from '../../../shared/types';
import { PresenceIndicator } from '../../presence/ui/PresenceIndicator';

interface DashboardProps {
  items: PriorityScore[];
  onReview: (itemId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const Dashboard: Devvit.BlockComponent<DashboardProps> = (props, context) => {
  const { items, onReview, onRefresh, loading } = props;

  return (
    <vstack padding="medium" gap="medium" minHeight="300px">
      {/* Header Section */}
      <hstack alignment="middle">
        <vstack>
          <text size="large" weight="bold">
            Limgrid Priority Queue
          </text>
          <text size="xsmall" color="neutral-content">
            {items.length} items requiring attention
          </text>
        </vstack>
        <spacer />
        <button 
          icon="refresh" 
          size="small" 
          onPress={() => {
            console.log('Sync button pressed');
            onRefresh();
          }}
          disabled={loading}
        >
          {loading ? 'Syncing...' : 'Sync'}
        </button>
      </hstack>

      <hstack height="1px" backgroundColor="neutral-border" />

      {/* List Section */}
      <vstack gap="small">
        {loading ? (
          <vstack alignment="middle center" padding="large">
            <text color="neutral-content">Analyzing mod queue...</text>
          </vstack>
        ) : items.length === 0 ? (
          <vstack alignment="middle center" padding="large" gap="small">
            <icon name="checkmark-fill" size="large" color="green" />
            <text weight="bold">Queue is clean!</text>
            <text size="small" color="neutral-content">Kitteh is pleased.</text>
          </vstack>
        ) : (
          items.map((item) => (
            <vstack
              key={item.itemId}
              padding="medium"
              backgroundColor="neutral-background"
              cornerRadius="medium"
              gap="small"
              border="thin"
            >
              <hstack gap="medium" alignment="top">
                {/* Score Indicator */}
                <vstack 
                  padding="small" 
                  cornerRadius="small" 
                  backgroundColor={getTierColor(item.tier)}
                  width="40px"
                  alignment="middle center"
                >
                  <text weight="bold" color="white" size="small">
                    {item.tier}
                  </text>
                </vstack>

                {/* Content Info */}
                <vstack grow gap="none">
                  <text weight="bold" wrap overflow="ellipsis">
                    {item.metadata?.title || item.itemId}
                  </text>
                  <hstack gap="small" alignment="middle">
                    <text size="xsmall" color="neutral-content">
                      u/{item.metadata?.author || 'unknown'}
                    </text>
                    <text size="xsmall" color="neutral-content">•</text>
                    <text size="xsmall" color="neutral-content">
                      {item.metadata?.score ?? 0} pts
                    </text>
                    <text size="xsmall" color="neutral-content">•</text>
                    <text size="xsmall" color="neutral-content">
                      {item.metadata?.numComments ?? 0} comments
                    </text>
                  </hstack>
                </vstack>
              </hstack>

              <hstack alignment="middle">
                <PresenceIndicator
                  presence={{ itemId: item.itemId, status: 'available' }}
                />
                <spacer />
                <hstack gap="small">
                  <button 
                    size="small" 
                    appearance="secondary" 
                    icon="external"
                    onPress={() => {
                      console.log('View button pressed for', item.itemId);
                      if (item.metadata?.permalink) {
                        context.ui.navigateTo(item.metadata.permalink);
                      }
                    }}
                  >
                    View
                  </button>
                  <button 
                    size="small" 
                    appearance="primary"
                    onPress={() => {
                      console.log('Review button pressed for', item.itemId);
                      onReview(item.itemId);
                    }}
                  >
                    Review
                  </button>
                </hstack>
              </hstack>
            </vstack>
          ))
        )}
      </vstack>
    </vstack>
  );
};

function getTierColor(tier: PriorityTier): string {
  switch (tier) {
    case 'P1':
      return '#FF4500'; // Reddit Orange-Red
    case 'P2':
      return '#FF8C00'; // Dark Orange
    case 'P3':
      return '#FFD700'; // Gold
    case 'P4':
      return '#24A0ED'; // Reddit Blue
    default:
      return '#808080';
  }
}
