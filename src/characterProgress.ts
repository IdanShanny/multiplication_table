import { CharacterData } from './types';

export const CHARACTER_BUILD_THRESHOLDS: Record<0 | 1 | 2, number> = {
  0: 30,
  1: 60,
  2: 90,
};

export function getThresholdForStage(stage: 0 | 1 | 2 | 3): number | null {
  if (stage >= 3) return null;
  return CHARACTER_BUILD_THRESHOLDS[stage as 0 | 1 | 2];
}

export function canUnlockCurrentStep(character: CharacterData): boolean {
  const stage = character.currentCharacter.stage;
  if (stage >= 3) return false;
  const threshold = getThresholdForStage(stage);
  if (threshold === null) return false;
  return character.pointsTowardCurrentCharacter >= threshold;
}

/** First-time popup for this build step (before player visits character screen). */
export function peekCharacterUnlockAnnouncement(
  character: CharacterData
): { stage: 0 | 1 | 2; threshold: number } | null {
  const stage = character.currentCharacter.stage;
  if (stage >= 3) return null;
  const threshold = getThresholdForStage(stage);
  if (threshold === null) return null;
  if (character.pointsTowardCurrentCharacter < threshold) return null;
  if (character.announcedUnlockStages.includes(stage)) return null;
  return { stage: stage as 0 | 1 | 2, threshold };
}

export function hasCharacterUpgradeWaiting(character: CharacterData): boolean {
  return canUnlockCurrentStep(character);
}

export const UNLOCK_STEP_LABELS: Record<0 | 1 | 2, string> = {
  0: 'בחירת צבע לדמות',
  1: 'בחירת לבוש לדמות',
  2: 'בחירת אנימציה לדמות',
};