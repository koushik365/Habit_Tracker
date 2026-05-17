import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog } from '../types';
import { getHabits, saveHabits, getLogs, saveLogs } from '../store/storage';
import { generateId } from '../utils/helpers';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      const [storedHabits, storedLogs] = await Promise.all([getHabits(), getLogs()]);
      setHabits(storedHabits);
      setLogs(storedLogs);
      setLoading(false);
    })();
  }, []);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    await saveHabits(updated);
    return newHabit;
  }, [habits]);

  const updateHabit = useCallback(async (id: string, changes: Partial<Habit>) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, ...changes } : h));
    setHabits(updated);
    await saveHabits(updated);
  }, [habits]);

  const deleteHabit = useCallback(async (id: string) => {
    const updatedHabits = habits.filter((h) => h.id !== id);
    const updatedLogs = logs.filter((l) => l.habitId !== id);
    setHabits(updatedHabits);
    setLogs(updatedLogs);
    await Promise.all([saveHabits(updatedHabits), saveLogs(updatedLogs)]);
  }, [habits, logs]);

  const toggleLog = useCallback(async (habitId: string, date: string) => {
    const existing = logs.find(
      (l) => l.habitId === habitId && l.completedAt.startsWith(date)
    );
    let updatedLogs: HabitLog[];
    if (existing) {
      updatedLogs = logs.filter((l) => l.id !== existing.id);
    } else {
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        completedAt: new Date(`${date}T00:00:00.000Z`).toISOString(),
      };
      updatedLogs = [...logs, newLog];
    }
    setLogs(updatedLogs);
    await saveLogs(updatedLogs);
  }, [logs]);

  const isCompletedOn = useCallback(
    (habitId: string, date: string) =>
      logs.some((l) => l.habitId === habitId && l.completedAt.startsWith(date)),
    [logs]
  );

  return { habits, logs, loading, addHabit, updateHabit, deleteHabit, toggleLog, isCompletedOn };
}
