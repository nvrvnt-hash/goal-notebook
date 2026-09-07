import type { Goal } from '../types';

export const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Запустить персональное PWA',
    stage: 'Проектирование первого экрана',
    progress: 42,
    startDate: '2026-09-01',
    deadline: '2026-09-24',
    todayTask: 'Проверить главный экран на Android',
  },
  {
    id: 2,
    title: 'Собрать привычку вечернего обзора',
    stage: 'Неделя 1: короткий отчёт',
    progress: 18,
    startDate: '2026-09-02',
    deadline: '2026-09-12',
    todayTask: 'Записать выполненные задачи дня',
  },
  {
    id: 3,
    title: 'Подготовить план обучения',
    stage: 'Список тем и практики',
    progress: 65,
    startDate: '2026-08-26',
    deadline: '2026-09-09',
    todayTask: 'Выбрать одну тему для завтра',
  },
  {
    id: 4,
    title: 'Разобрать личные заметки',
    stage: 'Сортировка идей',
    progress: 25,
    todayTask: 'Отметить три важные записи',
  },
];