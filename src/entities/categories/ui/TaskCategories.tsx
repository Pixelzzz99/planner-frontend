import { Button } from "@/components/ui/button";
import { EditableText } from "@/shared/ui/EditableText";
import { Trash2, Plus } from "lucide-react";

export function TaskCategories({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) {
  return (
    <div className="border  p-4 rounded-md shadow-md bg-white">
      <h2 className="font-semibold mb-4 text-xl text-gray-800">
        Категории задач
      </h2>

      <Button
        variant="outline"
        onClick={onAddCategory}
        className="flex items-center gap-2 w-full mb-4"
      >
        <Plus size={18} /> Добавить категорию
      </Button>

      {categories.length === 0 && (
        <div className="text-gray-500 text-sm mt-3 text-center">
          Категории отсутствуют
        </div>
      )}

      <div className="mt-4 space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-1 flex justify-between items-center bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-all"
          >
            <EditableText
              text={category.name}
              className="text-gray-800 text-md font-medium"
              onSave={(newName) =>
                onEditCategory({ ...category, name: newName })
              }
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
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
