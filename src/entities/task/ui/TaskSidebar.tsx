import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Archive, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  taskForm: any;
  setTaskForm: (value: any) => void;
  onSubmit: () => void;
  onArchive: () => void;
}

export function TaskSidebar({
  isOpen,
  onClose,
  taskForm,
  setTaskForm,
  onSubmit,
  onArchive,
}: TaskSidebarProps) {
  // Блокируем скролл при открытом сайдбаре
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Затемнение */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Сайдбар */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[600px] bg-white shadow-xl z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Шапка */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={onSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {taskForm.id ? "Сохранить" : "Создать"}
              </Button>
            </div>
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Без названия"
              className="text-2xl font-medium border-none px-0 focus-visible:ring-0 w-full placeholder:text-gray-400"
            />
          </div>

          {/* Основной контент */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Описание */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">
                Описание
              </Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Добавьте описание задачи..."
                className="min-h-[200px] text-base border-none resize-none focus-visible:ring-0 placeholder:text-gray-400"
              />
            </div>

            {/* Статус */}
            <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Switch
                checked={taskForm.done}
                onCheckedChange={(checked) =>
                  setTaskForm((prev) => ({ ...prev, done: checked }))
                }
                className="data-[state=checked]:bg-green-600"
              />
              <Label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                {taskForm.done
                  ? "Задача выполнена"
                  : "Отметить как выполненное"}
              </Label>
            </div>
          </div>

          {/* Футер */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={onArchive}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-2 transition-colors w-full justify-start"
            >
              <Archive className="h-4 w-4" />
              <span>Архивировать задачу</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
