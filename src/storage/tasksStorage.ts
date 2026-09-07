import { getLocalDateKey } from '../utils/date';
import type { Goal, Task } from '../types';

const TASKS_STORAGE_KEY = 'goal-notebook.tasks';

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'number' &&
    typeof task.title === 'string' &&
    (task.goalId === undefined || typeof task.goalId === 'number') &&
    typeof task.plannedDate === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    (task.completedAt === undefined || typeof task.completedAt === 'string')
  );
}

function cloneTasks(tasks: Task[]): Task[] {
  return tasks.map((task) => ({ ...task }));
}

export function moveOverdueTasks(tasks: Task[], today = getLocalDateKey()): Task[] {
  return tasks.map((task) =>
    !task.completed && task.plannedDate < today
      ? { ...task, plannedDate: today }
      : { ...task },
  );
}

function createMigratedTasks(goals: Goal[], today: string): Task[] {
  return goals
    .filter((goal) => typeof goal.todayTask === 'string' && goal.todayTask.trim())
    .map((goal, index) => ({
      id: index + 1,
      title: goal.todayTask!.trim(),
      goalId: goal.id,
      plannedDate: today,
      completed: false,
      createdAt: new Date().toISOString(),
    }));
}

export function loadTasks(goals: Goal[]): Task[] {
  const today = getLocalDateKey();

  try {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks === null) {
      const migratedTasks = createMigratedTasks(goals, today);
      saveTasks(migratedTasks);
      return cloneTasks(migratedTasks);
    }

    const parsedTasks: unknown = JSON.parse(storedTasks);
    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isTask)) {
      return [];
    }

    const tasks = parsedTasks.map((task) => ({ ...task }));
    const updatedTasks = moveOverdueTasks(tasks, today);
    const hasChanges = updatedTasks.some((task, index) => task.plannedDate !== tasks[index].plannedDate);

    if (hasChanges) {
      saveTasks(updatedTasks);
    }

    return cloneTasks(updatedTasks);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(cloneTasks(tasks)));
  } catch {
    // Keep the in-memory app usable when localStorage is unavailable.
  }
}