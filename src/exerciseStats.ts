import { AppData } from './types';

export function countExercisesByGroup(appData: AppData): {
  group1Count: number;
  group2Count: number;
  group3Count: number;
  group4Count: number;
} {
  let group1Count = 0;
  let group2Count = 0;
  let group3Count = 0;
  let group4Count = 0;

  for (const key of Object.keys(appData.exercises)) {
    const group = appData.exercises[key]?.group;
    if (group === 1) group1Count++;
    else if (group === 2) group2Count++;
    else if (group === 3) group3Count++;
    else if (group === 4) group4Count++;
  }

  return { group1Count, group2Count, group3Count, group4Count };
}