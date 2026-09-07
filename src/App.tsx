import { useState } from 'react';
import BottomNavigation, { type Section } from './components/BottomNavigation';
import GoalsScreen from './screens/GoalsScreen';
import NotesScreen from './screens/NotesScreen';
import SummaryScreen from './screens/SummaryScreen';
import TodayScreen from './screens/TodayScreen';
import { loadGoals, saveGoals } from './storage/goalsStorage';
import type { Goal } from './types';

function App() {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [activeSection, setActiveSection] = useState<Section>('goals');

  const addProgress = (goalId: number, amount: number) => {
    setGoals((currentGoals) => {
      const updatedGoals = currentGoals.map((goal) =>
        goal.id === goalId ? { ...goal, progress: Math.min(goal.progress + amount, 100) } : goal,
      );
      saveGoals(updatedGoals);
      return updatedGoals;
    });
  };

  const renderActiveScreen = () => {
    switch (activeSection) {
      case 'today':
        return <TodayScreen goals={goals} />;
      case 'notes':
        return <NotesScreen />;
      case 'summary':
        return <SummaryScreen goals={goals} />;
      case 'goals':
      default:
        return <GoalsScreen goals={goals} onAddProgress={addProgress} onOpenSummary={() => setActiveSection('summary')} />;
    }
  };

  return (
    <main className="app-shell">
      {renderActiveScreen()}
      <BottomNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
    </main>
  );
}

export default App;
