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
import { UpdateTaskDTO, TaskStatus } from "../models/task.model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListTodo, Type, AlignLeft, Timer, Archive } from "lucide-react";
import { getCategoryColor } from "@/shared/lib/utils/color";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  taskForm: UpdateTaskDTO;
  setTaskForm: (value: UpdateTaskDTO) => void;
  onSubmit: () => void;
  onArchive: () => void;
  categories: Array<{ id: string; name: string }>;
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
        <div className="flex-1 overflow-auto px-6 py-2 space-y-5">
          {/* Заголовок */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
              <Type size={16} className="text-muted-foreground" />
              Заголовок
            </Label>
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              placeholder="Например: «Подготовить отчёт»"
              className="focus-visible:ring-1"
            />
          </div>

          {/* Статус */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
              <ListTodo size={16} className="text-muted-foreground" />
              Статус
            </Label>
            <Select
              value={taskForm.status}
              onValueChange={(value: TaskStatus) =>
                setTaskForm({ ...taskForm, status: value })
              }
            >
              <SelectTrigger className="w-full focus-visible:ring-1">
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

          {/* Время и Категория в одной строке */}
          <div className="grid grid-cols-2 gap-4">
            {/* Планируемое время */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <Timer size={16} className="text-muted-foreground" />
                Время
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={taskForm.duration || ""}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      duration: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0"
                  className="pr-8 focus-visible:ring-1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ч
                </span>
              </div>
            </div>

            {/* Категория */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                  <span className="h-2 w-2 rounded-full bg-accent-foreground" />
                </span>
                Категория
              </Label>
              <Select
                value={taskForm.categoryId}
                onValueChange={(value: string) =>
                  setTaskForm({ ...taskForm, categoryId: value })
                }
              >
                <SelectTrigger className="w-full focus-visible:ring-1">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: getCategoryColor(category.id),
                          }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
              <AlignLeft size={16} className="text-muted-foreground" />
              Описание
            </Label>
            <Textarea
              value={taskForm.description || ""}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  description: e.target.value,
                })
              }
              placeholder="Добавьте описание задачи..."
              className="min-h-[120px] focus-visible:ring-1"
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
