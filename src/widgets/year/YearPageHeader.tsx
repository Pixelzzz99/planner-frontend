"use client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ChevronLeft, ChevronRight, LogOut, Sparkles, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface YearPageHeaderProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  currentWeekHref?: string;
}

export const YearPageHeader = ({
  year,
  onPrevYear,
  onNextYear,
  currentWeekHref,
}: YearPageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl glass border border-black/8 dark:border-white/6 shadow-lg mb-6 sm:mb-8">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="h-5 w-5 text-primary shrink-0" />
        <span className="text-lg sm:text-xl font-extrabold gradient-text tracking-tight truncate">
          Calendrium
        </span>
      </div>

      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-black/8 dark:hover:bg-white/10"
          onClick={onPrevYear}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-2xl font-bold w-20 text-center gradient-text tabular-nums">
          {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-black/8 dark:hover:bg-white/10"
          onClick={onNextYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2">
        {currentWeekHref && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 rounded-lg hidden sm:flex"
          >
            <Link href={currentWeekHref}>
              <CalendarDays className="h-3.5 w-3.5" />
              Текущая неделя
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Выйти"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
