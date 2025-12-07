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

export interface AppData {
  user: User | null;
  exercises: Record<string, Exercise>; // key: "a×b"
  results: ExerciseResult[];
  lastWrongExercise: { a: number; b: number } | null;
  showWrongExerciseNext: boolean;
}

export const DELAY_THRESHOLD = 10000; // 10 seconds in milliseconds

export const GROUP_WEIGHTS = {
  1: 1,
  2: 3,
  3: 9,
  4: 27,
};

