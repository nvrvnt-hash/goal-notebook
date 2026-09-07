import { useState } from 'react';
import BottomNavigation, { type Section } from './components/BottomNavigation';
import GoalDetailsModal from './components/GoalDetailsModal';
import GoalFormModal from './components/GoalFormModal';
import TaskFormModal from './components/TaskFormModal';
import GoalsScreen from './screens/GoalsScreen';
import NotesScreen from './screens/NotesScreen';
import SummaryScreen from './screens/SummaryScreen';
import TodayScreen from './screens/TodayScreen';
import { loadGoals, saveGoals } from './storage/goalsStorage';
import { loadTasks, saveTasks } from './storage/tasksStorage';
import type { CreateGoalInput, Goal, Task, TaskInput } from './types';

function App() {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(loadGoals()));
  const [activeSection, setActiveSection] = useState<Section>('goals');
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

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

  const createTask = (input: TaskInput) => {
    const nextId = tasks.length === 0 ? 1 : Math.max(...tasks.map((task) => task.id)) + 1;
    const newTask: Task = {
      id: nextId,
      title: input.title,
      plannedDate: input.plannedDate,
      completed: false,
      createdAt: new Date().toISOString(),
      ...(input.goalId === undefined ? {} : { goalId: input.goalId }),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setIsTaskFormOpen(false);
    setEditingTaskId(null);
  };

  const updateTask = (input: TaskInput) => {
    if (editingTaskId === null) return;
    const updatedTasks = tasks.map((task) => task.id === editingTaskId
      ? { ...task, title: input.title, plannedDate: input.plannedDate, ...(input.goalId === undefined ? { goalId: undefined } : { goalId: input.goalId }) }
      : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setIsTaskFormOpen(false);
    setEditingTaskId(null);
  };

  const toggleTask = (taskId: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      if (task.completed) {
        const { completedAt: _completedAt, ...taskWithoutCompletionDate } = task;
        return { ...taskWithoutCompletionDate, completed: false };
      }
      return { ...task, completed: true, completedAt: new Date().toISOString() };
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
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
        return (
          <TodayScreen
            goals={goals}
            tasks={tasks}
            onAddTask={() => { setEditingTaskId(null); setIsTaskFormOpen(true); }}
            onEditTask={(taskId) => { setEditingTaskId(taskId); setIsTaskFormOpen(true); }}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
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
            tasks={tasks}
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
          tasks={tasks}
        />
      )}
      {isTaskFormOpen && (editingTaskId === null || tasks.some((task) => task.id === editingTaskId)) && (
        <TaskFormModal
          task={editingTaskId === null ? undefined : tasks.find((task) => task.id === editingTaskId)}
          goals={goals}
          onClose={() => { setIsTaskFormOpen(false); setEditingTaskId(null); }}
          onSubmit={editingTaskId === null ? createTask : updateTask}
        />
      )}
    </main>
  );
}

export default App;
