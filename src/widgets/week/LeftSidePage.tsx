import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories-widget";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";

export const LeftSidePage = ({
  userId,
  weekId,
}: {
  userId: string;
  weekId: string;
}) => {
  const {
    categories,
    handleOpenAddModal: handleOpenAddCategory,
    handleOpenEditModal: handleOpenEditCategory,
    handleDelete: handleDeleteCategory,
    isLoading: isCategoriesLoading,
  } = useCategoriesWidget(userId);
  return (
    <div className="lg:col-span-3 space-y-6">
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <WeekFocus weekPlanId={weekId} />
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <TaskCategories
          categories={categories}
          onAddCategory={handleOpenAddCategory}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isCategoriesLoading}
        />
      </div>
    </div>
  );
};
