import { Droppable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Task } from "../models/task.model";
import React from "react";

interface DayColumnProps {
  day: { id: number; label: string; tasks: Task[] };
  onAddTask: (day: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function DayColumn({
  day,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: DayColumnProps) {
  return (
    <Droppable droppableId={String(day.id)}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="w-[280px] flex-shrink-0 bg-card rounded-xl shadow-sm border border-border hover:border-border/80 transition-colors"
          style={{
            backgroundColor: snapshot.isDraggingOver
              ? "hsl(var(--accent))"
              : "",
          }}
        >
          <div className="p-4 border-b border-border/40 w-full bg-gray-50/80 dark:bg-card/80 rounded-t-xl">
            <h2 className="font-semibold text-foreground/80 text-center">
              {day.label}
            </h2>
          </div>

          <div className="p-3 w-full min-h-[100px]">
            <div className="space-y-3 w-full">
              {day.tasks.map((task, index) => (
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

          <div className="p-3 border-t border-border/40 bg-gray-50/80 dark:bg-card/80 rounded-b-xl">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => onAddTask(day.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить задачу
            </Button>
          </div>
        </div>
      )}
    </Droppable>
  );
}
