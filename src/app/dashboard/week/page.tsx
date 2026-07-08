"use client";
import { useMemo, Suspense, useRef, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WeekSkeleton } from "@/entities/weeks/ui/WeekSkeleton";
import { WeekPageHeader } from "@/entities/weeks/ui/WeekPageHeader";
import { LeftSidePage } from "@/widgets/week/LeftSidePage";
import { useCategoriesWidget } from "@/entities/categories/hooks/use-categories";
import { TaskSheet } from "@/entities/task/ui/TaskSheet";
import { useWeekTasks } from "@/entities/task/hooks/useWeekTasks";
import { WeekBoard } from "@/widgets/week/WeekBoard";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutGrid, PanelLeft } from "lucide-react";
import { QueryErrorState } from "@/shared/ui/QueryErrorState";
import { useConfirm } from "@/shared/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

function WeekPageEmpty() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-4">
      <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
      <div>
        <h1 className="text-xl font-bold">Неделя не выбрана</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Откройте неделю из плана года или перейдите к текущей неделе через
          навигацию сверху.
        </p>
      </div>
      <Button asChild className="rounded-xl">
        <Link href="/dashboard/year">Перейти к плану года</Link>
      </Button>
    </div>
  );
}

function WeekPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams?.get("weekId") ?? "";
  const confirm = useConfirm();

  const { categories } = useCategoriesWidget();

  const {
    weekPlan,
    tasks,
    archivedTasks,
    isLoading,
    error,
    refetch,
    taskForm,
    setTaskForm,
    isModalOpen,
    openAddTask,
    openEditTask,
    closeModal,
    handleSubmitTask,
    handleDeleteTask,
    handleStatusChange,
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
  const [mobilePanel, setMobilePanel] = useState<"board" | "plan">("board");

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

  const handleDeleteTaskWithConfirm = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const ok = await confirm({
      title: "Удалить задачу?",
      description: task
        ? `«${task.title}» будет удалена без возможности восстановления.`
        : "Задача будет удалена без возможности восстановления.",
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (ok) handleDeleteTask(taskId);
  };

  if (!weekId) {
    return <WeekPageEmpty />;
  }

  if (isLoading) {
    return <WeekSkeleton />;
  }

  if (error) {
    return (
      <QueryErrorState
        message="Не удалось загрузить неделю"
        onRetry={() => refetch()}
      />
    );
  }

  if (!weekPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-4">
        <h1 className="text-xl font-bold">Неделя не найдена</h1>
        <p className="text-sm text-muted-foreground">
          Возможно, она была удалена или ссылка устарела.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/year">К плану года</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-3rem)] bg-background overflow-hidden">
      <WeekPageHeader
        weekPlan={weekPlan}
        onBack={() => router.push("/dashboard/year")}
      />

      <div className="lg:hidden shrink-0 flex border-b border-black/8 dark:border-white/6 bg-background/95 backdrop-blur-sm mt-[52px]">
        <button
          type="button"
          onClick={() => setMobilePanel("board")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
            mobilePanel === "board"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Задачи
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel("plan")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
            mobilePanel === "plan"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground",
          )}
        >
          <PanelLeft className="h-3.5 w-3.5" />
          План недели
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden lg:pt-[52px]">
        <aside
          className={cn(
            "w-full lg:w-[300px] flex-shrink-0 min-h-0 flex flex-col border-r border-black/8 dark:border-white/6 bg-background/50",
            mobilePanel === "plan" ? "flex flex-1" : "hidden lg:flex",
          )}
        >
          <LeftSidePage
            weekId={weekId}
            weekStart={weekPlan.startDate}
            tasks={tasks}
          />
        </aside>

        <main
          className={cn(
            "flex-1 flex flex-col overflow-hidden min-w-0",
            mobilePanel === "board" ? "flex" : "hidden lg:flex",
          )}
        >
          <WeekBoard
            tasks={tasks}
            archivedTasks={archivedTasks ?? []}
            isLoading={isLoading}
            focusDayId={focusDayId}
            currentDayRef={currentDayRef}
            scrollBoardRef={scrollBoardRef}
            openAddTask={openAddTask}
            openEditTask={openEditTask}
            handleDeleteTask={handleDeleteTaskWithConfirm}
            onStatusChange={handleStatusChange}
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
