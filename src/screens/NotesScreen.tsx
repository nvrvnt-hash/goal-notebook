import { NotebookText } from 'lucide-react';

function NotesScreen() {
  return <section className="screen" aria-label="Заметки"><header className="screen-header screen-header-stacked"><h1>Заметки</h1></header><div className="empty-state empty-state-tall"><NotebookText size={28} /><p>Здесь будут храниться отдельные заметки и записи по целям</p></div></section>;
}

export default NotesScreen;