"use client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ChevronLeft, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface YearPageHeaderProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const YearPageHeader = ({ year, onPrevYear, onNextYear }: YearPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl glass border border-black/8 dark:border-white/6 shadow-lg mb-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-xl font-extrabold gradient-text tracking-tight">
          Calendrium
        </span>
      </div>

      <div className="flex items-center gap-1">
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

      <div className="flex items-center gap-2">
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
