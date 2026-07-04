"use client";
import { useMemo, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WeekSkeleton } from "@/entities/weeks/ui/WeekSkeleton";
import { WeekPageHeader } from "@/entities/weeks/ui/WeekPageHeader";
import { LeftSidePage } from "@/widgets/week/LeftSidePage";
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";
import { TaskSheet } from "@/entities/task/ui/TaskSheet";
import { useWeekTasks } from "@/entities/task/hooks/useWeekTasks";
import { useUserId } from "@/shared/lib/hooks/useUserId";
import { WeekBoard } from "@/widgets/week/WeekBoard";

function WeekPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams?.get("weekId") ?? "";
  const userId = useUserId();

  const { categories } = useCategoriesWidget();

  const {
    weekPlan,
    tasks,
    archivedTasks,
    isLoading,
    taskForm,
    setTaskForm,
    isModalOpen,
    openAddTask,
    openEditTask,
    closeModal,
    handleSubmitTask,
    handleDeleteTask,
    commitTaskPosition,
  } = useWeekTasks(weekId);

  const currentDayId = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  }, []);

  const focusDayId = useMemo(() => {
    if (!weekPlan?.startDate) return 1;
    const start = new Date(weekPlan.startDate);
    const end = new Date(weekPlan.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today >= start && today <= end) return currentDayId;
    return 1;
  }, [weekPlan, currentDayId]);

  const scrollBoardRef = useRef<HTMLDivElement>(null);
  const currentDayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!weekPlan || !currentDayRef.current || !scrollBoardRef.current) return;
    const board = scrollBoardRef.current;
    const col = currentDayRef.current;
    const colLeft = col.offsetLeft;
    const colWidth = col.offsetWidth;
    const boardWidth = board.clientWidth;
    board.scrollTo({
      left: colLeft - (boardWidth - colWidth) / 2,
      behavior: "smooth",
    });
  }, [weekPlan]);

  const handleArchiveFromSheet = () => {
    if (!("id" in taskForm) || !taskForm.id) return;
    const task = tasks.find((t) => t.id === taskForm.id);
    if (!task) return;
    commitTaskPosition(task.id, task.day, undefined, true);
    closeModal();
  };

  if (isLoading) {
    return <WeekSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <WeekPageHeader
        weekPlan={weekPlan!}
        onBack={() => router.push("/dashboard/year")}
      />

      <div className="flex flex-1 overflow-hidden pt-[57px]">
        <aside className="w-[300px] flex-shrink-0 overflow-y-auto border-r border-black/8 dark:border-white/6 bg-background/50">
          <div className="p-4 space-y-4">
            <LeftSidePage
              userId={userId}
              weekId={weekId}
              weekStart={weekPlan?.startDate}
              tasks={tasks}
            />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <WeekBoard
            tasks={tasks}
            archivedTasks={archivedTasks ?? []}
            isLoading={isLoading}
            focusDayId={focusDayId}
            currentDayRef={currentDayRef}
            scrollBoardRef={scrollBoardRef}
            openAddTask={openAddTask}
            openEditTask={openEditTask}
            handleDeleteTask={handleDeleteTask}
            commitTaskPosition={commitTaskPosition}
          />
        </main>
      </div>

      <TaskSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        onSubmit={handleSubmitTask}
        onArchive={handleArchiveFromSheet}
        categories={categories}
      />
    </div>
  );
}

export default function WeekPage() {
  return (
    <Suspense>
      <WeekPageContent />
    </Suspense>
  );
}
