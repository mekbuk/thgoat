import { EventEmitter } from 'events';
import { RealtimeEventPayload } from '@/types/game';

// Global Event Emitter for server-side real-time notifications across all Next.js API routes & dev recompiles
const globalEventEmitter: EventEmitter =
  (globalThis as any).__throatgoat_event_emitter || new EventEmitter();
globalEventEmitter.setMaxListeners(1000);
(globalThis as any).__throatgoat_event_emitter = globalEventEmitter;

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
