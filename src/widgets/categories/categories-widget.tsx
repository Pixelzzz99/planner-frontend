import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";

export function CategoriesWidget() {
  const {
    categories,
    isLoading,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
  } = useCategoriesWidget();

  return (
    <TaskCategories
      categories={categories}
      isLoading={isLoading}
      onAddCategory={onAddCategory}
      onEditCategory={onEditCategory}
      onDeleteCategory={onDeleteCategory}
    />
  );
}
