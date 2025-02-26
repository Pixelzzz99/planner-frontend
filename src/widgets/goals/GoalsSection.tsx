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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals } from "@/shared/hooks/useGoals";
import { Goal } from "@/entities/goals/model/goal.dto";
import { EditableText } from "@/shared/ui/EditableText";
import { X } from "lucide-react";

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
    <div className="border border-gray-200 p-4 rounded-md mb-6 shadow-sm bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Цели</h2>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          + Создать цель
        </Button>
      </div>

      <div className="space-y-3">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentGoal ? "Редактировать цель" : "Новая цель"}
            </DialogTitle>
          </DialogHeader>

          <Input
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="Название цели"
          />

          <div className="flex justify-end gap-2">
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

function GoalItem({
  goal,
  onUpdate,
  onDelete,
  onStatusChange,
}: {
  goal: Goal;
  onUpdate: (newText: string) => void;
  onDelete: () => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
      <div className="flex items-center space-x-2 gap-2">
        <EditableText text={goal.title} onSave={onUpdate} />
        <span className="ml-2 text-xs text-gray-500">({goal.status})</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 items-center">
        <Select value={goal.status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-24 h-8 text-sm">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">TODO</SelectItem>
            <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" variant="destructive" onClick={onDelete}>
          <X />
        </Button>
      </div>
    </div>
  );
}
