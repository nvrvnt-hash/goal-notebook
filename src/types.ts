export type Goal = {
  id: number;
  title: string;
  stage: string;
  progress: number;
  startDate?: string;
  deadline?: string;
  todayTask?: string;
};

export type CreateGoalInput = {
  title: string;
  stage: string;
  startDate: string;
  deadline?: string;
};

export type Task = {
  id: number;
  title: string;
  goalId?: number;
  plannedDate: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

export type TaskInput = {
  title: string;
  goalId?: number;
  plannedDate: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  goalId?: number;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  title: string;
  content: string;
  goalId?: number;
};