import { useEffect, useState, type FormEvent } from 'react';
import type { CreateGoalInput, Goal } from '../types';

type GoalFormModalProps = {
  goal?: Goal;
  onClose: () => void;
  onSubmit: (input: CreateGoalInput) => void;
};

type FormErrors = Partial<Record<keyof CreateGoalInput, string>>;

type FormValues = {
  title: string;
  stage: string;
  startDate: string;
  deadline: string;
  todayTask: string;
};

function getTodayDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function GoalFormModal({ goal, onClose, onSubmit }: GoalFormModalProps) {
  const [values, setValues] = useState<FormValues>({
    title: goal?.title ?? '',
    stage: goal?.stage ?? '',
    startDate: goal?.startDate ?? getTodayDate(),
    deadline: goal?.deadline ?? '',
    todayTask: goal?.todayTask ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues({
      title: goal?.title ?? '',
      stage: goal?.stage ?? '',
      startDate: goal?.startDate ?? getTodayDate(),
      deadline: goal?.deadline ?? '',
      todayTask: goal?.todayTask ?? '',
    });
    setErrors({});
  }, [goal]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = values.title.trim();
    const stage = values.stage.trim();
    const startDate = values.startDate.trim();
    const deadline = values.deadline.trim();
    const todayTask = values.todayTask.trim();
    const nextErrors: FormErrors = {};

    if (!title) {
      nextErrors.title = 'Введите название цели';
    }

    if (!stage) {
      nextErrors.stage = 'Введите текущий этап';
    }

    if (!startDate) {
      nextErrors.startDate = 'Выберите дату начала';
    }

    if (deadline && startDate && deadline < startDate) {
      nextErrors.deadline = 'Дедлайн не может быть раньше даты начала';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      title,
      stage,
      startDate,
      ...(deadline ? { deadline } : {}),
      ...(todayTask ? { todayTask } : {}),
    });
  };

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
      <section className="goal-form-modal" role="dialog" aria-modal="true" aria-labelledby="goal-form-title">
        <div className="modal-heading">
          <h2 id="goal-form-title">{goal ? 'Редактировать цель' : 'Новая цель'}</h2>
          <button className="modal-close-button" type="button" aria-label="Закрыть форму" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="goal-title">Название цели</label>
            <input
              id="goal-title"
              type="text"
              value={values.title}
              onChange={(event) => updateValue('title', event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'goal-title-error' : undefined}
              autoFocus
            />
            {errors.title && <span className="field-error" id="goal-title-error">{errors.title}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="goal-stage">Текущий этап</label>
            <input
              id="goal-stage"
              type="text"
              value={values.stage}
              onChange={(event) => updateValue('stage', event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.stage)}
              aria-describedby={errors.stage ? 'goal-stage-error' : undefined}
            />
            {errors.stage && <span className="field-error" id="goal-stage-error">{errors.stage}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="goal-start-date">Дата начала</label>
            <input
              id="goal-start-date"
              type="date"
              value={values.startDate}
              onChange={(event) => updateValue('startDate', event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={errors.startDate ? 'goal-start-date-error' : undefined}
            />
            {errors.startDate && <span className="field-error" id="goal-start-date-error">{errors.startDate}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="goal-deadline">Дедлайн</label>
            <input
              id="goal-deadline"
              type="date"
              value={values.deadline}
              onChange={(event) => updateValue('deadline', event.target.value)}
              aria-invalid={Boolean(errors.deadline)}
              aria-describedby={errors.deadline ? 'goal-deadline-error' : undefined}
            />
            {errors.deadline && <span className="field-error" id="goal-deadline-error">{errors.deadline}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="goal-today-task">Задача на сегодня</label>
            <input
              id="goal-today-task"
              type="text"
              value={values.todayTask}
              onChange={(event) => updateValue('todayTask', event.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Отмена</button>
            <button className="primary-button" type="submit">{goal ? 'Сохранить' : 'Создать цель'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default GoalFormModal;
