import { GamePhase, StagePhase } from '@/types/game';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;
export const TOTAL_STAGES = 3;

export interface StateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if the room can transition to the given next phase.
 */
export function validatePhaseTransition(
  currentPhase: GamePhase,
  nextPhase: GamePhase,
  context?: {
    playerCount?: number;
    currentStageNumber?: number;
    allSubmitted?: boolean;
    allVoted?: boolean;
  }
): StateValidationResult {
  switch (currentPhase) {
    case 'LOBBY':
      if (nextPhase !== 'SUBMITTING') {
        return { isValid: false, error: `Cannot transition from LOBBY to ${nextPhase}` };
      }
      if (context?.playerCount !== undefined && context.playerCount < MIN_PLAYERS) {
        return { isValid: false, error: `Need at least ${MIN_PLAYERS} players to start the game` };
      }
      if (context?.playerCount !== undefined && context.playerCount > MAX_PLAYERS) {
        return { isValid: false, error: `Room capacity exceeded (max ${MAX_PLAYERS} players)` };
      }
      return { isValid: true };

    case 'SUBMITTING':
      if (nextPhase !== 'VOTING') {
        return { isValid: false, error: `Cannot transition from SUBMITTING to ${nextPhase}` };
      }
      if (context?.allSubmitted !== undefined && !context.allSubmitted) {
        return { isValid: false, error: 'Cannot start voting until all players have submitted' };
      }
      return { isValid: true };

    case 'VOTING':
      if (nextPhase !== 'RESULTS') {
        return { isValid: false, error: `Cannot transition from VOTING to ${nextPhase}` };
      }
      if (context?.allVoted !== undefined && !context.allVoted) {
        return { isValid: false, error: 'Cannot show results until all eligible votes are cast' };
      }
      return { isValid: true };

    case 'RESULTS':
      if (nextPhase === 'SUBMITTING') {
        if (context?.currentStageNumber !== undefined && context.currentStageNumber >= TOTAL_STAGES) {
          return { isValid: false, error: 'All stages already completed. Must transition to FINISHED' };
        }
        return { isValid: true };
      }
      if (nextPhase === 'FINISHED') {
        if (context?.currentStageNumber !== undefined && context.currentStageNumber < TOTAL_STAGES) {
          return { isValid: false, error: 'Cannot finish game before completing all stages' };
        }
        return { isValid: true };
      }
      return { isValid: false, error: `Invalid transition from RESULTS to ${nextPhase}` };

    case 'FINISHED':
      if (nextPhase !== 'LOBBY') {
        return { isValid: false, error: `Cannot transition from FINISHED to ${nextPhase}. Can only reset to LOBBY` };
      }
      return { isValid: true };

    default:
      return { isValid: false, error: `Unknown phase: ${currentPhase}` };
  }
}

/**
 * Determines the next stage phase given current stage and phase.
 */
export function getNextGamePhase(
  currentPhase: GamePhase,
  currentStageNumber: number
): { nextPhase: GamePhase; nextStageNumber: number } {
  switch (currentPhase) {
    case 'LOBBY':
      return { nextPhase: 'SUBMITTING', nextStageNumber: 1 };
    case 'SUBMITTING':
      return { nextPhase: 'VOTING', nextStageNumber: currentStageNumber };
    case 'VOTING':
      return { nextPhase: 'RESULTS', nextStageNumber: currentStageNumber };
    case 'RESULTS':
      if (currentStageNumber < TOTAL_STAGES) {
        return { nextPhase: 'SUBMITTING', nextStageNumber: currentStageNumber + 1 };
      }
      return { nextPhase: 'FINISHED', nextStageNumber: currentStageNumber };
    case 'FINISHED':
      return { nextPhase: 'LOBBY', nextStageNumber: 1 };
    default:
      throw new Error(`Unhandled game phase: ${currentPhase}`);
  }
}
