const ROOM_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 4;

/**
 * Generates an unguessable 4-character uppercase room code.
 * Excludes confusing characters like I, O, 1, and 0.
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARSET.length);
    code += ROOM_CODE_CHARSET[randomIndex];
  }
  return code;
}

/**
 * Validates whether a room code is 4 valid characters.
 */
export function isValidRoomCode(code: string): boolean {
  if (typeof code !== 'string' || code.length !== ROOM_CODE_LENGTH) {
    return false;
  }
  const clean = code.toUpperCase();
  for (const char of clean) {
    if (!ROOM_CODE_CHARSET.includes(char)) {
      return false;
    }
  }
  return true;
}
