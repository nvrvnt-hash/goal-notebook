import { initialGoals } from '../data/defaultGoals';
import type { Goal } from '../types';

const GOALS_STORAGE_KEY = 'goal-notebook.goals';

function isGoal(value: unknown): value is Goal {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const goal = value as Record<string, unknown>;
  return (
    typeof goal.id === 'number' &&
    typeof goal.title === 'string' &&
    typeof goal.stage === 'string' &&
    typeof goal.progress === 'number' &&
    Number.isFinite(goal.progress) &&
    goal.progress >= 0 &&
    goal.progress <= 100 &&
    (goal.startDate === undefined || typeof goal.startDate === 'string') &&
    (goal.deadline === undefined || typeof goal.deadline === 'string') &&
    (goal.todayTask === undefined || typeof goal.todayTask === 'string')
  );
}

export function loadGoals(): Goal[] {
  try {
    const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!storedGoals) {
      return initialGoals.map((goal) => ({ ...goal }));
    }

    const parsedGoals: unknown = JSON.parse(storedGoals);
    if (Array.isArray(parsedGoals) && parsedGoals.every(isGoal)) {
      return parsedGoals;
    }
  } catch {
    // Use defaults when localStorage is unavailable or contains invalid JSON.
  }

  return initialGoals.map((goal) => ({ ...goal }));
}

export function saveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // Ignore storage failures so the in-memory UI can continue working.
  }
}