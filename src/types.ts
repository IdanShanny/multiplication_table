export type Gender = 'male' | 'female';

export interface User {
  name: string;
  gender: Gender;
}

export interface Exercise {
  a: number;
  b: number;
  group: 1 | 2 | 3 | 4;
}

export interface ExerciseResult {
  a: number;
  b: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  responseTime: number; // in milliseconds
  timestamp: number;
}

export interface IncentiveData {
  dailyScore: number;
  highScore: number;
  lastScoreDate: string; // Format: YYYY-MM-DD
  hasShownRecordPopupToday: boolean;
  currentStreak: number;
  lastStreakDate: string; // Format: YYYY-MM-DD to detect day changes
  firstUsageDate: string; // Format: YYYY-MM-DD - to prevent record popup on first day
  nextQuestionDoublePoints: boolean; // Whether the next question awards double points
  totalPoints: number; // Total points accumulated (never resets)
}

// Character customization types
export type CharacterColor = 'white' | 'brown' | 'skin';
export type CharacterSkin = 'winter' | 'festive' | 'summer';
export type CharacterAnimation = 'jump' | 'smile' | 'spin';

export interface CharacterStage {
  stage: 0 | 1 | 2 | 3; // 0=gray, 1=colored, 2=skin chosen, 3=animation chosen (then completed)
  color?: CharacterColor;
  skin?: CharacterSkin;
  animation?: CharacterAnimation;
}

export interface CompletedCharacter {
  id: string; // Unique ID for each completed character
  color: CharacterColor;
  skin: CharacterSkin;
  animation: CharacterAnimation;
  completedAt: number; // Timestamp
}

export interface CharacterData {
  currentCharacter: CharacterStage;
  completedCharacters: CompletedCharacter[];
}

export interface AppData {
  user: User | null;
  exercises: Record<string, Exercise>; // key: "a×b"
  results: ExerciseResult[];
  lastWrongExercise: { a: number; b: number } | null;
  showWrongExerciseNext: boolean;
  incentive: IncentiveData;
  character: CharacterData;
}

export const DELAY_THRESHOLD = 10000; // 10 seconds in milliseconds

export const GROUP_WEIGHTS = {
  1: 1,
  2: 3,
  3: 9,
  4: 18,
};








