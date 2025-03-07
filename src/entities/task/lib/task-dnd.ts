import { TaskCache } from "./task-cache";
import { DragUpdate } from "@hello-pangea/dnd";

export class TaskDragAndDrop {
  constructor(
    private cache: TaskCache,
    private moveTask: (taskId: string, data: any) => void,
    private weekId: string
  ) {}

  updateTaskPosition(taskId: string, destinationDay: number, index: number) {
    const weekTasks = this.cache.getTaskState().weekTasks;
    const task = weekTasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = weekTasks
      .filter((t) => t.id !== taskId)
      .map((t) => ({ ...t, day: t.day }));

    updatedTasks.splice(index, 0, {
      ...task,
      day: destinationDay,
    });

    this.cache.updateWeekTasks(() => updatedTasks);
  }

  handleDragUpdate(update: DragUpdate) {
    if (!update.destination) return;

    const { source, destination, draggableId: taskId } = update;
    const sourceDay = parseInt(source.droppableId);
    const destinationDay = parseInt(destination.droppableId);

    if (!isNaN(sourceDay) && !isNaN(destinationDay)) {
      this.updateTaskPosition(taskId, destinationDay, destination.index);
    }
  }

  // ... остальные методы для drag-and-drop
}
