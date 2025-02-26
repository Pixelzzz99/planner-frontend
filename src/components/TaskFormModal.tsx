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
import { Button } from "@/components/ui/button";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {taskForm.id ? "Редактировать задачу" : "Новая задача"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
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
            <Button variant="destructive" onClick={onArchive}>
              В Архив
            </Button>

            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={onSubmit}>
              {taskForm.id ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
