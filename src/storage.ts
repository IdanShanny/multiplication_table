import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Exercise, ExerciseResult, User } from './types';

const STORAGE_KEY = 'multiplication_table_data';

// Determine initial group for an exercise based on the numbers
const getInitialGroup = (a: number, b: number): 1 | 2 | 3 | 4 => {
  // Group 1: Any exercise with '1' as one of the numbers
  if (a === 1 || b === 1) {
    return 1;
  }
  // Group 2: Any exercise with '2' as one of the numbers (but not '1')
  if (a === 2 || b === 2) {
    return 2;
  }
  // Group 4: Both numbers greater than 5
  if (a > 5 && b > 5) {
    return 4;
  }
  // Group 3: All the rest
  return 3;
};

// Initialize all 100 exercises (1-10 × 1-10) with appropriate groups
const initializeExercises = (): Record<string, Exercise> => {
  const exercises: Record<string, Exercise> = {};
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      const key = `${a}×${b}`;
      exercises[key] = { a, b, group: getInitialGroup(a, b) };
    }
  }
  return exercises;
};

const getDefaultIncentiveData = () => ({
  dailyScore: 0,
  highScore: 0,
  lastScoreDate: new Date().toISOString().split('T')[0],
  hasShownRecordPopupToday: false,
  currentStreak: 0,
  lastStreakDate: new Date().toISOString().split('T')[0],
});

const getDefaultAppData = (): AppData => ({
  user: null,
  exercises: initializeExercises(),
  results: [],
  lastWrongExercise: null,
  showWrongExerciseNext: false,
  incentive: getDefaultIncentiveData(),
});

// Migrate and validate stored data to ensure compatibility with current version
const migrateAppData = (parsed: any): AppData => {
  const defaultData = getDefaultAppData();
  
  // Start with default data and merge in valid stored data
  const migrated: AppData = {
    user: null,
    exercises: defaultData.exercises,
    results: [],
    lastWrongExercise: null,
    showWrongExerciseNext: false,
    incentive: defaultData.incentive,
  };
  
  // Migrate user data
  if (parsed.user && typeof parsed.user === 'object') {
    if (parsed.user.name && parsed.user.gender) {
      migrated.user = {
        name: String(parsed.user.name),
        gender: parsed.user.gender === 'female' ? 'female' : 'male',
      };
    }
  }
  
  // Migrate exercises - preserve groups from stored data
  if (parsed.exercises && typeof parsed.exercises === 'object') {
    for (const key of Object.keys(migrated.exercises)) {
      if (parsed.exercises[key] && typeof parsed.exercises[key].group === 'number') {
        const group = parsed.exercises[key].group;
        if (group >= 1 && group <= 4) {
          migrated.exercises[key].group = group as 1 | 2 | 3 | 4;
        }
      }
    }
  }
  
  // Migrate results - validate each result
  if (Array.isArray(parsed.results)) {
    migrated.results = parsed.results.filter((r: any) => 
      r && typeof r === 'object' &&
      typeof r.a === 'number' &&
      typeof r.b === 'number' &&
      typeof r.isCorrect === 'boolean'
    );
  }
  
  // Migrate lastWrongExercise
  if (parsed.lastWrongExercise && typeof parsed.lastWrongExercise === 'object') {
    if (typeof parsed.lastWrongExercise.a === 'number' && typeof parsed.lastWrongExercise.b === 'number') {
      migrated.lastWrongExercise = {
        a: parsed.lastWrongExercise.a,
        b: parsed.lastWrongExercise.b,
      };
    }
  }
  
  // Migrate showWrongExerciseNext
  if (typeof parsed.showWrongExerciseNext === 'boolean') {
    migrated.showWrongExerciseNext = parsed.showWrongExerciseNext;
  }
  
  // Migrate incentive data
  if (parsed.incentive && typeof parsed.incentive === 'object') {
    const today = new Date().toISOString().split('T')[0];
    const storedDate = parsed.incentive.lastScoreDate;
    
    // Reset daily score if it's a new day
    if (storedDate === today) {
      migrated.incentive = {
        dailyScore: typeof parsed.incentive.dailyScore === 'number' ? parsed.incentive.dailyScore : 0,
        highScore: typeof parsed.incentive.highScore === 'number' ? parsed.incentive.highScore : 0,
        lastScoreDate: storedDate,
        hasShownRecordPopupToday: typeof parsed.incentive.hasShownRecordPopupToday === 'boolean' ? parsed.incentive.hasShownRecordPopupToday : false,
        currentStreak: typeof parsed.incentive.currentStreak === 'number' ? parsed.incentive.currentStreak : 0,
        lastStreakDate: typeof parsed.incentive.lastStreakDate === 'string' ? parsed.incentive.lastStreakDate : today,
      };
    } else {
      // New day - reset daily score but keep high score
      migrated.incentive = {
        dailyScore: 0,
        highScore: typeof parsed.incentive.highScore === 'number' ? parsed.incentive.highScore : 0,
        lastScoreDate: today,
        hasShownRecordPopupToday: false,
        currentStreak: 0,
        lastStreakDate: today,
      };
    }
  }
  
  return migrated;
};

