import { ListTodo } from 'lucide-react';
import { formatLongDate } from './GoalsScreen';
import type { Goal } from '../types';

function TodayScreen({ goals }: { goals: Goal[] }) {
  const tasks = goals.filter((goal) => goal.todayTask);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <section className="screen" aria-label="Сегодня">
      <header className="screen-header screen-header-stacked"><p className="date-label">{formatLongDate(today)}</p><h1>Сегодня</h1></header>
      <section className="content-section" aria-labelledby="today-plan-title">
        <div className="section-heading"><h2 id="today-plan-title">План на день</h2><span className="section-count">{tasks.length}</span></div>
        {tasks.length > 0 ? <div className="simple-list">{tasks.map((goal) => <article className="simple-list-item" key={goal.id}><ListTodo size={19} /><div><strong>{goal.todayTask}</strong><span>{goal.title}</span></div></article>)}</div> : <div className="empty-state">На сегодня задачи не запланированы</div>}
      </section>
    </section>
  );
}

export default TodayScreen;