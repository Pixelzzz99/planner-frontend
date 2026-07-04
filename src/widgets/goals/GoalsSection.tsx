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
import { useGoals } from "@/shared/hooks/useGoals";
import { Goal } from "@/entities/goals/model/goal.dto";
import { GoalItem } from "@/entities/goals/ui/GoalItem";
import { Plus, Flame } from "lucide-react";
import { useConfirm } from "@/shared/ui/ConfirmDialog";

export function GoalsSection({ year }: { year: number }) {
  const { goals, isLoading, error, createGoal, updateGoal, deleteGoal } =
    useGoals(year);
  const confirm = useConfirm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState("");

  const handleOpen = (goal: Goal | null = null) => {
    setCurrentGoal(goal);
    setGoalTitle(goal?.title ?? "");
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!goalTitle.trim()) return;
    if (currentGoal) {
      updateGoal({ id: currentGoal.id, goal: { title: goalTitle } });
    } else {
      createGoal(goalTitle);
    }
    setIsDialogOpen(false);
    setGoalTitle("");
    setCurrentGoal(null);
  };

  const completedCount = goals?.filter((g) => g.status === "COMPLETED").length ?? 0;
  const total = goals?.length ?? 0;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="rounded-2xl glass border border-black/8 dark:border-white/8 p-5 h-40 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl glass border border-red-500/30 p-5 text-sm text-destructive">
        Ошибка загрузки целей
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <span className="font-semibold text-sm text-foreground">Цели {year}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-lg hover:bg-primary/15 hover:text-primary"
              onClick={() => handleOpen()}
            >
              <Plus size={16} />
            </Button>
          </div>

          {total > 0 && (
            <>
              <div className="h-1 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #F59E0B, #10B981)",
                  }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {completedCount} из {total} выполнено
              </p>
            </>
          )}
        </div>

        {/* List */}
        <div className="px-2 py-2 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
          {total === 0 ? (
            <div className="py-10 text-center text-muted-foreground/50 text-sm">
              Добавьте первую цель года
            </div>
          ) : (
            goals?.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onUpdate={(newText) => updateGoal({ id: goal.id, goal: { title: newText } })}
                onDelete={async () => {
                  const ok = await confirm({
                    title: "Удалить цель?",
                    description: `«${goal.title}» будет удалена без возможности восстановления.`,
                    confirmLabel: "Удалить",
                    destructive: true,
                  });
                  if (ok) deleteGoal(goal.id);
                }}
                onStatusChange={(value) =>
                  updateGoal({ id: goal.id, goal: { status: value as Goal["status"] } })
                }
              />
            ))
          )}
        </div>

        {total > 0 && (
          <div className="px-2 pb-2.5">
            <Button
              variant="ghost"
              className="w-full h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8 rounded-xl"
              onClick={() => handleOpen()}
            >
              <Plus className="h-3.5 w-3.5" />
              Добавить цель
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {currentGoal ? "Редактировать цель" : "Новая цель"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Название цели"
              className="h-11"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSubmit} disabled={!goalTitle.trim()}>
                {currentGoal ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
