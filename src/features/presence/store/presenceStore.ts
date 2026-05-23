import { KVStore } from '@devvit/public-api';
import { PresenceState } from '../../../shared/types';
import { PRESENCE_TTL_MS } from '../../../shared/constants';

export class PresenceStore {
  static async getPresence(
    kv: KVStore,
    itemId: string
  ): Promise<PresenceState> {
    const data = await kv.get<string>(`presence:${itemId}`);
    if (!data) {
      return { itemId, status: 'available' };
    }

    const state = JSON.parse(data) as PresenceState;
    if (state.expiresAt && state.expiresAt < Date.now()) {
      return { itemId, status: 'available' };
    }

    return state;
  }

  static async setReviewing(
    kv: KVStore,
    itemId: string,
    username: string
  ): Promise<PresenceState> {
    const state: PresenceState = {
      itemId,
      reviewer: username,
      status: 'reviewing',
      expiresAt: Date.now() + PRESENCE_TTL_MS,
    };
    await kv.put(`presence:${itemId}`, JSON.stringify(state));
    return state;
  }

  static async setHandled(kv: KVStore, itemId: string): Promise<PresenceState> {
    const state: PresenceState = {
      itemId,
      status: 'handled',
    };
    await kv.put(`presence:${itemId}`, JSON.stringify(state));
    return state;
  }
}
