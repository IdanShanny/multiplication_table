import { ExerciseResult } from './types';

interface Statistics {
  totalTime: number; // in milliseconds
  correctCount: number;
  wrongCount: number;
  totalCount: number;
}

const filterResultsByTime = (results: ExerciseResult[], startTime: number): ExerciseResult[] => {
  return results.filter(r => r.timestamp >= startTime);
};

const calculateStats = (results: ExerciseResult[]): Statistics => {
  const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);
  const correctCount = results.filter(r => r.isCorrect).length;
  const wrongCount = results.filter(r => !r.isCorrect).length;
  
  return {
    totalTime,
    correctCount,
    wrongCount,
    totalCount: results.length,
  };
};

export const getTodayStats = (results: ExerciseResult[]): Statistics => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return calculateStats(filterResultsByTime(results, today.getTime()));
};

export const getWeekStats = (results: ExerciseResult[]): Statistics => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  return calculateStats(filterResultsByTime(results, weekAgo.getTime()));
};

export const getMonthStats = (results: ExerciseResult[]): Statistics => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  monthAgo.setHours(0, 0, 0, 0);
  return calculateStats(filterResultsByTime(results, monthAgo.getTime()));
};

export const getAllTimeStats = (results: ExerciseResult[]): Statistics => {
  return calculateStats(results);
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours} שעות, ${minutes} דקות`;
  } else if (minutes > 0) {
    return `${minutes} דקות, ${seconds} שניות`;
  } else {
    return `${seconds} שניות`;
  }
};








