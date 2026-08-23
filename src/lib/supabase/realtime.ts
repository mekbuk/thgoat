import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { RealtimeEventPayload } from '@/types/game';

export function createRoomChannel(
  roomCode: string,
  onEvent: (event: RealtimeEventPayload) => void
): RealtimeChannel {
  const supabase = getSupabaseBrowserClient();
  const channelName = `room:${roomCode.toUpperCase()}`;

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: true },
    },
  });

  channel.on('broadcast', { event: 'game_event' }, (payload: { payload: RealtimeEventPayload }) => {
    if (payload?.payload) {
      onEvent(payload.payload);
    }
  });

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`🔌 Connected to Realtime channel: ${channelName}`);
    }
  });

  return channel;
}

export async function broadcastRoomEvent(
  roomCode: string,
  event: RealtimeEventPayload
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const channelName = `room:${roomCode.toUpperCase()}`;
  const channel = supabase.channel(channelName);

  await channel.send({
    type: 'broadcast',
    event: 'game_event',
    payload: event,
  });
}
