"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Target } from "lucide-react";
import { useHabits } from "../hooks/useHabits";
import { HabitRow } from "./HabitRow";
import { HabitEditDialog } from "./HabitEditDialog";
import { useConfirm } from "@/shared/ui/ConfirmDialog";
import { HABIT_COLORS } from "../models/habit-heatmap.model";
import { Habit } from "../models/habit.model";
import { cn } from "@/lib/utils";

interface HabitsWidgetProps {
  weekStart?: string;
}

export function HabitsWidget({ weekStart }: HabitsWidgetProps) {
  const {
    habits,
    weekDates,
    isLoading,
    createHabit,
    updateHabit,
    toggleHabitLog,
    deleteHabit,
  } = useHabits(weekStart);
  const confirm = useConfirm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>(HABIT_COLORS[0]);

  const handleCreate = () => {
    if (!title.trim()) return;
    createHabit({ title: title.trim(), color });
    setTitle("");
    setColor(HABIT_COLORS[0]);
    setIsDialogOpen(false);
  };

  const handleDeleteHabit = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const ok = await confirm({
      title: "Удалить привычку?",
      description: habit
        ? `«${habit.title}» и все её отметки будут удалены.`
        : "Привычка будет удалена.",
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (ok) deleteHabit(habitId);
  };

  if (!weekStart) return null;

  return (
    <>
      <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Target className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="font-semibold text-sm">Привычки</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus size={16} />
          </Button>
        </div>

        <div className="p-2 space-y-2 max-h-[280px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            </div>
          ) : habits.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground/50">
              Добавьте первую привычку
            </div>
          ) : (
            habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                weekDates={weekDates}
                onToggle={(habitId, date) =>
                  toggleHabitLog({ habitId, date })
                }
                onEdit={setEditingHabit}
                onDelete={handleDeleteHabit}
              />
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Новая привычка</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Читать 20 минут"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform",
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreate} disabled={!title.trim()}>
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <HabitEditDialog
        habit={editingHabit}
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        onSave={(id, data) => updateHabit({ id, data })}
      />
    </>
  );
}
