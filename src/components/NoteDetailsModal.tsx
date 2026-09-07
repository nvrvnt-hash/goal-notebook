import { useEffect, useState } from 'react';
import type { Goal, Note } from '../types';

type NoteDetailsModalProps = {
  note: Note;
  goals: Goal[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  initialDeleteConfirmation?: boolean;
};

function NoteDetailsModal({ note, goals, onClose, onEdit, onDelete, initialDeleteConfirmation = false }: NoteDetailsModalProps) {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(initialDeleteConfirmation);
  const goalTitle = goals.find((goal) => goal.id === note.goalId)?.title;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop note-details-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="note-details-modal" role="dialog" aria-modal="true" aria-labelledby="note-details-title">
        <div className="modal-heading">
          <h2 id="note-details-title">{note.title}</h2>
          <button className="modal-close-button" type="button" aria-label="Закрыть заметку" onClick={onClose}>×</button>
        </div>
        <div className="note-details-meta">
          <span>Создана: {formatDate(note.createdAt)}</span>
          <span>Изменена: {formatDate(note.updatedAt)}</span>
          {goalTitle && <span>Цель: {goalTitle}</span>}
        </div>
        <div className="note-details-content">{note.content}</div>
        {isDeleteConfirmationOpen ? (
          <div className="delete-confirmation" role="alertdialog" aria-labelledby="delete-note-title">
            <strong id="delete-note-title">Удалить заметку? Это действие нельзя отменить</strong>
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

function formatDate(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return 'Дата не указана';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(timestamp));
}

export default NoteDetailsModal;