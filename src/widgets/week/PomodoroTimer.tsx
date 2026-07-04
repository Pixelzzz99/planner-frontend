"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react";
import {
  formatPomodoroTime,
  PomodoroPhase,
  usePomodoroTimer,
} from "./usePomodoroTimer";

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: "Фокус",
  shortBreak: "Перерыв",
  longBreak: "Длинный перерыв",
};

const PHASE_STYLES: Record<PomodoroPhase, string> = {
  focus: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  shortBreak: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  longBreak: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

export function PomodoroTimer() {
  const { phase, secondsLeft, isRunning, completedFocus, toggle, reset, skip } =
    usePomodoroTimer();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition-colors shrink-0",
        PHASE_STYLES[phase],
      )}
    >
      <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-80 hidden sm:block" aria-hidden />

      <div className="flex flex-col min-w-[52px] sm:min-w-[72px]">
        <span className="text-base sm:text-lg font-bold tabular-nums leading-none tracking-tight">
          {formatPomodoroTime(secondsLeft)}
        </span>
        <span className="hidden sm:block text-[10px] font-medium opacity-80 leading-tight">
          {PHASE_LABELS[phase]}
          {completedFocus > 0 && (
            <span className="ml-1 opacity-60">· {completedFocus}🍅</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-black/8 dark:hover:bg-white/10"
          onClick={toggle}
          title={isRunning ? "Пауза" : "Старт"}
          aria-label={isRunning ? "Пауза" : "Старт"}
        >
          {isRunning ? (
            <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-black/8 dark:hover:bg-white/10 hidden sm:flex"
          onClick={reset}
          title="Сброс"
          aria-label="Сброс"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-black/8 dark:hover:bg-white/10 hidden sm:flex"
              title="Ещё"
              aria-label="Дополнительные действия"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={skip}>Пропустить фазу</DropdownMenuItem>
            <DropdownMenuItem onClick={reset}>Сбросить таймер</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
