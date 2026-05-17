import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog } from '../types';

const HABITS_KEY = 'habit_tracker:habits';
const LOGS_KEY = 'habit_tracker:logs';

// ── Habits ────────────────────────────────────────────────────────────────────

export async function getHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function getLogs(): Promise<HabitLog[]> {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveLogs(logs: HabitLog[]): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([HABITS_KEY, LOGS_KEY]);
}
