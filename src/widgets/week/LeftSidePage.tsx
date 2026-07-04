"use client";

import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";
import { TaskCategories } from "@/entities/categories/ui/TaskCategories";
import { WeekFocus } from "@/entities/weeks/ui/WeekFocus";
import { Task } from "@/entities/task";
import { HabitsWidget } from "@/entities/habit/ui/HabitsWidget";
import { RecurringTasksWidget } from "@/entities/recurring-task/ui/RecurringTasksWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarSection } from "@/shared/ui/SidebarSection";
import { Target, Layers, Repeat, Sparkles } from "lucide-react";
import { useRecurringTasks } from "@/entities/recurring-task/hooks/useRecurringTasks";
import { useMemo } from "react";

interface LeftSidePageProps {
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

  const { templates } = useRecurringTasks(weekId);

  const categoryBadge = useMemo(() => {
    if (categories.length === 0) return undefined;
    return String(categories.length);
  }, [categories.length]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <Tabs defaultValue="plan" className="flex flex-col flex-1 min-h-0">
        <TabsList className="mx-4 mt-3 mb-1 shrink-0 w-[calc(100%-2rem)] grid grid-cols-2 h-9 bg-black/5 dark:bg-white/5">
          <TabsTrigger value="plan" className="text-xs rounded-md">
            План недели
          </TabsTrigger>
          <TabsTrigger value="habits" className="text-xs rounded-md">
            Привычки
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="plan"
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 mt-0 space-y-3 data-[state=inactive]:hidden"
        >
          <SidebarSection
            title="Фокусы недели"
            icon={
              <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
            }
            defaultOpen
          >
            <WeekFocus weekPlanId={weekId} embedded />
          </SidebarSection>

          <SidebarSection
            title="Категории"
            icon={
              <div className="h-6 w-6 rounded-md bg-accent/15 flex items-center justify-center shrink-0">
                <Layers className="h-3.5 w-3.5 text-accent" />
              </div>
            }
            badge={categoryBadge}
            defaultOpen
          >
            <TaskCategories
              categories={categories}
              tasks={tasks}
              onAddCategory={onAddCategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              isLoading={isCategoriesLoading}
              embedded
            />
          </SidebarSection>

          <SidebarSection
            title="Повторяющиеся"
            icon={
              <div className="h-6 w-6 rounded-md bg-violet-500/15 flex items-center justify-center shrink-0">
                <Repeat className="h-3.5 w-3.5 text-violet-500" />
              </div>
            }
            badge={templates.length > 0 ? String(templates.length) : undefined}
            defaultOpen={templates.length > 0}
          >
            <RecurringTasksWidget weekId={weekId} embedded />
          </SidebarSection>
        </TabsContent>

        <TabsContent
          value="habits"
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 mt-0 data-[state=inactive]:hidden"
        >
          <SidebarSection
            title="Привычки"
            icon={
              <div className="h-6 w-6 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              </div>
            }
            defaultOpen
          >
            <HabitsWidget weekStart={weekStart} embedded />
          </SidebarSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};
