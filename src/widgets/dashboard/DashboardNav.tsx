"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useYearPlan } from "@/entities/year-plan/hooks/useYearPlan";
import { findCurrentWeekId } from "@/shared/lib/findCurrentWeek";
import { PomodoroTimer } from "@/widgets/week/PomodoroTimer";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard/year", label: "Год", icon: CalendarDays },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: yearPlans } = useYearPlan(session?.user?.id);
  const currentWeekId = findCurrentWeekId(yearPlans);

  return (
    <nav className="sticky top-0 z-30 border-b border-black/8 dark:border-white/6 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 min-h-12 py-1.5 flex items-center gap-2 sm:gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm gradient-text hidden sm:inline">Calendrium</span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none min-w-0">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {currentWeekId ? (
            <Link
              href={`/dashboard/week?weekId=${currentWeekId}`}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                pathname?.startsWith("/dashboard/week")
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8",
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Текущая неделя</span>
              <span className="sm:hidden">Неделя</span>
            </Link>
          ) : null}
        </div>

        <div className="ml-auto shrink-0">
          <PomodoroTimer compact />
        </div>
      </div>
    </nav>
  );
}
