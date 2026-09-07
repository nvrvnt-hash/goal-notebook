import { useEffect, useState, type FormEvent } from 'react';
import type { Goal, Task, TaskInput } from '../types';
import { getLocalDateKey } from '../utils/date';

type TaskFormModalProps = {
  task?: Task;
  goals: Goal[];
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
};

type FormValues = {
  title: string;
  goalId: string;
  plannedDate: string;
};

function TaskFormModal({ task, goals, onClose, onSubmit }: TaskFormModalProps) {
  const [values, setValues] = useState<FormValues>({
    title: task?.title ?? '',
    goalId: task?.goalId === undefined ? '' : String(task.goalId),
    plannedDate: task?.plannedDate ?? getLocalDateKey(),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    setValues({
      title: task?.title ?? '',
      goalId: task?.goalId === undefined ? '' : String(task.goalId),
      plannedDate: task?.plannedDate ?? getLocalDateKey(),
    });
    setErrors({});
  }, [task]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = values.title.trim();
    const plannedDate = values.plannedDate.trim();
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!title) nextErrors.title = 'Введите название задачи';
    if (!plannedDate) nextErrors.plannedDate = 'Выберите дату выполнения';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      title,
      plannedDate,
      ...(values.goalId ? { goalId: Number(values.goalId) } : {}),
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="goal-form-modal task-form-modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <div className="modal-heading">
          <h2 id="task-form-title">{task ? 'Редактировать задачу' : 'Новая задача'}</h2>
          <button className="modal-close-button" type="button" aria-label="Закрыть форму" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="task-title">Название задачи</label>
            <input id="task-title" type="text" value={values.title} onChange={(event) => updateValue('title', event.target.value)} aria-invalid={Boolean(errors.title)} autoFocus />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="task-goal">Связанная цель</label>
            <select id="task-goal" value={values.goalId} onChange={(event) => updateValue('goalId', event.target.value)}>
              <option value="">Без связи с целью</option>
              {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="task-date">Дата выполнения</label>
            <input id="task-date" type="date" value={values.plannedDate} onChange={(event) => updateValue('plannedDate', event.target.value)} aria-invalid={Boolean(errors.plannedDate)} />
            {errors.plannedDate && <span className="field-error">{errors.plannedDate}</span>}
          </div>
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Отмена</button>
            <button className="primary-button" type="submit">{task ? 'Сохранить' : 'Создать задачу'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskFormModal;