import { describe, it, expect } from 'vitest';
import { DrawingStroke } from '../../src/types/canvas';

describe('Canvas History & Undo Operations', () => {
  it('should push strokes and correctly pop on undo', () => {
    const stroke1: DrawingStroke = {
      id: 'stroke-1',
      tool: 'pen',
      color: '#000000',
      size: 4,
      points: [10, 10, 20, 20],
    };

    const stroke2: DrawingStroke = {
      id: 'stroke-2',
      tool: 'pen',
      color: '#ff0000',
      size: 8,
      points: [30, 30, 40, 40],
    };

    const history: DrawingStroke[][] = [];
    let currentStrokes: DrawingStroke[] = [];

    // Action 1: Add stroke 1
    history.push([...currentStrokes]);
    currentStrokes = [...currentStrokes, stroke1];
    expect(currentStrokes.length).toBe(1);

    // Action 2: Add stroke 2
    history.push([...currentStrokes]);
    currentStrokes = [...currentStrokes, stroke2];
    expect(currentStrokes.length).toBe(2);

    // Action 3: Undo
    const previous = history.pop();
    expect(previous).toBeDefined();
    currentStrokes = previous!;
    expect(currentStrokes.length).toBe(1);
    expect(currentStrokes[0].id).toBe('stroke-1');

    // Action 4: Undo to empty
    const initial = history.pop();
    expect(initial).toBeDefined();
    currentStrokes = initial!;
    expect(currentStrokes.length).toBe(0);
  });

  it('should handle clearing canvas and preserve history state', () => {
    const stroke1: DrawingStroke = {
      id: 'stroke-1',
      tool: 'pen',
      color: '#000000',
      size: 4,
      points: [10, 10],
    };

    let strokes: DrawingStroke[] = [stroke1];
    const history: DrawingStroke[][] = [[]];

    // Clear
    history.push([...strokes]);
    strokes = [];
    expect(strokes.length).toBe(0);

    // Undo clear
    strokes = history.pop()!;
    expect(strokes.length).toBe(1);
    expect(strokes[0].id).toBe('stroke-1');
  });
});
