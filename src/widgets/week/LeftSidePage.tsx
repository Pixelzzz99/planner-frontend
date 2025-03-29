import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";
import { Task } from "@/entities/task";

interface LeftSidePageProps {
  userId: string;
  weekId: string;
  tasks?: Task[];
}

export const LeftSidePage = ({ weekId, tasks = [] }: LeftSidePageProps) => {
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
        tasks={tasks}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
        isLoading={isCategoriesLoading}
      />
    </div>
  );
};
