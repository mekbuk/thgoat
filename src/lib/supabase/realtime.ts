import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { RealtimeEventPayload } from '@/types/game';

const activeChannels = new Map<string, RealtimeChannel>();

export function createRoomChannel(
  roomCode: string,
  onEvent: (event: RealtimeEventPayload) => void
): RealtimeChannel {
  const code = roomCode.toUpperCase();
  const channelName = `room:${code}`;
  const supabase = getSupabaseBrowserClient();

  // If there's an existing channel for this room, clean it up first
  if (activeChannels.has(code)) {
    try {
      const existingChannel = activeChannels.get(code);
      if (existingChannel) {
        existingChannel.unsubscribe();
        supabase.removeChannel(existingChannel);
      }
    } catch {}
    activeChannels.delete(code);
  }

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

  activeChannels.set(code, channel);
  return channel;
}

export async function broadcastRoomEvent(
  roomCode: string,
  event: RealtimeEventPayload
): Promise<void> {
  const code = roomCode.toUpperCase();
  const supabase = getSupabaseBrowserClient();
  const channelName = `room:${code}`;

  let channel = activeChannels.get(code);
  if (!channel) {
    channel = supabase.channel(channelName, {
      config: { broadcast: { self: true } },
    });
    channel.subscribe();
    activeChannels.set(code, channel);
  }

  try {
    await channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: event,
    });
  } catch (err) {
    console.warn('Failed to broadcast room event via Supabase:', err);
  }
}

export function cleanupRoomChannel(roomCode: string) {
  const code = roomCode.toUpperCase();
  const channel = activeChannels.get(code);
  if (channel) {
    try {
      const supabase = getSupabaseBrowserClient();
      channel.unsubscribe();
      supabase.removeChannel(channel);
    } catch {}
    activeChannels.delete(code);
  }
}
