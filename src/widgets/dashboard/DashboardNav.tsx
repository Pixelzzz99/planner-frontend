"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useYearPlan } from "@/entities/year-plan/hooks/useYearPlan";
import { findCurrentWeekId } from "@/shared/lib/findCurrentWeek";

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
    <nav className="border-b border-black/8 dark:border-white/6 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 h-12 flex items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm gradient-text">Calendrium</span>
        </Link>

        <div className="flex items-center gap-1">
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
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}

          {currentWeekId ? (
            <Link
              href={`/dashboard/week?weekId=${currentWeekId}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                pathname?.startsWith("/dashboard/week")
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8",
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Текущая неделя
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
