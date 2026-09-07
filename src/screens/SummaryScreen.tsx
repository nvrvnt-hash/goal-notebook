import { getGoalStatus } from './GoalsScreen';
import type { Goal } from '../types';

function SummaryScreen({ goals }: { goals: Goal[] }) {
  const onTrackGoals = goals.filter((goal) => getGoalStatus(goal) === 'on-track').length;
  const behindGoals = goals.filter((goal) => getGoalStatus(goal) === 'behind').length;
  const averageProgress = goals.length ? Math.round(goals.reduce((total, goal) => total + goal.progress, 0) / goals.length) : 0;
  return (
    <section className="screen" aria-label="Итоги">
      <header className="screen-header screen-header-stacked"><h1>Итоги</h1></header>
      <section className="summary-grid summary-grid-two" aria-label="Сводка целей">
        <SummaryMetric value={goals.length} label="Количество целей" /><SummaryMetric value={onTrackGoals} label="По плану" /><SummaryMetric value={behindGoals} label="Отстают" /><SummaryMetric value={`${averageProgress}%`} label="Средний прогресс" />
      </section>
      <section className="content-section" aria-labelledby="evening-report-title"><h2 id="evening-report-title">Вечерний отчёт</h2><p className="report-message">Вечерний отчёт будет добавлен на следующем этапе</p></section>
    </section>
  );
}

function SummaryMetric({ value, label }: { value: number | string; label: string }) {
  return <article className="metric-card blue"><strong>{value}</strong><span>{label}</span></article>;
}

export default SummaryScreen;