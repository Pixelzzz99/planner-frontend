"uce client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Task {
  id: number;
  title: string;
  description?: string;
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        {task.description && (
          <CardDescription>{task.description}</CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
