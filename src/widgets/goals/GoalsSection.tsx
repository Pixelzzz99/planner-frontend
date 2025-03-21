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
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading goals</div>;
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground px-4">Цели</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="hover:bg-accent gap-2 shrink-0"
          >
            <Plus size={16} />
            Создать цель
          </Button>
        </div>
      </div>

      <div className="px-2 py-2 divide-y divide-border overflow-y-auto max-h-[calc(100vh-200px)]">
        {goals?.map((goal) => (
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
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {currentGoal ? "Редактировать цель" : "Новая цель"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Название цели"
              className="h-12"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>
              {currentGoal ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
