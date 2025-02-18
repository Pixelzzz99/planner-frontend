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
import { useSession } from "next-auth/react";
import { useQuery, QueryClient, useMutation } from "@tanstack/react-query";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "@/entities/goals/api/goal.api";
import { Goal } from "@/entities/goals/model/goal.dto";
import { EditableText } from "@/shared/ui/EditableText";
import { X } from "@mynaui/icons-react";

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
    <div className="border border-gray-200 p-4 rounded-md mb-6 shadow-sm bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Цели</h2>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          + Создать цель
        </Button>
      </div>

      <div className="space-y-3">
        {goals?.map((goal) => (
          <div
            key={goal.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm"
          >
            <div className="flex items-center space-x-2  gap-2">
              <EditableText
                text={goal.title}
                onSave={(newText) =>
                  updateMutation.mutate({
                    id: goal.id,
                    goal: { title: newText },
                  })
                }
              />
              <span className="ml-2 text-xs text-gray-500">
                ({goal.status})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 items-center">
              <Select
                value={goal.status}
                onValueChange={(value) =>
                  updateMutation.mutate({
                    ...goal,
                    status: value as Goal["status"],
                  })
                }
              >
                <SelectTrigger className="w-24" size="sm">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">TODO</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                  <SelectItem value="DONE">DONE</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteMutation.mutate(goal.id)}
              >
                <X />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
