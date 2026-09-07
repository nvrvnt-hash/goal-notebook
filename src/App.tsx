import { useState } from 'react';
import BottomNavigation, { type Section } from './components/BottomNavigation';
import GoalFormModal from './components/GoalFormModal';
import GoalsScreen from './screens/GoalsScreen';
import NotesScreen from './screens/NotesScreen';
import SummaryScreen from './screens/SummaryScreen';
import TodayScreen from './screens/TodayScreen';
import { loadGoals, saveGoals } from './storage/goalsStorage';
import type { CreateGoalInput, Goal } from './types';

function App() {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [activeSection, setActiveSection] = useState<Section>('goals');
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  const addProgress = (goalId: number, amount: number) => {
    setGoals((currentGoals) => {
      const updatedGoals = currentGoals.map((goal) =>
        goal.id === goalId ? { ...goal, progress: Math.min(goal.progress + amount, 100) } : goal,
      );
      saveGoals(updatedGoals);
      return updatedGoals;
    });
  };

  const addGoal = (input: CreateGoalInput) => {
    const nextId =
      goals.length === 0
        ? 1
        : Math.max(...goals.map((goal) => goal.id)) + 1;
    const newGoal: Goal = {
      id: nextId,
      title: input.title,
      stage: input.stage,
      progress: 0,
      startDate: input.startDate,
      ...(input.deadline ? { deadline: input.deadline } : {}),
      ...(input.todayTask ? { todayTask: input.todayTask } : {}),
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    setIsGoalFormOpen(false);
    setActiveSection('goals');
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
      <BottomNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onAdd={() => setIsGoalFormOpen(true)}
      />
      {isGoalFormOpen && (
        <GoalFormModal onClose={() => setIsGoalFormOpen(false)} onCreate={addGoal} />
      )}
    </main>
  );
}

export default App;
