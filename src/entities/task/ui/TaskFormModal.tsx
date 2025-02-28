import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

export function TaskFormModal({
  isOpen,
  onClose,
  taskForm,
  setTaskForm,
  onSubmit,
  onArchive,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 bg-white rounded-xl overflow-hidden">
        {/* Шапка */}
        <DialogHeader className="px-8 py-6 border-b border-gray-100 space-y-0">
          <div className="flex items-center justify-between">
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Без названия"
              className="text-2xl font-medium border-none px-0 focus-visible:ring-0 w-full placeholder:text-gray-400"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              onClick={onClose}
            />
          </div>
        </DialogHeader>

        {/* Основной контент */}
        <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Описание */}
          <div className="space-y-2">
            <Textarea
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Добавьте описание..."
              className="min-h-[150px] text-base border-none resize-none px-0 focus-visible:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Статус */}
          <div className="flex items-center gap-3 py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Switch
              checked={taskForm.done}
              onCheckedChange={(checked) =>
                setTaskForm((prev) => ({ ...prev, done: checked }))
              }
              className="data-[state=checked]:bg-green-600"
            />
            <Label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              {taskForm.done ? "Задача выполнена" : "Отметить как выполненное"}
            </Label>
          </div>
        </div>

        {/* Футер */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onArchive}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-2 transition-colors"
          >
            <Archive className="h-4 w-4" />
            <span>В архив</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:bg-gray-100"
            >
              Отмена
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {taskForm.id ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
