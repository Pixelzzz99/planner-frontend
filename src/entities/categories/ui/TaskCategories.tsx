import { Button } from "@/components/ui/button";
import { EditableText } from "@/shared/ui/EditableText";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Category } from "../model/category.model";

interface TaskCategoriesProps {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  isLoading?: boolean;
}

export function TaskCategories({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isLoading,
}: TaskCategoriesProps) {
  return (
    <div className="border border-border p-4 rounded-md shadow-sm bg-card">
      <h2 className="font-semibold mb-4 text-xl text-foreground">
        Категории задач
      </h2>

      <Button
        variant="outline"
        onClick={onAddCategory}
        className="flex items-center gap-2 w-full mb-4 hover:bg-accent"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Plus size={18} />
        )}
        Добавить категорию
      </Button>

      {categories.length === 0 && (
        <div className="text-muted-foreground text-sm mt-3 text-center">
          Категории отсутствуют
        </div>
      )}

      <div className="mt-4 space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-1 flex justify-between items-center bg-muted rounded-md border border-border hover:shadow-sm transition-all"
          >
            <EditableText
              text={category.name}
              className="text-foreground text-md font-medium hover:bg-accent/50 px-2 py-1 rounded-md"
              onSave={(newName) =>
                onEditCategory({ ...category, name: newName })
              }
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => onDeleteCategory(category.id)}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
