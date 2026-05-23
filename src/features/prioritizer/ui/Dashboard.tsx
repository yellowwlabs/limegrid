import { Devvit } from '@devvit/public-api';
import { PriorityScore } from '../../../shared/types';
import { PresenceIndicator } from '../../presence/ui/PresenceIndicator';

interface DashboardProps {
  items: PriorityScore[];
}

export const Dashboard: Devvit.BlockComponent<DashboardProps> = (props) => {
  return (
    <vstack padding="medium" gap="medium">
      <hstack alignment="middle">
        <text size="large" weight="bold">
          Limgrid Priority Queue
        </text>
        <spacer />
        <button icon="refresh" size="small">
          Sync
        </button>
      </hstack>

      <vstack gap="small">
        {props.items.length === 0 ? (
          <text color="neutral-content">No items in queue. Great job!</text>
        ) : (
          props.items.map((item) => (
            <hstack
              key={item.itemId}
              padding="small"
              backgroundColor="neutral-background"
              cornerRadius="medium"
              alignment="middle"
              gap="medium"
            >
              <vstack grow>
                <hstack gap="small" alignment="middle">
                  <hstack
                    padding="xsmall"
                    cornerRadius="small"
                    backgroundColor={getTierColor(item.tier)}
                  >
                    <text weight="bold" color="white">
                      {item.tier}
                    </text>
                  </hstack>
                  <text weight="bold">{item.itemId}</text>
                  <spacer size="small" />
                  <PresenceIndicator
                    presence={{ itemId: item.itemId, status: 'available' }}
                  />
                </hstack>
                <text size="small" color="neutral-content">
                  Impact: {item.impactScore} | Urgency: {item.urgencyScore}
                </text>
              </vstack>

              <button size="small" appearance="primary">
                Review
              </button>
            </hstack>
          ))
        )}
      </vstack>
    </vstack>
  );
};

function getTierColor(tier: string): string {
  switch (tier) {
    case 'P1':
      return '#FF4500';
    case 'P2':
      return '#FF8C00';
    case 'P3':
      return '#FFD700';
    default:
      return '#808080';
  }
}
