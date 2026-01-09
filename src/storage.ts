import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Exercise, ExerciseResult, User } from './types';

const STORAGE_KEY = 'multiplication_table_data';

// Determine initial group for an exercise based on the numbers
const getInitialGroup = (a: number, b: number): 1 | 2 | 3 | 4 => {
  // Group 1: Any exercise with '1' as one of the numbers
  if (a === 1 || b === 1) {
    return 1;
  }
  // Group 2: Any exercise with '2' as one of the numbers (but not '1'), OR multiples of 10
  if (a === 2 || b === 2 || a === 10 || b === 10) {
    return 2;
  }
  // Group 4: Both numbers greater than 5 (but not 10)
  if (a > 5 && b > 5 && a !== 10 && b !== 10) {
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

const getDefaultIncentiveData = () => {
  const today = new Date().toISOString().split('T')[0];
  return {
    dailyScore: 0,
    highScore: 0,
    lastScoreDate: today,
    hasShownRecordPopupToday: false,
    currentStreak: 0,
    lastStreakDate: today,
    firstUsageDate: today,
    nextQuestionDoublePoints: false,
    totalPoints: 0,
  };
};

const getDefaultCharacterData = () => {
  return {
    currentCharacter: {
      stage: 0 as 0 | 1 | 2 | 3,
    },
    completedCharacters: [],
  };
};

const getDefaultAppData = (): AppData => ({
  user: null,
  exercises: initializeExercises(),
  results: [],
  lastWrongExercise: null,
  showWrongExerciseNext: false,
  incentive: getDefaultIncentiveData(),
  character: getDefaultCharacterData(),
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
    character: defaultData.character,
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
    const firstUsageDate = typeof parsed.incentive.firstUsageDate === 'string' ? parsed.incentive.firstUsageDate : today;
    const totalPoints = typeof parsed.incentive.totalPoints === 'number' ? parsed.incentive.totalPoints : 0;
    
    // Reset daily score if it's a new day
    if (storedDate === today) {
      migrated.incentive = {
        dailyScore: typeof parsed.incentive.dailyScore === 'number' ? parsed.incentive.dailyScore : 0,
        highScore: typeof parsed.incentive.highScore === 'number' ? parsed.incentive.highScore : 0,
        lastScoreDate: storedDate,
        hasShownRecordPopupToday: typeof parsed.incentive.hasShownRecordPopupToday === 'boolean' ? parsed.incentive.hasShownRecordPopupToday : false,
        currentStreak: typeof parsed.incentive.currentStreak === 'number' ? parsed.incentive.currentStreak : 0,
        lastStreakDate: typeof parsed.incentive.lastStreakDate === 'string' ? parsed.incentive.lastStreakDate : today,
        firstUsageDate: firstUsageDate,
        nextQuestionDoublePoints: typeof parsed.incentive.nextQuestionDoublePoints === 'boolean' ? parsed.incentive.nextQuestionDoublePoints : false,
        totalPoints: totalPoints,
      };
    } else {
      // New day - reset daily score but keep high score and total points
      migrated.incentive = {
        dailyScore: 0,
        highScore: typeof parsed.incentive.highScore === 'number' ? parsed.incentive.highScore : 0,
        lastScoreDate: today,
        hasShownRecordPopupToday: false,
        currentStreak: 0,
        lastStreakDate: today,
        firstUsageDate: firstUsageDate,
        nextQuestionDoublePoints: false,
        totalPoints: totalPoints,
      };
    }
  }
  
  // Migrate character data
  if (parsed.character && typeof parsed.character === 'object') {
    if (parsed.character.currentCharacter && typeof parsed.character.currentCharacter === 'object') {
      const stage = parsed.character.currentCharacter.stage;
      if (typeof stage === 'number' && stage >= 0 && stage <= 3) {
        migrated.character.currentCharacter = {
          stage: stage as 0 | 1 | 2 | 3,
          color: parsed.character.currentCharacter.color,
          skin: parsed.character.currentCharacter.skin,
          animation: parsed.character.currentCharacter.animation,
        };
      }
    }
    if (Array.isArray(parsed.character.completedCharacters)) {
      migrated.character.completedCharacters = parsed.character.completedCharacters.filter((c: any) =>
        c && typeof c === 'object' &&
        typeof c.id === 'string' &&
        typeof c.color === 'string' &&
        typeof c.skin === 'string' &&
        typeof c.animation === 'string' &&
        typeof c.completedAt === 'number'
      );
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
  // Update total points (only add positive points)
  if (points > 0) {
    data.incentive.totalPoints += points;
  }
  
  const newScore = data.incentive.dailyScore;
  let isNewRecord = false;
  let shouldShowRecordPopup = false;
  
  // Check if it's a new high score
  if (newScore > data.incentive.highScore) {
    const previousHighScore = data.incentive.highScore;
    isNewRecord = true;
    data.incentive.highScore = newScore;
    
    // Show popup only if:
    // 1. Not the first day of usage
    // 2. There was a previous high score (previousHighScore > 0)
    // 3. Haven't shown the popup today yet
    const isFirstDay = data.incentive.firstUsageDate === today;
    if (!isFirstDay && previousHighScore > 0 && !data.incentive.hasShownRecordPopupToday) {
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

export const setDoublePointsForNextQuestion = async (enable: boolean): Promise<void> => {
  const data = await loadAppData();
  data.incentive.nextQuestionDoublePoints = enable;
  await saveAppData(data);
};

export const checkAndConsumeDoublePoints = async (): Promise<boolean> => {
  const data = await loadAppData();
  const hasDoublePoints = data.incentive.nextQuestionDoublePoints;
  if (hasDoublePoints) {
    data.incentive.nextQuestionDoublePoints = false;
    await saveAppData(data);
  }
  return hasDoublePoints;
};

// Character-related functions
export const getCharacterData = async () => {
  const data = await loadAppData();
  return data.character;
};

export const getCurrentCharacterStage = async () => {
  const data = await loadAppData();
  return data.character.currentCharacter.stage;
};

export const getPointsForNextStage = (currentStage: 0 | 1 | 2 | 3): number => {
  // Each stage requires 30 points
  return (currentStage + 1) * 30;
};

export const updateCharacterColor = async (color: 'white' | 'brown' | 'skin'): Promise<void> => {
  const data = await loadAppData();
  data.character.currentCharacter.color = color;
  data.character.currentCharacter.stage = 1;
  await saveAppData(data);
};

export const updateCharacterSkin = async (skin: 'winter' | 'festive' | 'summer'): Promise<void> => {
  const data = await loadAppData();
  data.character.currentCharacter.skin = skin;
  data.character.currentCharacter.stage = 2;
  await saveAppData(data);
};

export const updateCharacterAnimation = async (animation: 'jump' | 'smile' | 'spin'): Promise<void> => {
  const data = await loadAppData();
  data.character.currentCharacter.animation = animation;
  data.character.currentCharacter.stage = 3;
  await saveAppData(data);
};

export const completeCharacter = async (): Promise<void> => {
  const data = await loadAppData();
  const current = data.character.currentCharacter;
  
  if (current.stage === 3 && current.color && current.skin && current.animation) {
    // Save completed character
    const completedCharacter = {
      id: Date.now().toString(),
      color: current.color,
      skin: current.skin,
      animation: current.animation,
      completedAt: Date.now(),
    };
    
    data.character.completedCharacters.push(completedCharacter);
    
    // Reset current character
    data.character.currentCharacter = {
      stage: 0,
    };
    
    await saveAppData(data);
  }
};

export const getCompletedCharacters = async () => {
  const data = await loadAppData();
  return data.character.completedCharacters;
};
