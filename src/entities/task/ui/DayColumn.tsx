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
    <Droppable droppableId={String(day.id)} type="task">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-shrink-0 w-[300px] bg-card rounded-xl shadow-sm border border-border min-h-[200px]
            ${snapshot.isDraggingOver ? "bg-accent/50" : ""}
          `}
        >
          <div className="p-4 border-b border-border w-full">
            <h2 className="font-semibold text-gray-700 text-center">
              {day.label}
            </h2>
          </div>

          <div className="p-3 w-full">
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

          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
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
