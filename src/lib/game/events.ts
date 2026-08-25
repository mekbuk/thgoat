import { EventEmitter } from 'events';
import { RealtimeEventPayload } from '@/types/game';

// Global Event Emitter for server-side real-time notifications
const globalEventEmitter = new EventEmitter();
globalEventEmitter.setMaxListeners(500);

export function emitRoomEvent(roomCode: string, event: RealtimeEventPayload | { type: string; payload?: any }) {
  const channel = `room:${roomCode.toUpperCase()}`;
  globalEventEmitter.emit(channel, event);
}

export function subscribeToRoomEvents(
  roomCode: string,
  callback: (event: RealtimeEventPayload | { type: string; payload?: any }) => void
): () => void {
  const channel = `room:${roomCode.toUpperCase()}`;
  globalEventEmitter.on(channel, callback);

  return () => {
    globalEventEmitter.off(channel, callback);
  };
}
