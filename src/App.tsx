import { useState } from 'react';
import BottomNavigation, { type Section } from './components/BottomNavigation';
import GoalDetailsModal from './components/GoalDetailsModal';
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
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

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
    setEditingGoalId(null);
    setActiveSection('goals');
  };

  const updateGoal = (input: CreateGoalInput) => {
    if (editingGoalId === null) {
      return;
    }

    const updatedGoals = goals.map((goal) =>
      goal.id === editingGoalId
        ? {
            ...goal,
            title: input.title,
            stage: input.stage,
            startDate: input.startDate,
            ...(input.deadline ? { deadline: input.deadline } : { deadline: undefined }),
            ...(input.todayTask ? { todayTask: input.todayTask } : { todayTask: undefined }),
          }
        : goal,
    );
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    setIsGoalFormOpen(false);
    setEditingGoalId(null);
    setSelectedGoalId(null);
    setActiveSection('goals');
  };

  const deleteGoal = () => {
    if (selectedGoalId === null) {
      return;
    }

    const updatedGoals = goals.filter((goal) => goal.id !== selectedGoalId);
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    setSelectedGoalId(null);
  };

  const selectedGoal = selectedGoalId === null ? undefined : goals.find((goal) => goal.id === selectedGoalId);
  const editingGoal = editingGoalId === null ? undefined : goals.find((goal) => goal.id === editingGoalId);

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
        return (
          <GoalsScreen
            goals={goals}
            onAddProgress={addProgress}
            onOpenSummary={() => setActiveSection('summary')}
            onOpenGoal={setSelectedGoalId}
          />
        );
    }
  };

  return (
    <main className="app-shell">
      {renderActiveScreen()}
      <BottomNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onAdd={() => {
          setEditingGoalId(null);
          setIsGoalFormOpen(true);
        }}
      />
      {isGoalFormOpen && (editingGoalId === null || editingGoal) && (
        <GoalFormModal
          goal={editingGoal}
          onClose={() => {
            setIsGoalFormOpen(false);
            setEditingGoalId(null);
          }}
          onSubmit={editingGoalId === null ? addGoal : updateGoal}
        />
      )}
      {selectedGoal && !isGoalFormOpen && (
        <GoalDetailsModal
          goal={selectedGoal}
          onClose={() => setSelectedGoalId(null)}
          onEdit={() => {
            setEditingGoalId(selectedGoal.id);
            setSelectedGoalId(null);
            setIsGoalFormOpen(true);
          }}
          onDelete={deleteGoal}
        />
      )}
    </main>
  );
}

export default App;
