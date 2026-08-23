import { describe, it, expect } from 'vitest';

export function normalizeCoordinates(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  stageWidth: number,
  stageHeight: number
): { x: number; y: number } {
  const scaleX = stageWidth / rect.width;
  const scaleY = stageHeight / rect.height;

  const rawX = (clientX - rect.left) * scaleX;
  const rawY = (clientY - rect.top) * scaleY;

  return {
    x: Math.max(0, Math.min(stageWidth, Math.round(rawX * 10) / 10)),
    y: Math.max(0, Math.min(stageHeight, Math.round(rawY * 10) / 10)),
  };
}

describe('Pointer & Touch Coordinate Normalization', () => {
  it('should accurately calculate coordinates on standard 1:1 scale', () => {
    const rect = { left: 100, top: 50, width: 800, height: 600 };
    const pos = normalizeCoordinates(200, 150, rect, 800, 600);
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(100);
  });

  it('should scale appropriately on responsive / high-DPI viewports', () => {
    const rect = { left: 0, top: 0, width: 400, height: 300 }; // 50% viewport width
    const pos = normalizeCoordinates(200, 150, rect, 800, 600); // 800x600 internal canvas
    expect(pos.x).toBe(400);
    expect(pos.y).toBe(300);
  });

  it('should clamp bounds if pointer moves outside canvas boundary', () => {
    const rect = { left: 10, top: 10, width: 800, height: 600 };
    const pos = normalizeCoordinates(-50, 700, rect, 800, 600);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(600);
  });
});
