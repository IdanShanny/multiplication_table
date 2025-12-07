import { AppData, Exercise, GROUP_WEIGHTS } from './types';

export const selectNextExercise = (
  appData: AppData,
  currentExercise?: { a: number; b: number }
): Exercise => {
  const exercises = Object.values(appData.exercises);
  
  // Check if we should show the wrong exercise from before
  if (appData.showWrongExerciseNext && appData.lastWrongExercise) {
    const key = `${appData.lastWrongExercise.a}×${appData.lastWrongExercise.b}`;
    const exercise = appData.exercises[key];
    if (exercise) {
      return exercise;
    }
  }
  
  // Filter out current exercise if provided
  let availableExercises = exercises;
  if (currentExercise) {
    availableExercises = exercises.filter(
      e => !(e.a === currentExercise.a && e.b === currentExercise.b)
    );
  }
  
  // Also filter out the last wrong exercise if we're selecting a different one
  if (appData.lastWrongExercise && !appData.showWrongExerciseNext) {
    availableExercises = availableExercises.filter(
      e => !(e.a === appData.lastWrongExercise!.a && e.b === appData.lastWrongExercise!.b)
    );
  }
  
  // Calculate weighted selection
  const weightedExercises: { exercise: Exercise; weight: number }[] = availableExercises.map(e => ({
    exercise: e,
    weight: GROUP_WEIGHTS[e.group],
  }));
  
  const totalWeight = weightedExercises.reduce((sum, we) => sum + we.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const we of weightedExercises) {
    random -= we.weight;
    if (random <= 0) {
      return we.exercise;
    }
  }
  
  // Fallback to first available
  return availableExercises[0] || exercises[0];
};

export const getExercisesByGroup = (appData: AppData): Record<1 | 2 | 3 | 4, Exercise[]> => {
  const groups: Record<1 | 2 | 3 | 4, Exercise[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };
  
  Object.values(appData.exercises).forEach(exercise => {
    groups[exercise.group].push(exercise);
  });
  
  // Sort exercises within each group
  Object.values(groups).forEach(group => {
    group.sort((a, b) => a.a === b.a ? a.b - b.b : a.a - b.a);
  });
  
  return groups;
};

