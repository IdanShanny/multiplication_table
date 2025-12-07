import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Exercise, ExerciseResult, User } from './types';

const STORAGE_KEY = 'multiplication_table_data';

// Initialize all 100 exercises (1-10 × 1-10) in group 1
const initializeExercises = (): Record<string, Exercise> => {
  const exercises: Record<string, Exercise> = {};
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      const key = `${a}×${b}`;
      exercises[key] = { a, b, group: 1 };
    }
  }
  return exercises;
};

const getDefaultAppData = (): AppData => ({
  user: null,
  exercises: initializeExercises(),
  results: [],
  lastWrongExercise: null,
  showWrongExerciseNext: false,
});

export const loadAppData = async (): Promise<AppData> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as AppData;
      // Ensure exercises are initialized if missing
      if (!parsed.exercises || Object.keys(parsed.exercises).length === 0) {
        parsed.exercises = initializeExercises();
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return getDefaultAppData();
};

export const saveAppData = async (data: AppData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const saveUser = async (user: User): Promise<AppData> => {
  const data = await loadAppData();
  data.user = user;
  await saveAppData(data);
  return data;
};

export const updateExerciseGroup = async (
  a: number,
  b: number,
  newGroup: 1 | 2 | 3 | 4
): Promise<void> => {
  const data = await loadAppData();
  const key = `${a}×${b}`;
  if (data.exercises[key]) {
    data.exercises[key].group = newGroup;
    await saveAppData(data);
  }
};

export const saveExerciseResult = async (result: ExerciseResult): Promise<void> => {
  const data = await loadAppData();
  data.results.push(result);
  
  // Update exercise group based on result
  const key = `${result.a}×${result.b}`;
  const exercise = data.exercises[key];
  
  if (exercise) {
    if (!result.isCorrect || result.responseTime > 10000) {
      // Wrong answer or slow response - increase group
      if (exercise.group < 4) {
        exercise.group = (exercise.group + 1) as 1 | 2 | 3 | 4;
      }
      // Set up to show this exercise again after the next one
      data.lastWrongExercise = { a: result.a, b: result.b };
      data.showWrongExerciseNext = false; // Will be true after next exercise
    } else {
      // Correct and fast - decrease group
      if (exercise.group > 1) {
        exercise.group = (exercise.group - 1) as 1 | 2 | 3 | 4;
      }
    }
  }
  
  await saveAppData(data);
};

export const markNextExerciseShown = async (): Promise<void> => {
  const data = await loadAppData();
  if (data.lastWrongExercise && !data.showWrongExerciseNext) {
    data.showWrongExerciseNext = true;
    await saveAppData(data);
  } else if (data.showWrongExerciseNext) {
    // Reset after showing the wrong exercise
    data.lastWrongExercise = null;
    data.showWrongExerciseNext = false;
    await saveAppData(data);
  }
};

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

