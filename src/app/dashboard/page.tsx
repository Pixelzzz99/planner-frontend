"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  Target,
  ArrowRight,
} from "lucide-react";
import { useYearPlan } from "@/entities/year-plan/hooks/useYearPlan";
import { useGoals } from "@/shared/hooks/useGoals";
import { QueryErrorState } from "@/shared/ui/QueryErrorState";
import { findCurrentWeekId } from "@/shared/lib/findCurrentWeek";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const currentYear = new Date().getFullYear();

  const { data: yearPlans, isLoading, error, refetch } = useYearPlan(userId);
  const { goals } = useGoals(currentYear);

  const currentYearPlan = yearPlans?.find((y) => y.year === currentYear);
  const currentWeekId = findCurrentWeekId(yearPlans);

  const stats = useMemo(() => {
    const weeksCount =
      currentYearPlan?.months.reduce(
        (sum, m) => sum + m.weekPlans.length,
        0,
      ) ?? 0;
    const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
    const goalsTotal = goals.length;
    const goalsPct =
      goalsTotal > 0 ? Math.round((completedGoals / goalsTotal) * 100) : 0;

    return { weeksCount, completedGoals, goalsTotal, goalsPct };
  }, [currentYearPlan, goals]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <QueryErrorState
        message="Не удалось загрузить данные обзора"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text">
          Привет{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ваш планировщик на {currentYear} год
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl glass border border-black/8 dark:border-white/8 p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-medium">Недель в году</span>
          </div>
          <p className="text-3xl font-bold tabular-nums">{stats.weeksCount}</p>
        </div>

        <div className="rounded-2xl glass border border-black/8 dark:border-white/8 p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium">Цели года</span>
          </div>
          <p className="text-3xl font-bold tabular-nums">
            {stats.completedGoals}
            <span className="text-lg text-muted-foreground font-normal">
              /{stats.goalsTotal}
            </span>
          </p>
        </div>

        <div className="rounded-2xl glass border border-black/8 dark:border-white/8 p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Прогресс целей</span>
          </div>
          <p className="text-3xl font-bold tabular-nums">{stats.goalsPct}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Быстрые действия
        </h2>

        <Link
          href="/dashboard/year"
          className="flex items-center justify-between rounded-2xl glass border border-black/8 dark:border-white/8 p-4 hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">План года {currentYear}</p>
              <p className="text-xs text-muted-foreground">
                {currentYearPlan
                  ? `${stats.weeksCount} недель запланировано`
                  : "Создайте план на этот год"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        {currentWeekId ? (
          <Link
            href={`/dashboard/week?weekId=${currentWeekId}`}
            className="flex items-center justify-between rounded-2xl glass border border-black/8 dark:border-white/8 p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Текущая неделя</p>
                <p className="text-xs text-muted-foreground">
                  Задачи, привычки и фокусы
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-4 text-sm text-muted-foreground">
            Нет недели на сегодня — добавьте её в{" "}
            <Link href="/dashboard/year" className="text-primary hover:underline">
              плане года
            </Link>
          </div>
        )}
      </div>

      {!currentYearPlan && (
        <div className="mt-8 text-center">
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/year">Создать план на {currentYear}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
