import { Droppable } from "@hello-pangea/dnd";
import { Archive } from "lucide-react";
import { Task } from "../models/task.model";
import { TaskCard } from "./TaskCard";

interface TaskArchiveProps {
  tasks: Task[];
  isLoading?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskArchive({
  tasks,
  isLoading,
  onEditTask,
  onDeleteTask,
}: TaskArchiveProps) {
  return (
    <Droppable droppableId="-1" type="task">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-shrink-0 w-[300px] bg-card rounded-xl shadow-sm border border-border min-h-[200px]
            ${snapshot.isDraggingOver ? "bg-accent/50" : ""}
          `}
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <h2 className="font-semibold text-gray-700">Архив</h2>
              </div>
              {isLoading && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
          </div>

          <div className="p-3">
            <div className="space-y-3">
              {tasks?.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );
}
