"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Coffee,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer,
  Zap,
} from "lucide-react";
import { formatPomodoroTime, PomodoroPhase } from "./usePomodoroTimer";
import { usePomodoroTimer } from "./PomodoroContext";

const PHASE_OPTIONS: { value: PomodoroPhase; label: string; short: string }[] = [
  { value: "focus", label: "Фокус", short: "Фокус" },
  { value: "shortBreak", label: "Отдых", short: "Отдых" },
  { value: "longBreak", label: "Длинный отдых", short: "Длинн." },
];

const PHASE_STYLES: Record<PomodoroPhase, string> = {
  focus: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  shortBreak: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  longBreak: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

const PHASE_ACTIVE: Record<PomodoroPhase, string> = {
  focus: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  shortBreak: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  longBreak: "bg-sky-500/20 text-sky-600 dark:text-sky-400",
};

interface PomodoroTimerProps {
  /** Однострочный вид для глобальной навигации */
  compact?: boolean;
}

export function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const {
    phase,
    secondsLeft,
    isRunning,
    completedFocus,
    toggle,
    reset,
    skip,
    goToPhase,
  } = usePomodoroTimer();

  const phaseLabel = PHASE_OPTIONS.find((p) => p.value === phase)?.label ?? "";
  const PhaseIcon =
    phase === "focus" ? Zap : phase === "shortBreak" ? Coffee : Timer;

  const moreMenu = (
    <DropdownMenuContent align="end" className="w-48">
      {PHASE_OPTIONS.map((option) => (
        <DropdownMenuItem
          key={option.value}
          onClick={() => goToPhase(option.value)}
          className={phase === option.value ? "bg-accent" : ""}
        >
          {option.label}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={skip}>Пропустить фазу</DropdownMenuItem>
      <DropdownMenuItem onClick={reset}>Сбросить таймер</DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-xl border transition-colors shrink-0",
          PHASE_STYLES[phase],
        )}
      >
        <PhaseIcon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />

        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tabular-nums tracking-tight">
            {formatPomodoroTime(secondsLeft)}
          </span>
          <span className="text-[9px] font-medium opacity-75 max-w-[72px] truncate">
            {phaseLabel}
            {completedFocus > 0 && ` · ${completedFocus}🍅`}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg hover:bg-black/8 dark:hover:bg-white/10"
          onClick={toggle}
          title={isRunning ? "Пауза" : "Старт"}
          aria-label={isRunning ? "Пауза" : "Старт"}
        >
          {isRunning ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 ml-0.5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-black/8 dark:hover:bg-white/10"
              title="Режим и действия"
              aria-label="Режим и действия"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          {moreMenu}
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-colors shrink-0",
        PHASE_STYLES[phase],
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <PhaseIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-80 hidden sm:block" aria-hidden />

        <div className="flex flex-col min-w-[52px] sm:min-w-[72px]">
          <span className="text-base sm:text-lg font-bold tabular-nums leading-none tracking-tight">
            {formatPomodoroTime(secondsLeft)}
          </span>
          <span className="text-[10px] font-medium opacity-80 leading-tight sm:hidden">
            {phaseLabel}
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
            {moreMenu}
          </DropdownMenu>
        </div>
      </div>

      <div
        className="flex rounded-lg overflow-hidden border border-black/8 dark:border-white/10 bg-black/4 dark:bg-white/4"
        role="tablist"
        aria-label="Режим таймера"
      >
        {PHASE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={phase === option.value}
            onClick={() => goToPhase(option.value)}
            className={cn(
              "flex-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium transition-colors",
              phase === option.value
                ? PHASE_ACTIVE[option.value]
                : "text-muted-foreground hover:bg-black/6 dark:hover:bg-white/6",
            )}
            title={option.label}
          >
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.short}</span>
          </button>
        ))}
      </div>

      {completedFocus > 0 && (
        <span className="hidden sm:block text-[10px] font-medium opacity-70 -mt-0.5">
          Завершено: {completedFocus}🍅
        </span>
      )}
    </div>
  );
}
