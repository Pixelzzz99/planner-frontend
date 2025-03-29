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
import { Plus } from "lucide-react";

export function GoalsSection() {
  const { goals, isLoading, error, createGoal, updateGoal, deleteGoal } =
    useGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState("");

  const handleSubmit = () => {
    if (currentGoal) {
      updateGoal({ id: currentGoal.id, goal: { title: goalTitle } });
    } else {
      createGoal(goalTitle);
    }
    setIsDialogOpen(false);
    setGoalTitle("");
    setCurrentGoal(null);
  };

  if (isLoading) {
    return (
      <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-md p-6 flex justify-center items-center h-32">
        <div className="animate-pulse text-primary/50">Загрузка...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-md p-6 text-red-500">
        Ошибка загрузки целей
      </div>
    );
  }

  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-md overflow-hidden transition-all">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent px-2">
            Цели
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="hover:bg-accent/50 gap-2 shrink-0 transition-colors rounded-lg group"
          >
            <Plus
              size={16}
              className="text-primary group-hover:scale-110 transition-transform"
            />
            <span>Создать цель</span>
          </Button>
        </div>
      </div>

      <div className="px-2 py-2 divide-y divide-border/50 overflow-y-auto max-h-[calc(100vh-200px)]">
        {goals?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground italic">
            У вас пока нет целей
          </div>
        ) : (
          goals?.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onUpdate={(newText) =>
                updateGoal({ id: goal.id, goal: { title: newText } })
              }
              onDelete={() => deleteGoal(goal.id)}
              onStatusChange={(value) =>
                updateGoal({
                  id: goal.id,
                  goal: { status: value as Goal["status"] },
                })
              }
            />
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {currentGoal ? "Редактировать цель" : "Новая цель"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Название цели"
              className="h-12 transition-all hover:border-primary/50 focus:border-primary"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="hover:bg-background/80"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              className="relative overflow-hidden group"
              disabled={!goalTitle.trim()}
            >
              <span className="relative z-10">
                {currentGoal ? "Сохранить" : "Создать"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
