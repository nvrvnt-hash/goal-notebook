import { useState } from 'react';
import { Check, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatLongDate } from './GoalsScreen';
import type { Goal, Task } from '../types';
import { getLocalDateKey } from '../utils/date';

type TodayScreenProps = {
  goals: Goal[];
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (taskId: number) => void;
  onToggleTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
};

function TodayScreen({ goals, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }: TodayScreenProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const today = getLocalDateKey();
  const todayTasks = tasks.filter((task) => task.plannedDate === today);
  const remainingTasks = todayTasks.filter((task) => !task.completed);
  const completedTasks = todayTasks.filter((task) => task.completed);
  const getGoalTitle = (goalId?: number) => goals.find((goal) => goal.id === goalId)?.title;

  return (
    <section className="screen" aria-label="Сегодня">
      <header className="screen-header screen-header-stacked">
        <p className="date-label">{formatLongDate(new Date())}</p>
        <div className="today-heading-row">
          <h1>Сегодня</h1>
          <button className="today-add-button" type="button" onClick={onAddTask}><Plus size={18} />Добавить задачу</button>
        </div>
      </header>
      <section className="day-summary" aria-label="Прогресс дня">
        <div className="day-summary-head"><strong>Выполнено {completedTasks.length} из {todayTasks.length}</strong><span>{todayTasks.length ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0}%</span></div>
        <div className="progress-track"><span style={{ width: `${todayTasks.length ? (completedTasks.length / todayTasks.length) * 100 : 0}%` }} /></div>
      </section>
      {todayTasks.length === 0 ? (
        <div className="empty-state today-empty-state">На сегодня задачи не запланированы</div>
      ) : (
        <>
          <TaskGroup title="Осталось" tasks={remainingTasks} getGoalTitle={getGoalTitle} onEditTask={onEditTask} onToggleTask={onToggleTask} onDeleteTask={setPendingDeleteId} />
          <TaskGroup title="Выполнено" tasks={completedTasks} getGoalTitle={getGoalTitle} onEditTask={onEditTask} onToggleTask={onToggleTask} onDeleteTask={setPendingDeleteId} />
          {pendingDeleteId !== null && (
            <div className="task-delete-confirmation" role="alertdialog" aria-label="Удалить задачу?">
              <strong>Удалить задачу?</strong>
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setPendingDeleteId(null)}>Отмена</button>
                <button className="danger-button" type="button" onClick={() => { onDeleteTask(pendingDeleteId); setPendingDeleteId(null); }}>Удалить</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

type TaskGroupProps = {
  title: string;
  tasks: Task[];
  getGoalTitle: (goalId?: number) => string | undefined;
  onEditTask: (taskId: number) => void;
  onToggleTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
};

function TaskGroup({ title, tasks, getGoalTitle, onEditTask, onToggleTask, onDeleteTask }: TaskGroupProps) {
  return (
    <section className="task-group" aria-label={title}>
      <div className="section-heading"><h2>{title}</h2><span className="section-count">{tasks.length}</span></div>
      {tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => {
            const goalTitle = getGoalTitle(task.goalId);
            return (
              <article className={task.completed ? 'task-item completed' : 'task-item'} key={task.id}>
                <button className="task-check" type="button" aria-label={task.completed ? `Вернуть задачу: ${task.title}` : `Выполнить задачу: ${task.title}`} onClick={() => onToggleTask(task.id)}>{task.completed && <Check size={17} />}</button>
                <div className="task-item-content"><strong>{task.title}</strong>{goalTitle && <span><ListTodo size={14} />{goalTitle}</span>}</div>
                <div className="task-item-actions">
                  <button className="task-icon-button" type="button" aria-label={`Редактировать задачу: ${task.title}`} onClick={() => onEditTask(task.id)}><Pencil size={17} /></button>
                  <button className="task-icon-button danger-icon" type="button" aria-label={`Удалить задачу: ${task.title}`} onClick={() => onDeleteTask(task.id)}><Trash2 size={17} /></button>
                </div>
              </article>
            );
          })}
        </div>
      ) : <div className="empty-state task-group-empty">Нет задач</div>}
    </section>
  );
}

export default TodayScreen;
