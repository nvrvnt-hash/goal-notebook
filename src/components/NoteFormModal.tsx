import { useEffect, useState, type FormEvent } from 'react';
import type { Goal, Note, NoteInput } from '../types';

type NoteFormModalProps = {
  note?: Note;
  goals: Goal[];
  onClose: () => void;
  onSubmit: (input: NoteInput) => void;
};

type NoteFormValues = {
  title: string;
  content: string;
  goalId: string;
};

function NoteFormModal({ note, goals, onClose, onSubmit }: NoteFormModalProps) {
  const [values, setValues] = useState<NoteFormValues>({
    title: note?.title ?? '',
    content: note?.content ?? '',
    goalId: note?.goalId === undefined ? '' : String(note.goalId),
  });
  const [errors, setErrors] = useState<Partial<Record<'title' | 'content', string>>>({});

  useEffect(() => {
    setValues({
      title: note?.title ?? '',
      content: note?.content ?? '',
      goalId: note?.goalId === undefined ? '' : String(note.goalId),
    });
    setErrors({});
  }, [note]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateValue = (field: keyof NoteFormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = values.title.trim();
    const content = values.content.trim();
    const nextErrors: Partial<Record<'title' | 'content', string>> = {};
    if (!title) nextErrors.title = 'Введите название заметки';
    if (!content) nextErrors.content = 'Введите текст заметки';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      title,
      content,
      ...(values.goalId ? { goalId: Number(values.goalId) } : {}),
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="goal-form-modal note-form-modal" role="dialog" aria-modal="true" aria-labelledby="note-form-title">
        <div className="modal-heading">
          <h2 id="note-form-title">{note ? 'Редактировать заметку' : 'Новая заметка'}</h2>
          <button className="modal-close-button" type="button" aria-label="Закрыть форму" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="note-title">Название заметки</label>
            <input id="note-title" type="text" value={values.title} onChange={(event) => updateValue('title', event.target.value)} aria-invalid={Boolean(errors.title)} autoFocus />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="note-content">Текст заметки</label>
            <textarea id="note-content" value={values.content} onChange={(event) => updateValue('content', event.target.value)} aria-invalid={Boolean(errors.content)} rows={6} />
            {errors.content && <span className="field-error">{errors.content}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="note-goal">Связанная цель</label>
            <select id="note-goal" value={values.goalId} onChange={(event) => updateValue('goalId', event.target.value)}>
              <option value="">Без связи с целью</option>
              {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Отмена</button>
            <button className="primary-button" type="submit">{note ? 'Сохранить' : 'Создать заметку'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default NoteFormModal;