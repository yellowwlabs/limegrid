import { Devvit } from '@devvit/public-api';
import { UserModProfile, PresenceState } from '../../../shared/types';
import { PresenceIndicator } from '../../presence/ui/PresenceIndicator';

interface ContextModalProps {
  user: UserModProfile;
  presence: PresenceState;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export const ContextModal: Devvit.BlockComponent<ContextModalProps> = (props) => {
  return (
    <vstack padding="medium" gap="medium">
      <hstack alignment="middle">
        <text size="large" weight="bold">Smart Context Panel: u/{props.user.username}</text>
        <spacer />
        <hstack padding="xsmall" cornerRadius="small" backgroundColor={getRiskColor(props.riskLevel)}>
          <text weight="bold" color="white">{props.riskLevel} Risk</text>
        </hstack>
      </hstack>

      <PresenceIndicator presence={props.presence} />

      <vstack gap="small">
        <text weight="bold">Moderation History</text>
        <hstack gap="medium">
          <vstack alignment="center">
            <text size="large">{props.user.removals.toString()}</text>
            <text size="xsmall" color="neutral-content">Removals</text>
          </vstack>
          <vstack alignment="center">
            <text size="large">{props.user.warnings.toString()}</text>
            <text size="xsmall" color="neutral-content">Warnings</text>
          </vstack>
          <vstack alignment="center">
            <text size="large">{props.user.bans.toString()}</text>
            <text size="xsmall" color="neutral-content">Bans</text>
          </vstack>
        </hstack>
      </vstack>

      <vstack gap="small">
        <text weight="bold">Quick Actions</text>
        <hstack gap="small">
          <button appearance="secondary" icon="message">Warn</button>
          <button appearance="destructive" icon="delete">Remove</button>
          <button appearance="destructive" icon="ban">Ban</button>
        </hstack>
      </vstack>
    </vstack>
  );
};

function getRiskColor(level: string): string {
  switch (level) {
    case 'Critical': return '#FF4500';
    case 'High': return '#FF8C00';
    case 'Medium': return '#FFD700';
    default: return '#008000';
  }
}
