"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  startOfYear,
} from "date-fns";
import { HabitHeatmapEntry } from "../models/habit-heatmap.model";

const LEVELS = [
  "bg-black/6 dark:bg-white/8",
  "opacity-80",
  "opacity-90",
  "opacity-100",
];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count < 5) return 1;
  if (count < 15) return 2;
  return 3;
}

interface HabitHeatmapProps {
  year: number;
  habits: HabitHeatmapEntry[];
}

export function HabitHeatmap({ year, habits }: HabitHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(start);
    const days = eachDayOfInterval({ start, end });

    const padStart = (getDay(start) + 6) % 7;
    const paddedDays: (Date | null)[] = [
      ...Array.from({ length: padStart }, () => null),
      ...days,
    ];

    const weekRows: (Date | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weekRows.push(paddedDays.slice(i, i + 7));
    }

    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weekRows.forEach((week, col) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        labels.push({ label: format(firstDay, "LLL"), col });
        lastMonth = month;
      }
    });

    return { weeks: weekRows, monthLabels: labels };
  }, [year]);

  if (habits.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 text-center py-6">
        Нет привычек для отображения
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const dateSet = new Set(habit.completedDates);
        const color = habit.color || "#10B981";

        return (
          <div key={habit.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium truncate">{habit.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                {habit.totalCompleted} дн.
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="min-w-max">
                <div className="flex gap-2 mb-1 h-3 relative">
                  {monthLabels.map(({ label, col }) => (
                    <span
                      key={`${habit.id}-${label}-${col}`}
                      className="text-[9px] text-muted-foreground/60 absolute"
                      style={{ left: col * 14 }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-[3px]">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dayIdx) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${weekIdx}-${dayIdx}`}
                              className="h-2.5 w-2.5"
                            />
                          );
                        }
                        const key = format(day, "yyyy-MM-dd");
                        const done = dateSet.has(key);
                        const level = done ? 3 : 0;
                        return (
                          <div
                            key={key}
                            title={`${format(day, "d MMM yyyy")}${done ? " — выполнено" : ""}`}
                            className={`h-2.5 w-2.5 rounded-[2px] ${LEVELS[level]}`}
                            style={
                              done
                                ? { backgroundColor: color }
                                : undefined
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

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-end">
        <span>Меньше</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-2.5 w-2.5 rounded-[2px] ${LEVELS[level]}`}
            style={
              level > 0
                ? { backgroundColor: "#10B981", opacity: 0.4 + level * 0.2 }
                : undefined
            }
          />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
}
