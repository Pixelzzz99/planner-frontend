import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";
import { Task } from "@/entities/task";
import { HabitsWidget } from "@/entities/habit/ui/HabitsWidget";

interface LeftSidePageProps {
  userId: string;
  weekId: string;
  weekStart?: string;
  tasks?: Task[];
}

export const LeftSidePage = ({
  weekId,
  weekStart,
  tasks = [],
}: LeftSidePageProps) => {
  const {
    categories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    isLoading: isCategoriesLoading,
  } = useCategoriesWidget();

  return (
    <div className="space-y-4">
      <HabitsWidget weekStart={weekStart} />
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
