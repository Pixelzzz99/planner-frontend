import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getMonthName } from "@/shared/lib/date/month-formatter";
import { Trash2, Plus } from "lucide-react";
import { CSSProperties } from "react";

interface MonthCardProps {
  month: {
    id: string;
    month: number;
    weekPlans: Array<{ id: string; startDate: string; endDate: string }>;
  };
  onAddWeek: () => void;
  onDeleteWeek: (weekId: string) => void;
  isCurrentMonth?: boolean;
}

const MONTH_COLORS = [
  "#7C3AED", "#6D28D9", "#0EA5E9", "#0284C7",
  "#0F766E", "#059669", "#D97706", "#DC2626",
  "#7C3AED", "#5B21B6", "#0369A1", "#047857",
];

function getAccentColor(month: number): string {
  return MONTH_COLORS[(month - 1) % MONTH_COLORS.length];
}

export const MonthCard = ({ month, onAddWeek, onDeleteWeek, isCurrentMonth }: MonthCardProps) => {
  const fmtDate = (date: string) => format(new Date(date), "d MMM", { locale: ru });
  const weekCount = month.weekPlans.length;
  const accent = getAccentColor(month.month);

  const cardStyle: CSSProperties = {
    borderTop: `2px solid ${accent}`,
  };

  return (
    <div
      className={[
        "rounded-2xl overflow-hidden transition-all duration-300 group animate-fade-in",
        "bg-white dark:bg-white/5 border border-black/8 dark:border-white/6",
        "hover:-translate-y-1 hover:shadow-lg",
        isCurrentMonth ? "ring-2 ring-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "",
      ].join(" ")}
      style={cardStyle}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              {getMonthName(month.month)}
            </h3>
            {isCurrentMonth && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">
                сейчас
              </span>
            )}
          </div>
          <span className="text-xs font-medium" style={{ color: accent }}>
            {weekCount} нед.
          </span>
        </div>

        {/* Week dots */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i < weekCount ? accent : "rgba(0,0,0,0.08)",
                boxShadow: i < weekCount ? `0 0 4px ${accent}60` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Week list */}
      <div className="px-2 pb-1.5 min-h-[32px] space-y-1">
        {month.weekPlans.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/60 text-center py-2">
            Нет недель
          </p>
        ) : (
          month.weekPlans.map((week) => (
            <div
              key={week.id}
              className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/8 transition-colors group/week"
            >
              <Link
                href={`/dashboard/week?weekId=${week.id}`}
                className="text-[11px] text-foreground/70 hover:text-foreground transition-colors flex-1"
              >
                {fmtDate(week.startDate)} — {fmtDate(week.endDate)}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover/week:opacity-100 transition-opacity hover:bg-destructive/15 hover:text-destructive rounded-md"
                onClick={() => onDeleteWeek(week.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add week */}
      <div className="px-2 pb-2.5">
        <Button
          variant="ghost"
          className="w-full h-7 text-[11px] gap-1 text-muted-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8 rounded-xl"
          onClick={onAddWeek}
        >
          <Plus className="h-3 w-3" />
          Добавить неделю
        </Button>
      </div>
    </div>
  );
};
