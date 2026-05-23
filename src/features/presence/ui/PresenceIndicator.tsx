import { Devvit } from '@devvit/public-api';
import { PresenceState } from '../../../shared/types';

interface PresenceIndicatorProps {
  presence: PresenceState;
}

export const PresenceIndicator: Devvit.BlockComponent<
  PresenceIndicatorProps
> = (props) => {
  const { status, reviewer } = props.presence;

  if (status === 'available') {
    return (
      <hstack alignment="middle" gap="small">
        <icon name="unlock" size="small" color="green" />
        <text size="xsmall" color="green">
          Available for review
        </text>
      </hstack>
    );
  }

  if (status === 'reviewing') {
    return (
      <hstack
        alignment="middle"
        gap="small"
        padding="xsmall"
        backgroundColor="#FFF4E5"
        cornerRadius="small"
      >
        <icon name="user" size="small" color="#FF8C00" />
        <text size="xsmall" color="#FF8C00" weight="bold">
          {reviewer || 'Someone'} is reviewing this
        </text>
      </hstack>
    );
  }

  if (status === 'handled') {
    return (
      <hstack alignment="middle" gap="small">
        <icon name="checkmark-fill" size="small" color="neutral-content" />
        <text size="xsmall" color="neutral-content">
          Already handled
        </text>
      </hstack>
    );
  }

  return null;
};
