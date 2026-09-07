import { useEffect, useState } from 'react';
import BottomNavigation, { type Section } from './components/BottomNavigation';
import GoalDetailsModal from './components/GoalDetailsModal';
import GoalFormModal from './components/GoalFormModal';
import TaskFormModal from './components/TaskFormModal';
import GoalsScreen from './screens/GoalsScreen';
import NotesScreen from './screens/NotesScreen';
import SummaryScreen from './screens/SummaryScreen';
import TodayScreen from './screens/TodayScreen';
import { loadGoals, saveGoals } from './storage/goalsStorage';
import { loadTasks, moveOverdueTasks, saveTasks } from './storage/tasksStorage';
import type { CreateGoalInput, Goal, Task, TaskInput } from './types';
import { getLocalDateKey } from './utils/date';

function App() {
  const [initialData] = useState(() => {
    const initialGoals = loadGoals();
    return { goals: initialGoals, tasks: loadTasks(initialGoals) };
  });
  const [goals, setGoals] = useState<Goal[]>(initialData.goals);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [currentDate, setCurrentDate] = useState(() => getLocalDateKey());
  const [activeSection, setActiveSection] = useState<Section>('goals');
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    const refreshDateAndTasks = () => {
      const nextDate = getLocalDateKey();
      setCurrentDate(nextDate);
      setTasks((currentTasks) => {
        const updatedTasks = moveOverdueTasks(currentTasks, nextDate);
        const changed = updatedTasks.some((task, index) => task.plannedDate !== currentTasks[index].plannedDate);
        if (changed) saveTasks(updatedTasks);
        return updatedTasks;
      });
    };

    let timerId: number | undefined;
    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      timerId = window.setTimeout(() => {
        refreshDateAndTasks();
        scheduleNextMidnight();
      }, Math.max(250, nextMidnight.getTime() - now.getTime() + 50));
    };

    scheduleNextMidnight();
    window.addEventListener('focus', refreshDateAndTasks);
    document.addEventListener('visibilitychange', refreshDateAndTasks);
    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
      window.removeEventListener('focus', refreshDateAndTasks);
      document.removeEventListener('visibilitychange', refreshDateAndTasks);
    };
  }, []);

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
    setTasks((currentTasks) => {
      const nextId = currentTasks.length === 0 ? 1 : Math.max(...currentTasks.map((task) => task.id)) + 1;
      const newTask: Task = { id: nextId, title: input.title, plannedDate: input.plannedDate, completed: false, createdAt: new Date().toISOString(), ...(input.goalId === undefined ? {} : { goalId: input.goalId }) };
      const updatedTasks = [...currentTasks, newTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });
    setIsTaskFormOpen(false);
    setEditingTaskId(null);
  };

  const updateTask = (input: TaskInput) => {
    if (editingTaskId === null) return;
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.map((task) => task.id === editingTaskId
        ? { ...task, title: input.title, plannedDate: input.plannedDate, ...(input.goalId === undefined ? { goalId: undefined } : { goalId: input.goalId }) }
        : task);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
    setIsTaskFormOpen(false);
    setEditingTaskId(null);
  };

  const toggleTask = (taskId: number) => {
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.map((task) => {
        if (task.id !== taskId) return task;
        if (task.completed) {
          const { completedAt: _completedAt, ...taskWithoutCompletionDate } = task;
          return { ...taskWithoutCompletionDate, completed: false };
        }
        return { ...task, completed: true, completedAt: new Date().toISOString() };
      });
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  };

  const deleteTask = (taskId: number) => {
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.filter((task) => task.id !== taskId);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
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
            currentDate={currentDate}
            onAddTask={() => { setEditingTaskId(null); setIsTaskFormOpen(true); }}
            onEditTask={(taskId) => { setEditingTaskId(taskId); setIsTaskFormOpen(true); }}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'notes':
        return <NotesScreen />;
      case 'summary':
        return <SummaryScreen goals={goals} currentDate={currentDate} />;
      case 'goals':
      default:
        return (
          <GoalsScreen
            goals={goals}
            onAddProgress={addProgress}
            onOpenSummary={() => setActiveSection('summary')}
            onOpenGoal={setSelectedGoalId}
            tasks={tasks}
            currentDate={currentDate}
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
          currentDate={currentDate}
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
