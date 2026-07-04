import { api } from "@/shared/api/api";
import {
  CreateHabitDTO,
  Habit,
  ToggleHabitLogDTO,
} from "../models/habit.model";

export const habitApi = {
  fetchHabits(weekStart?: string) {
    return api
      .get<Habit[]>("/habits", { params: weekStart ? { weekStart } : {} })
      .then((res) => res.data);
  },

  createHabit(data: CreateHabitDTO) {
    return api.post<Habit>("/habits", data).then((res) => res.data);
  },

  updateHabit(id: string, data: Partial<CreateHabitDTO>) {
    return api.patch<Habit>(`/habits/${id}`, data).then((res) => res.data);
  },

  deleteHabit(id: string) {
    return api.delete(`/habits/${id}`).then((res) => res.data);
  },

  toggleLog(id: string, data: ToggleHabitLogDTO) {
    return api.put(`/habits/${id}/log`, data).then((res) => res.data);
  },
};
