import { NotebookText, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Goal, Note } from '../types';

type NotesScreenProps = {
  goals: Goal[];
  notes: Note[];
  onAddNote: () => void;
  onOpenNote: (noteId: number) => void;
  onEditNote: (noteId: number) => void;
  onDeleteNote: (noteId: number) => void;
};

function NotesScreen({ goals, notes, onAddNote, onOpenNote, onEditNote, onDeleteNote }: NotesScreenProps) {
  const sortedNotes = [...notes].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  const getGoalTitle = (goalId?: number) => goals.find((goal) => goal.id === goalId)?.title;

  return (
    <section className="screen" aria-label="Заметки">
      <header className="screen-header screen-header-stacked">
        <div className="notes-heading-row">
          <h1>Заметки</h1>
          <button className="today-add-button" type="button" onClick={onAddNote}><Plus size={18} />Добавить заметку</button>
        </div>
      </header>
      {sortedNotes.length === 0 ? (
        <div className="empty-state empty-state-tall"><NotebookText size={28} /><p>Здесь будут храниться отдельные заметки и записи по целям</p></div>
      ) : (
        <section className="notes-list" aria-label="Список заметок">
          {sortedNotes.map((note) => {
            const goalTitle = getGoalTitle(note.goalId);
            return (
              <article className="note-card" key={note.id} onClick={() => onOpenNote(note.id)}>
                <div className="note-card-main">
                  <h2>{note.title}</h2>
                  <p>{note.content}</p>
                  <div className="note-card-meta"><span>{formatDate(note.updatedAt)}</span>{goalTitle && <span>{goalTitle}</span>}</div>
                </div>
                <div className="note-card-actions" onClick={(event) => event.stopPropagation()}>
                  <button className="task-icon-button" type="button" aria-label={`Редактировать заметку: ${note.title}`} onClick={() => onEditNote(note.id)}><Pencil size={17} /></button>
                  <button className="task-icon-button danger-icon" type="button" aria-label={`Удалить заметку: ${note.title}`} onClick={() => onDeleteNote(note.id)}><Trash2 size={17} /></button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default NotesScreen;