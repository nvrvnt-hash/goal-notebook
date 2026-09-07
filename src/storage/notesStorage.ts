import type { Note } from '../types';

const NOTES_STORAGE_KEY = 'goal-notebook.notes';

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const note = value as Record<string, unknown>;
  return (
    typeof note.id === 'number' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    (note.goalId === undefined || typeof note.goalId === 'number') &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  );
}

function cloneNotes(notes: Note[]): Note[] {
  return notes.map((note) => ({ ...note }));
}

export function loadNotes(): Note[] {
  try {
    const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!storedNotes) {
      return [];
    }

    const parsedNotes: unknown = JSON.parse(storedNotes);
    return Array.isArray(parsedNotes) && parsedNotes.every(isNote) ? cloneNotes(parsedNotes) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(cloneNotes(notes)));
  } catch {
    // Keep the in-memory interface usable when localStorage is unavailable.
  }
}