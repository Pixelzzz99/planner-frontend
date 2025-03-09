import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Task } from "../models/task.model";

interface TaskCardProps {
  task: Task;
  containerId: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  containerId,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: "Task",
      task,
      container: containerId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        group p-3 w-full
        rounded-lg hover:bg-accent border border-border mb-auto
        ${isDragging ? "opacity-50" : ""}
        ${task.status === "COMPLETED" ? "opacity-60" : ""}
        bg-background
      `}
    >
      <div className="flex gap-3 w-full">
        <div className="flex items-center text-gray-400 hover:text-gray-600">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-1 select-text">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-foreground line-clamp-2 select-text">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                task.status === "COMPLETED"
                  ? "bg-green-500"
                  : task.status === "IN_PROGRESS"
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-xs text-gray-500">
              {task.status === "COMPLETED"
                ? "Завершено"
                : task.status === "IN_PROGRESS"
                ? "В работе"
                : "К выполнению"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
