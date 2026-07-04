export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  color?: string | null;
  createdAt: string;
  logs?: HabitLog[];
  streak?: number;
}

export interface CreateHabitDTO {
  title: string;
  color?: string;
}

export interface ToggleHabitLogDTO {
  date: string;
}
