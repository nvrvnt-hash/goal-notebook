import { CirclePlus, ClipboardCheck, FileText, Flag, NotebookText } from 'lucide-react';

export type Section = 'goals' | 'today' | 'notes' | 'summary';

type BottomNavigationProps = {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onAdd: () => void;
};

const navigationItems: Array<{ section: Section; label: string }> = [
  { section: 'goals', label: 'Цели' },
  { section: 'today', label: 'Сегодня' },
  { section: 'notes', label: 'Заметки' },
  { section: 'summary', label: 'Итоги' },
];

const navigationIcons = {
  goals: Flag,
  today: ClipboardCheck,
  notes: NotebookText,
  summary: FileText,
};

function BottomNavigation({ activeSection, onSectionChange, onAdd }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {navigationItems.slice(0, 2).map((item) => {
        const Icon = navigationIcons[item.section];
        const isActive = item.section === activeSection;

        return (
          <button
            className={isActive ? 'nav-item active' : 'nav-item'}
            key={item.section}
            type="button"
            onClick={() => onSectionChange(item.section)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={21} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button className="add-button" type="button" aria-label="Добавить" onClick={onAdd}>
        <CirclePlus size={34} strokeWidth={1.9} />
      </button>
      {navigationItems.slice(2).map((item) => {
        const Icon = navigationIcons[item.section];
        const isActive = item.section === activeSection;

        return (
          <button
            className={isActive ? 'nav-item active' : 'nav-item'}
            key={item.section}
            type="button"
            onClick={() => onSectionChange(item.section)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={21} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;