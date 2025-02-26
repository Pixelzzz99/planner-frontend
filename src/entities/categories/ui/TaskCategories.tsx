import { Button } from "@/components/ui/button";
import { EditableText } from "@/shared/ui/EditableText"; // Импортируем новый компонент

export function TaskCategories({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) {
  return (
    <div className="border p-3 rounded-md">
      <h2 className="font-semibold mb-2 text-lg">Категории задач</h2>
      <Button variant="outline" onClick={onAddCategory}>
        + Добавить категорию
      </Button>
      {categories.length === 0 && (
        <div className="text-gray-500 text-sm mt-2">Категории отсутствуют</div>
      )}
      {categories.map((category) => (
        <div
          key={category.id}
          className="p-2 mb-2 bg-gray-100 rounded-md text-sm flex justify-between items-center"
        >
          <EditableText
            text={category.name}
            onSave={(newName) => onEditCategory({ ...category, name: newName })}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteCategory(category.id)}
            >
              Удалить
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
