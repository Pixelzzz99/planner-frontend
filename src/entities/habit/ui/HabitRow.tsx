"use client";

import { Habit } from "../models/habit.model";
import { Flame, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HabitRowProps {
  habit: Habit;
  weekDates: string[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function HabitRow({
  habit,
  weekDates,
  onToggle,
  onEdit,
  onDelete,
}: HabitRowProps) {
  const completedDates = new Set(
    (habit.logs ?? [])
      .filter((log) => log.completed)
      .map((log) => new Date(log.date).toISOString().slice(0, 10)),
  );

  return (
    <div className="rounded-xl border border-black/6 dark:border-white/6 p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color || "#10B981" }}
          />
          <span className="text-sm font-medium truncate">{habit.title}</span>
          {(habit.streak ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-500 font-semibold">
              <Flame className="h-3 w-3" />
              {habit.streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => onEdit(habit)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground"
            onClick={() => onDelete(habit.id)}
          >
            Удалить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, index) => {
          const checked = completedDates.has(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => onToggle(habit.id, date)}
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 transition-colors ${
                checked
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-black/4 dark:bg-white/6 text-muted-foreground hover:bg-primary/10"
              }`}
            >
              <span className="text-[9px] font-medium">{DAY_LABELS[index]}</span>
              <span
                className={`h-3.5 w-3.5 rounded border ${
                  checked
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-black/15 dark:border-white/20"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
