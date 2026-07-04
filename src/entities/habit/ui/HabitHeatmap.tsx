"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  startOfYear,
} from "date-fns";
import { ru } from "date-fns/locale";
import { HabitHeatmapEntry } from "../models/habit-heatmap.model";
import { cn } from "@/lib/utils";

const CELL = "h-3 w-3 sm:h-3.5 sm:w-3.5";
const WEEK_GAP = "gap-1";

interface HabitHeatmapProps {
  year: number;
  habits: HabitHeatmapEntry[];
  layout?: "full" | "compact";
}

export function HabitHeatmap({
  year,
  habits,
  layout = "full",
}: HabitHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);
    const days = eachDayOfInterval({ start, end });

    const padStart = (getDay(start) + 6) % 7;
    const paddedDays: (Date | null)[] = [
      ...Array.from({ length: padStart }, () => null),
      ...days,
    ];

    const weekCols: (Date | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weekCols.push(paddedDays.slice(i, i + 7));
    }

    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weekCols.forEach((week, col) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: format(firstDay, "LLL", { locale: ru }),
          col,
        });
        lastMonth = month;
      }
    });

    return { weeks: weekCols, monthLabels: labels };
  }, [year]);

  const weekWidth = layout === "full" ? 16 : 14;

  if (habits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/50 text-center py-8">
        Нет привычек для отображения
      </p>
    );
  }

  if (layout === "compact") {
    return (
      <div className="space-y-4">
        {habits.map((habit) => (
          <HabitRowCompact
            key={habit.id}
            habit={habit}
            weeks={weeks}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Shared month labels + scrollable heatmap area */}
      <div className="grid grid-cols-[minmax(0,200px)_1fr] gap-4 items-start">
        <div className="hidden sm:block" />
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="min-w-max">
            <div
              className="relative h-5 mb-2"
              style={{ width: weeks.length * weekWidth }}
            >
              {monthLabels.map(({ label, col }) => (
                <span
                  key={`month-${label}-${col}`}
                  className="absolute text-[10px] font-medium text-muted-foreground capitalize"
                  style={{ left: col * weekWidth }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {habits.map((habit) => {
        const dateSet = new Set(habit.completedDates);
        const color = habit.color || "#10B981";
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = endOfYear(yearStart);
        const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd }).length;
        const pct = Math.round((habit.totalCompleted / daysInYear) * 100);

        return (
          <div
            key={habit.id}
            className="grid grid-cols-1 sm:grid-cols-[minmax(0,200px)_1fr] gap-3 sm:gap-4 items-start rounded-xl px-2 py-2 hover:bg-black/3 dark:hover:bg-white/3 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 mt-1"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium break-words leading-snug min-w-0">
                  {habit.title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 pl-[18px] tabular-nums">
                {habit.totalCompleted} дн. · {pct}% года
              </p>
            </div>

            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <div className="min-w-max">
                <div className={cn("flex", WEEK_GAP)}>
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className={cn("flex flex-col", WEEK_GAP)}>
                      {week.map((day, dayIdx) => {
                        if (!day) {
                          return (
                            <div
                              key={`e-${habit.id}-${weekIdx}-${dayIdx}`}
                              className={CELL}
                            />
                          );
                        }
                        const key = format(day, "yyyy-MM-dd");
                        const done = dateSet.has(key);
                        return (
                          <div
                            key={key}
                            title={`${format(day, "d MMMM yyyy", { locale: ru })}${done ? " — выполнено" : ""}`}
                            className={cn(
                              CELL,
                              "rounded-[3px] transition-colors",
                              done
                                ? "ring-1 ring-black/10 dark:ring-white/10"
                                : "bg-black/6 dark:bg-white/8",
                            )}
                            style={
                              done ? { backgroundColor: color } : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground pt-1">
        <span>Не отмечено</span>
        <div className={cn(CELL, "rounded-[3px] bg-black/6 dark:bg-white/8")} />
        <div
          className={cn(CELL, "rounded-[3px]")}
          style={{ backgroundColor: "#10B981" }}
        />
        <span>Отмечено</span>
      </div>
    </div>
  );
}

function HabitRowCompact({
  habit,
  weeks,
}: {
  habit: HabitHeatmapEntry;
  weeks: (Date | null)[][];
}) {
  const dateSet = new Set(habit.completedDates);
  const color = habit.color || "#10B981";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium truncate">{habit.title}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
          {habit.totalCompleted} дн.
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                if (!day) return <div key={`e-${weekIdx}-${dayIdx}`} className="h-2.5 w-2.5" />;
                const key = format(day, "yyyy-MM-dd");
                const done = dateSet.has(key);
                return (
                  <div
                    key={key}
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={done ? { backgroundColor: color } : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
