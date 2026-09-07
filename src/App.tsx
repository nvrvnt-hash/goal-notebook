import { useMemo, useState } from 'react';
import { loadGoals, saveGoals } from './storage/goalsStorage';
import type { Goal } from './types';
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  ClipboardCheck,
  FileText,
  Flag,
  ListTodo,
  NotebookText,
} from 'lucide-react';

type GoalStatus = 'on-track' | 'behind' | 'no-date';
type FilterKey = 'all' | 'behind' | 'soon' | 'no-date';

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'behind', label: 'Отстают' },
  { key: 'soon', label: 'Ближайшие' },
  { key: 'no-date', label: 'Без срока' },
];

const today = new Date();
today.setHours(0, 0, 0, 0);

function App() {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const enrichedGoals = useMemo(
    () =>
      goals.map((goal) => ({
        ...goal,
        status: getGoalStatus(goal),
        daysLeft: getDaysLeft(goal.deadline),
      })),
    [goals],
  );

  const activeGoals = enrichedGoals.length;
  const attentionGoals = enrichedGoals.filter((goal) => goal.status === 'behind').length;
  const nearestDeadline = enrichedGoals
    .filter((goal): goal is typeof goal & { daysLeft: number } => typeof goal.daysLeft === 'number' && goal.daysLeft >= 0)
    .map((goal) => goal.daysLeft)
    .sort((a, b) => a - b)[0];

  const visibleGoals = enrichedGoals.filter((goal) => {
    if (activeFilter === 'behind') {
      return goal.status === 'behind';
    }

    if (activeFilter === 'soon') {
      return typeof goal.daysLeft === 'number' && goal.daysLeft >= 0 && goal.daysLeft <= 7;
    }

    if (activeFilter === 'no-date') {
      return goal.status === 'no-date';
    }

    return true;
  });

  const addProgress = (goalId: number, amount: number) => {
    setGoals((currentGoals) => {
      const updatedGoals = currentGoals.map((goal) =>
        goal.id === goalId ? { ...goal, progress: Math.min(goal.progress + amount, 100) } : goal,
      );
      saveGoals(updatedGoals);
      return updatedGoals;
    });
  };

  return (
    <main className="app-shell">
      <section className="screen" aria-label="Мои цели">
        <header className="screen-header">
          <div>
            <p className="date-label">{formatLongDate(today)}</p>
            <h1>Мои цели</h1>
          </div>
          <button className="icon-button" type="button" aria-label="Открыть итоги">
            <BarChart3 size={22} strokeWidth={2.2} />
          </button>
        </header>

        <section className="summary-grid" aria-label="Сводка целей">
          <MetricCard value={activeGoals} label="Активные" tone="blue" />
          <MetricCard value={attentionGoals} label="Внимание" tone="warm" />
          <MetricCard value={nearestDeadline ?? '—'} label="Дней до срока" tone="green" />
        </section>

        <nav className="filter-row" aria-label="Фильтры целей">
          {filters.map((filter) => (
            <button
              className={filter.key === activeFilter ? 'filter-chip active' : 'filter-chip'}
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </nav>

        <section className="goal-list" aria-label="Активные цели">
          {visibleGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onAddProgress={addProgress} />
          ))}
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}

function MetricCard({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: 'blue' | 'warm' | 'green';
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function GoalCard({
  goal,
  onAddProgress,
}: {
  goal: Goal & { status: GoalStatus; daysLeft?: number };
  onAddProgress: (goalId: number, amount: number) => void;
}) {
  const statusInfo = getStatusInfo(goal.status);

  return (
    <article className="goal-card">
      <div className="goal-card-top">
        <div className="goal-title-block">
          <span className="stage-label">{goal.stage}</span>
          <h2>{goal.title}</h2>
        </div>
        <button className="details-button" type="button" aria-label={`Открыть цель: ${goal.title}`}>
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="progress-head">
        <span>Прогресс</span>
        <strong>{goal.progress}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${goal.progress}%` }} />
      </div>

      <div className="goal-meta">
        <span className="meta-item">
          <CalendarDays size={16} />
          {formatDeadline(goal.deadline)}
        </span>
        <span className={`status-pill ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>

      <div className="task-link">
        <ListTodo size={17} />
        <span>{goal.todayTask ?? 'Задача на сегодня не выбрана'}</span>
      </div>

      <div className="quick-actions" aria-label={`Быстро изменить прогресс цели ${goal.title}`}>
        {[5, 10, 25].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onAddProgress(goal.id, amount)}
            disabled={goal.progress >= 100}
          >
            +{amount}%
          </button>
        ))}
      </div>
    </article>
  );
}

function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      <button className="nav-item active" type="button">
        <Flag size={21} />
        <span>Цели</span>
      </button>
      <button className="nav-item" type="button">
        <ClipboardCheck size={21} />
        <span>Сегодня</span>
      </button>
      <button className="add-button" type="button" aria-label="Добавить">
        <CirclePlus size={34} strokeWidth={1.9} />
      </button>
      <button className="nav-item" type="button">
        <NotebookText size={21} />
        <span>Заметки</span>
      </button>
      <button className="nav-item" type="button">
        <FileText size={21} />
        <span>Итоги</span>
      </button>
    </nav>
  );
}

function getGoalStatus(goal: Goal): GoalStatus {
  if (!goal.startDate || !goal.deadline) {
    return 'no-date';
  }

  const startDate = parseDate(goal.startDate);
  const deadlineDate = parseDate(goal.deadline);
  const totalTime = deadlineDate.getTime() - startDate.getTime();

  if (totalTime <= 0) {
    return goal.progress >= 100 ? 'on-track' : 'behind';
  }

  const elapsedTime = Math.max(0, today.getTime() - startDate.getTime());
  const expectedProgress = Math.min(100, Math.round((elapsedTime / totalTime) * 100));

  return goal.progress + 5 >= expectedProgress ? 'on-track' : 'behind';
}

function getStatusInfo(status: GoalStatus) {
  if (status === 'behind') {
    return { label: 'Отстаёт', className: 'behind' };
  }

  if (status === 'no-date') {
    return { label: 'Без срока', className: 'neutral' };
  }

  return { label: 'По плану', className: 'on-track' };
}

function getDaysLeft(deadline?: string) {
  if (!deadline) {
    return undefined;
  }

  const deadlineDate = parseDate(deadline);
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / 86_400_000);
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDeadline(deadline?: string) {
  const daysLeft = getDaysLeft(deadline);

  if (!deadline || typeof daysLeft !== 'number') {
    return 'Без дедлайна';
  }

  if (daysLeft < 0) {
    return `Просрочено на ${Math.abs(daysLeft)} дн.`;
  }

  if (daysLeft === 0) {
    return 'Дедлайн сегодня';
  }

  return `${formatShortDate(parseDate(deadline))} · осталось ${daysLeft} дн.`;
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export default App;
