"use client";
import { useState } from "react";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "@/entities/goals/api/goal.api";
import { useQuery, QueryClient, useMutation } from "@tanstack/react-query";
import { Goal } from "@/entities/goals/model/goal.dto";
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
import { useSession } from "next-auth/react";

const queryClient = new QueryClient();

export function GoalsSection() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    data: goals,
    isLoading,
    error,
  } = useQuery<Goal[]>({
    queryKey: ["goals", userId],
    queryFn: () => fetchGoals(userId!),
    enabled: Boolean(userId),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState("");

  const createMutation = useMutation({
    mutationFn: (title: string) => createGoal(userId!, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; goal: Partial<Goal> }) =>
      updateGoal(data.id, data.goal),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["goals", userId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["goals", userId] }),
  });

  const handleSubmit = () => {
    if (currentGoal) {
      updateMutation.mutate({ id: currentGoal.id, goal: { title: goalTitle } });
    } else {
      createMutation.mutate(goalTitle);
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
    <div className="border p-4 rounded-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Цели</h2>
        <Button onClick={() => setIsDialogOpen(true)}>+ Создать цель</Button>
      </div>

      <div className="space-y-2">
        {goals?.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
          >
            <div className="flex-1">
              <span className="font-medium">{goal.title}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({goal.status})
              </span>
            </div>

            <div className="flex gap-2">
              <Select
                value={goal.status}
                onValueChange={(value) =>
                  updateMutation.mutate({
                    ...goal,
                    status: value as Goal["status"],
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">TODO</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                  <SelectItem value="DONE">DONE</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setCurrentGoal(goal);
                  setGoalTitle(goal.title);
                  setIsDialogOpen(true);
                }}
              >
                Редактировать
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(goal.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
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
