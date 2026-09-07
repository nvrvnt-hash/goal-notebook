import { useEffect, useState } from 'react';
import { CalendarDays, ListTodo } from 'lucide-react';
import { getGoalStatus, type GoalStatus } from '../screens/GoalsScreen';
import type { Goal } from '../types';
import type { Task } from '../types';

type GoalDetailsModalProps = {
  goal: Goal;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  tasks: Task[];
  currentDate: string;
};

function GoalDetailsModal({ goal, onClose, onEdit, onDelete, tasks, currentDate }: GoalDetailsModalProps) {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const status = getGoalStatus(goal, currentDate);
  const statusInfo = getStatusInfo(status);
  const relatedTasks = tasks.filter((task) => task.goalId === goal.id && task.plannedDate === currentDate);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="goal-details-modal" role="dialog" aria-modal="true" aria-labelledby="goal-details-title">
        <div className="modal-heading">
          <h2 id="goal-details-title">{goal.title}</h2>
          <button className="modal-close-button" type="button" aria-label="Закрыть подробности цели" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="details-content">
          <div className="details-stage">{goal.stage}</div>
          <div className="details-progress-head">
            <span>Прогресс</span>
            <strong>{goal.progress}%</strong>
          </div>
          <div className="progress-track" aria-label={`Прогресс ${goal.progress}%`}>
            <span style={{ width: `${goal.progress}%` }} />
          </div>

          <div className="details-meta-list">
            <div className="details-meta-item">
              <CalendarDays size={17} />
              <span><strong>Дата начала</strong>{formatDate(goal.startDate)}</span>
            </div>
            <div className="details-meta-item">
              <CalendarDays size={17} />
              <span><strong>Дедлайн</strong>{formatDate(goal.deadline, 'Без дедлайна')}</span>
            </div>
            <div className="details-meta-item">
              <ListTodo size={17} />
              <span>
                <strong>Задачи на сегодня</strong>
                {relatedTasks.length === 0
                  ? 'Не запланирована'
                  : relatedTasks.map((task) => task.title).join(' · ')}
              </span>
            </div>
          </div>

          <div className={`details-status ${statusInfo.className}`}>
            <span>Статус движения к цели</span>
            <strong>{statusInfo.label}</strong>
          </div>
        </div>

        {isDeleteConfirmationOpen ? (
          <div className="delete-confirmation" role="alertdialog" aria-labelledby="delete-goal-title">
            <strong id="delete-goal-title">Удалить цель?</strong>
            <p>Это действие нельзя отменить</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setIsDeleteConfirmationOpen(false)}>Отмена</button>
              <button className="danger-button" type="button" onClick={onDelete}>Удалить</button>
            </div>
          </div>
        ) : (
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onEdit}>Редактировать</button>
            <button className="danger-button" type="button" onClick={() => setIsDeleteConfirmationOpen(true)}>Удалить</button>
          </div>
        )}
      </section>
    </div>
  );
}

function getStatusInfo(status: GoalStatus) {
  if (status === 'behind') return { label: 'Отстаёт', className: 'behind' };
  if (status === 'no-date') return { label: 'Без срока', className: 'neutral' };
  return { label: 'По плану', className: 'on-track' };
}

function formatDate(value?: string, fallback = 'Не указана') {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default GoalDetailsModal;
