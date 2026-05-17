// Central type definitions for the Habit Tracker app

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[]; // 0=Sun, 1=Mon, ... 6=Sat (for custom/weekly)
  createdAt: string; // ISO date string
  archivedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string; // ISO date string
  note?: string;
}

export interface AppState {
  habits: Habit[];
  logs: HabitLog[];
}
