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
  todayTask?: string;
};