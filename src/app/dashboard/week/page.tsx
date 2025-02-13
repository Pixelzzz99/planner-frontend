"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Условные дни недели
const initialDays = [
  { id: "mon", label: "Пн", tasks: [] },
  { id: "tue", label: "Вт", tasks: [] },
  { id: "wed", label: "Ср", tasks: [] },
  { id: "thu", label: "Чт", tasks: [] },
  { id: "fri", label: "Пт", tasks: [] },
  { id: "sat", label: "Сб", tasks: [] },
  { id: "sun", label: "Вс", tasks: [] },
];

// Пример начальных задач
const initialTasks = [
  {
    id: "task-1",
    title: "Задача #1",
    description: "Описание задачи 1",
    done: false,
    dayId: "mon",
  },
  {
    id: "task-2",
    title: "Задача #2",
    description: "Описание задачи 2",
    done: false,
    dayId: "mon",
  },
  {
    id: "task-3",
    title: "Задача #3",
    description: "Описание задачи 3",
    done: true,
    dayId: "tue",
  },
];

export default function WeekPage() {
  // Можно взять weekId из query (например, ?weekId=123)
  const searchParams = useSearchParams();
  const weekId = searchParams.get("weekId");

  // days: 7 дней (колонки). Заполним их начальными задачами
  const [days, setDays] = useState(() => {
    const clonedDays = structuredClone(initialDays) as typeof initialDays;
    for (const task of initialTasks) {
      const day = clonedDays.find((d) => d.id === task.dayId);
      if (day) {
        day.tasks.push(task);
      }
    }
    return clonedDays;
  });

  // Архив задач (в реальном проекте могли бы грузить с бэка)
  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);

  // Управляем состоянием модалки
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Форма задачи
  const [taskForm, setTaskForm] = useState({
    id: "",
    dayId: "",
    title: "",
    description: "",
    done: false,
  });

  /**
   * Открываем модалку для СОЗДАНИЯ задачи.
   */
  const handleOpenAddTaskModal = (dayId: string) => {
    setTaskForm({
      id: "", // пустой => новая
      dayId,
      title: "",
      description: "",
      done: false,
    });
    setIsModalOpen(true);
  };

  /**
   * Открываем модалку для РЕДАКТИРОВАНИЯ задачи.
   */
  const handleOpenEditTaskModal = (task: any) => {
    setTaskForm({
      id: task.id,
      dayId: task.dayId,
      title: task.title,
      description: task.description,
      done: task.done,
    });
    setIsModalOpen(true);
  };

  /**
   * Сохранение формы (Create / Edit).
   */
  const handleSubmitForm = () => {
    // Если id пустой, значит новая задача
    if (!taskForm.id) {
      const newTask = {
        ...taskForm,
        id: "task-" + Date.now(),
      };

      setDays((prev) =>
        prev.map((day) => {
          if (day.id === newTask.dayId) {
            return { ...day, tasks: [...day.tasks, newTask] };
          }
          return day;
        })
      );
    } else {
      // Редактирование существующей
      const updatedDays = structuredClone(days) as typeof days;

      // 1) Удаляем из старого day
      for (const day of updatedDays) {
        const idx = day.tasks.findIndex((t) => t.id === taskForm.id);
        if (idx !== -1) {
          day.tasks.splice(idx, 1);
          break;
        }
      }

      // 2) Добавляем (обновлённую) задачу в текущий dayId
      const newTask = {
        id: taskForm.id,
        title: taskForm.title,
        description: taskForm.description,
        done: taskForm.done,
        dayId: taskForm.dayId,
      };

      const targetDay = updatedDays.find((d) => d.id === newTask.dayId);
      if (targetDay) {
        targetDay.tasks.push(newTask);
      }

      setDays(updatedDays);
    }

    setIsModalOpen(false);
  };

  /**
   * Отправить задачу в Архив (внутри модалки).
   */
  const handleArchiveTask = () => {
    if (!taskForm.id) {
      // Если задача новая, она ещё не создана
      // Можно сразу поместить в archivedTasks, если так задумано
      const newArchived = {
        id: "task-" + Date.now(),
        title: taskForm.title || "Без названия",
        description: taskForm.description,
        done: taskForm.done,
      };
      setArchivedTasks((prev) => [...prev, newArchived]);
    } else {
      // Ищем задачу среди days, удаляем её
      const updatedDays = structuredClone(days) as typeof days;

      for (const day of updatedDays) {
        const idx = day.tasks.findIndex((t) => t.id === taskForm.id);
        if (idx !== -1) {
          // Берём задачу
          const [foundTask] = day.tasks.splice(idx, 1);
          // Архивируем
          setArchivedTasks((prev) => [
            ...prev,
            {
              id: foundTask.id,
              title: foundTask.title,
              description: foundTask.description,
              done: foundTask.done,
            },
          ]);
          break;
        }
      }
      setDays(updatedDays);
    }

    // Закрыть модалку
    setIsModalOpen(false);
  };

  /**
   * Обработчик DnD
   */
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedDays = structuredClone(days) as typeof days;

    const sourceDay = updatedDays.find((d) => d.id === source.droppableId);
    const destDay = updatedDays.find((d) => d.id === destination.droppableId);
    if (!sourceDay || !destDay) return;

    const [movedTask] = sourceDay.tasks.splice(source.index, 1);
    destDay.tasks.splice(destination.index, 0, movedTask);
    movedTask.dayId = destDay.id;

    setDays(updatedDays);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Неделя (ID: {weekId ?? "не указано"})
      </h1>

      {/* Колонки с днями и задачами */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-auto mb-8">
          {days.map((day) => (
            <Droppable key={day.id} droppableId={day.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-64 min-w-[16rem] p-2 border rounded-md flex-shrink-0 transition-colors ${
                    snapshot.isDraggingOver ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <h2 className="font-semibold text-center mb-2">
                    {day.label}
                  </h2>

                  {day.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`p-2 mb-2 rounded-md bg-gray-100 transition-colors cursor-pointer ${
                            dragSnapshot.isDragging ? "bg-gray-200" : ""
                          }`}
                          onClick={() => handleOpenEditTaskModal(task)}
                        >
                          <div className="text-sm font-semibold">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {task.description}
                          </div>
                          <div className="text-xs mt-1">
                            Статус: {task.done ? "Сделано" : "Не сделано"}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleOpenAddTaskModal(day.id)}
                  >
                    + Задача
                  </Button>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Блок Архива задач */}
      <div className="border p-3 rounded-md">
        <h2 className="font-semibold mb-2 text-lg">Архив задач</h2>
        {archivedTasks.length === 0 && (
          <div className="text-gray-500 text-sm">Архив пуст</div>
        )}
        {archivedTasks.map((task) => (
          <div
            key={task.id}
            className="p-2 mb-2 bg-gray-100 rounded-md text-sm"
          >
            <div className="font-semibold">{task.title}</div>
            <div className="text-xs text-gray-600">{task.description}</div>
            <div className="text-xs mt-1">
              Статус: {task.done ? "Сделано" : "Не сделано"}
            </div>
          </div>
        ))}
      </div>

      {/* Модалка для Создания/Редактирования задачи */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {taskForm.id ? "Редактировать задачу" : "Новая задача"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Название */}
            <div>
              <Label htmlFor="title">Название задачи</Label>
              <Input
                id="title"
                placeholder="Например: Купить продукты"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Описание */}
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Описание задачи"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Статус (Switch) */}
            <div className="flex items-center gap-2">
              <Switch
                checked={taskForm.done}
                onCheckedChange={(checked) =>
                  setTaskForm((prev) => ({ ...prev, done: checked }))
                }
              />
              <Label>Сделано?</Label>
            </div>

            <div className="flex justify-end gap-2">
              {/* Кнопка “Отправить в Архив” */}
              <Button variant="destructive" onClick={handleArchiveTask}>
                В Архив
              </Button>

              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSubmitForm}>
                {taskForm.id ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