export const loadAppData = async (): Promise<AppData> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate and validate the data
      const migrated = migrateAppData(parsed);
      return migrated;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    // If there's an error, clear corrupted data and start fresh
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (clearError) {
      console.error('Error clearing corrupted data:', clearError);
    }
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

// Incentive-related functions
export const updateDailyScore = async (points: number): Promise<{ newScore: number; isNewRecord: boolean; shouldShowRecordPopup: boolean }> => {
  const data = await loadAppData();
  const today = new Date().toISOString().split('T')[0];
  
  // Reset if new day
  if (data.incentive.lastScoreDate !== today) {
    data.incentive.dailyScore = 0;
    data.incentive.lastScoreDate = today;
    data.incentive.hasShownRecordPopupToday = false;
    data.incentive.currentStreak = 0;
    data.incentive.lastStreakDate = today;
  }
  
  data.incentive.dailyScore += points;
  const newScore = data.incentive.dailyScore;
  let isNewRecord = false;
  let shouldShowRecordPopup = false;
  
  // Check if it's a new high score
  if (newScore > data.incentive.highScore) {
    const previousHighScore = data.incentive.highScore;
    isNewRecord = true;
    data.incentive.highScore = newScore;
    
    // Show popup only if:
    // 1. There was a previous high score (not first day/first usage)
    // 2. Haven't shown the popup today yet
    if (previousHighScore > 0 && !data.incentive.hasShownRecordPopupToday) {
      shouldShowRecordPopup = true;
      data.incentive.hasShownRecordPopupToday = true;
    }
  }
  
  await saveAppData(data);
  return { newScore, isNewRecord, shouldShowRecordPopup };
};

export const updateStreak = async (isCorrectAndFast: boolean): Promise<{ currentStreak: number; achievementReached: 5 | 10 | 20 | null }> => {
  const data = await loadAppData();
  const today = new Date().toISOString().split('T')[0];
  
  // Reset streak if new day
  if (data.incentive.lastStreakDate !== today) {
    data.incentive.currentStreak = 0;
    data.incentive.lastStreakDate = today;
  }
  
  if (isCorrectAndFast) {
    const previousStreak = data.incentive.currentStreak;
    data.incentive.currentStreak += 1;
    const currentStreak = data.incentive.currentStreak;
    
    let achievementReached: 5 | 10 | 20 | null = null;
    
    // Check if reached a milestone
    if (currentStreak === 5 || currentStreak === 10 || currentStreak === 20) {
      achievementReached = currentStreak as 5 | 10 | 20;
    }
    
    await saveAppData(data);
    return { currentStreak, achievementReached };
  } else {
    // Reset streak on wrong or slow answer
    data.incentive.currentStreak = 0;
    await saveAppData(data);
    return { currentStreak: 0, achievementReached: null };
  }
};

export const getIncentiveData = async () => {
  const data = await loadAppData();
  return data.incentive;
};

