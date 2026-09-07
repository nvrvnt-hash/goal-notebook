import type { Note } from '../types';

const NOTES_STORAGE_KEY = 'goal-notebook.notes';

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const note = value as Record<string, unknown>;
  return (
    isPositiveSafeInteger(note.id) &&
    typeof note.title === 'string' &&
    note.title.trim().length > 0 &&
    typeof note.content === 'string' &&
    note.content.trim().length > 0 &&
    (note.goalId === undefined || isPositiveSafeInteger(note.goalId)) &&
    isValidDateString(note.createdAt) &&
    isValidDateString(note.updatedAt)
  );
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
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