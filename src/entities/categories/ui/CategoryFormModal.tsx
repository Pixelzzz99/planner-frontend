import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryForm: { id?: string; name: string };
  setCategoryForm: React.Dispatch<
    React.SetStateAction<{ id?: string; name: string }>
  >;
  onSubmit: () => void;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  categoryForm,
  setCategoryForm,
  onSubmit,
}: CategoryFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {categoryForm.id ? "Редактировать категорию" : "Новая категория"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="categoryName">Название категории</Label>
            <Input
              id="categoryName"
              placeholder="Например: Работа"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={onSubmit}>
              {categoryForm.id ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
