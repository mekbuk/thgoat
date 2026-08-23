import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '@/lib/services/game-service';

describe('Room Lifecycle & Lobby Integration', () => {
  beforeEach(() => {
    GameService._resetMemoryStore();
  });

  it('creates a room and sets creator as host', async () => {
    const room = await GameService.createRoom('HostCat');
    expect(room.room_code).toHaveLength(4);
    expect(room.phase).toBe('LOBBY');
    expect(room.player_id).toBeDefined();
    expect(room.session_token).toBeDefined();

    const state = await GameService.getRoomState(room.room_code, room.session_token);
    expect(state.players).toHaveLength(1);
    expect(state.players[0].nickname).toBe('HostCat');
    expect(state.players[0].is_host).toBe(true);
    expect(state.me?.is_host).toBe(true);
  });

  it('allows players to join an open lobby', async () => {
    const hostRoom = await GameService.createRoom('HostCat');
    const player2 = await GameService.joinRoom(hostRoom.room_code, 'PlayerTwo');
    const player3 = await GameService.joinRoom(hostRoom.room_code, 'PlayerThree');

    const state = await GameService.getRoomState(hostRoom.room_code, player2.session_token);
    expect(state.players).toHaveLength(3);
    expect(state.me?.nickname).toBe('PlayerTwo');
    expect(state.me?.is_host).toBe(false);
  });

  it('rejects joining a non-existent room', async () => {
    await expect(GameService.joinRoom('ZZZZ', 'PlayerGhost')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('rejects host starting with fewer than 3 players', async () => {
    const hostRoom = await GameService.createRoom('HostCat');
    await GameService.joinRoom(hostRoom.room_code, 'PlayerTwo');

    await expect(
      GameService.startGame(hostRoom.room_code, hostRoom.session_token)
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('allows host to start when 3 or more players are present', async () => {
    const hostRoom = await GameService.createRoom('HostCat');
    await GameService.joinRoom(hostRoom.room_code, 'PlayerTwo');
    await GameService.joinRoom(hostRoom.room_code, 'PlayerThree');

    const startResult = await GameService.startGame(hostRoom.room_code, hostRoom.session_token);
    expect(startResult.phase).toBe('SUBMITTING');
    expect(startResult.stage_number).toBe(1);
    expect(startResult.picture_url).toBeDefined();

    const state = await GameService.getRoomState(hostRoom.room_code, hostRoom.session_token);
    expect(state.phase).toBe('SUBMITTING');
    expect(state.current_stage_number).toBe(1);
  });

  it('rejects non-host player from starting the game', async () => {
    const hostRoom = await GameService.createRoom('HostCat');
    const player2 = await GameService.joinRoom(hostRoom.room_code, 'PlayerTwo');
    await GameService.joinRoom(hostRoom.room_code, 'PlayerThree');

    await expect(
      GameService.startGame(hostRoom.room_code, player2.session_token)
    ).rejects.toMatchObject({
      status: 403,
    });
  });

  it('rejects joining a room after game has started', async () => {
    const hostRoom = await GameService.createRoom('HostCat');
    await GameService.joinRoom(hostRoom.room_code, 'PlayerTwo');
    await GameService.joinRoom(hostRoom.room_code, 'PlayerThree');
    await GameService.startGame(hostRoom.room_code, hostRoom.session_token);

    await expect(
      GameService.joinRoom(hostRoom.room_code, 'LatePlayer')
    ).rejects.toMatchObject({
      status: 409,
    });
  });
});
