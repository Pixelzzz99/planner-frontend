import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";

export const LeftSidePage = ({
  weekId,
}: {
  userId: string;
  weekId: string;
}) => {
  const {
    categories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    isLoading: isCategoriesLoading,
  } = useCategoriesWidget();
  return (
    <div className="lg:col-span-3 space-y-6">
      <WeekFocus weekPlanId={weekId} />

      <TaskCategories
        categories={categories}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
        isLoading={isCategoriesLoading}
      />
    </div>
  );
};
