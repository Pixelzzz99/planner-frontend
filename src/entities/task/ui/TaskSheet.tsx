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
import { Timer, Archive, CheckCircle2, Circle, Zap, Tag, Repeat } from "lucide-react";
import { getCategoryColor } from "@/shared/lib/utils/color";
import { Switch } from "@/components/ui/switch";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  taskForm: UpdateTaskDTO;
  setTaskForm: (value: UpdateTaskDTO) => void;
  onSubmit: () => void;
  onArchive: () => void;
  categories: Array<{ id: string; name: string }>;
}

const STATUS_OPTIONS = [
  {
    value: TaskStatus.TODO,
    label: "К выполнению",
    icon: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  },
  {
    value: TaskStatus.IN_PROGRESS,
    label: "В процессе",
    icon: <Zap className="h-3.5 w-3.5 text-sky-500" />,
  },
  {
    value: TaskStatus.COMPLETED,
    label: "Выполнено",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
];

const PRIORITY_OPTIONS = [
  { value: "HIGH",   label: "Высокий", color: "#EF4444" },
  { value: "MEDIUM", label: "Средний", color: "#F59E0B" },
  { value: "LOW",    label: "Низкий",  color: "#10B981" },
];

export function TaskSheet({
  isOpen,
  onClose,
  taskForm,
  setTaskForm,
  onSubmit,
  onArchive,
  categories,
}: TaskSheetProps) {
  const isNew = !taskForm.id;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[95vw] sm:w-[420px] sm:max-w-[420px] h-full flex flex-col gap-0 p-0 border-l border-black/10 dark:border-white/10 glass">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-black/8 dark:border-white/8">
          <SheetTitle className="gradient-text text-base font-bold">
            {isNew ? "Новая задача" : "Редактировать задачу"}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Название
            </Label>
            <Input
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Что нужно сделать?"
              className="h-11 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-primary/40 text-sm font-medium"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Статус
              </Label>
              <Select
                value={taskForm.status}
                onValueChange={(v: TaskStatus) => setTaskForm({ ...taskForm, status: v })}
              >
                <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span className="text-xs">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Приоритет
              </Label>
              <Select
                value={taskForm.priority ?? "LOW"}
                onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as "HIGH" | "MEDIUM" | "LOW" })}
              >
                <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="text-xs">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="h-3 w-3" />
                Время (мин)
              </Label>
              <Input
                type="number"
                min={0}
                value={taskForm.duration || ""}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    duration: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="0"
                className="h-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                Категория
              </Label>
              <Select
                value={taskForm.categoryId ?? ""}
                onValueChange={(v) => setTaskForm({ ...taskForm, categoryId: v })}
              >
                <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm">
                  <SelectValue placeholder="Без категории" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getCategoryColor(cat.id) }}
                        />
                        <span className="text-xs">{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Описание
            </Label>
            <Textarea
              value={taskForm.description || ""}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Дополнительные детали..."
              className="min-h-[100px] bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-sm resize-none"
            />
          </div>

          {isNew && (
            <div className="flex items-center justify-between rounded-xl border border-black/8 dark:border-white/8 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-violet-500" />
                <div>
                  <p className="text-sm font-medium">Повторять каждую неделю</p>
                  <p className="text-[11px] text-muted-foreground">
                    Шаблон можно добавить на любую неделю
                  </p>
                </div>
              </div>
              <Switch
                checked={!!taskForm.repeatWeekly}
                onCheckedChange={(checked) =>
                  setTaskForm({ ...taskForm, repeatWeekly: checked })
                }
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t border-black/8 dark:border-white/8 flex-row items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onArchive}
            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 rounded-xl"
          >
            <Archive className="h-4 w-4" />
            <span className="text-sm">В архив</span>
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="h-9 rounded-xl">
              Отмена
            </Button>
            <Button onClick={onSubmit} className="h-9 px-5 rounded-xl">
              {isNew ? "Создать" : "Сохранить"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
