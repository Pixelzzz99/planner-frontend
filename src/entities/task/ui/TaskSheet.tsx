import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Archive, CalendarIcon, Clock, Tags } from "lucide-react";
import { UpdateTaskDTO, TaskStatus } from "../models/task.model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  taskForm: UpdateTaskDTO;
  setTaskForm: (value: UpdateTaskDTO) => void;
  onSubmit: () => void;
  onArchive: () => void;
  categories: Array<{ id: string; name: string; color: string }>;
}

export function TaskSheet({
  isOpen,
  onClose,
  taskForm,
  setTaskForm,
  onSubmit,
  onArchive,
  categories,
}: TaskSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:w-[50vw] sm:max-w-[50vw] h-full flex flex-col overflow-hidden rounded-md border bg-background">
        {/* Шапка */}
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {taskForm.id ? "Редактировать задачу" : "Новая задача"}
              </h2>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Основное содержимое (flex-1, чтобы «тянуться») */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Поле «Заголовок» */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Заголовок</Label>
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              placeholder="Например: «Подготовить отчёт»"
            />
          </div>

          {/* Статус */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Статус</Label>
            <Select
              value={taskForm.status}
              onValueChange={(value: TaskStatus) =>
                setTaskForm({ ...taskForm, status: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.TODO}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    <span>К выполнению</span>
                  </div>
                </SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>В процессе</span>
                  </div>
                </SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Выполнено</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Добавляем селект категорий после статуса */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Категория</Label>
            <Select
              value={taskForm.categoryId}
              onValueChange={(value: string) =>
                setTaskForm({ ...taskForm, categoryId: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Мета-информация */}
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" className="h-8 gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">Сегодня</span>
            </Button>
            <Button variant="outline" className="h-8 gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Установить время</span>
            </Button>
            <Button variant="outline" className="h-8 gap-2">
              <Tags className="h-4 w-4" />
              <span className="text-sm">Добавить метки</span>
            </Button>
          </div>

          {/* Описание */}
          <div>
            <Label className="mb-1 block text-sm font-medium">Описание</Label>
            <Textarea
              value={taskForm.description || ""}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  description: e.target.value,
                })
              }
              placeholder="Добавьте описание задачи..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Футер (в самом низу) */}
        <SheetFooter className="border-t px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onArchive}
            className="gap-2 hover:text-red-600 hover:bg-red-50"
          >
            <Archive className="h-4 w-4" />
            <span className="text-sm">В архив</span>
          </Button>
          <Button onClick={onSubmit} className="px-4 rounded-md">
            {taskForm.id ? "Сохранить" : "Создать"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
