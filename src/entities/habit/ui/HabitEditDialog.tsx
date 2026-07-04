"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Habit } from "../models/habit.model";
import { HABIT_COLORS } from "../models/habit-heatmap.model";
import { cn } from "@/lib/utils";

interface HabitEditDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: { title: string; color: string }) => void;
}

export function HabitEditDialog({
  habit,
  open,
  onOpenChange,
  onSave,
}: HabitEditDialogProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>(HABIT_COLORS[0]);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setColor(habit.color || HABIT_COLORS[0]);
    }
  }, [habit]);

  const handleSave = () => {
    if (!habit || !title.trim()) return;
    onSave(habit.id, { title: title.trim(), color });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Редактировать привычку</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
