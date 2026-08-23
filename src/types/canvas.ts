export type DrawingTool = 'pen' | 'eraser';

export interface DrawingStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  size: number;
  points: number[]; // Flattened coordinate array: [x0, y0, x1, y1, ...]
}

export interface DrawingCanvasConfig {
  width: number;
  height: number;
  backgroundColor: string; // Default: '#FFFFFF' (solid opaque white)
  defaultColor: string;    // Default: '#111827'
  defaultSize: number;     // Default: 6
}

export interface CanvasHistoryState {
  strokes: DrawingStroke[];
  undoStack: DrawingStroke[][];
  redoStack: DrawingStroke[][];
  isDirty: boolean;
}
