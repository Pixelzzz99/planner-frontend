import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getMonthName } from "@/shared/lib/date/month-formatter";
import { Trash2, Plus, CalendarDays } from "lucide-react";
import { CSSProperties } from "react";

interface MonthCardProps {
  month: {
    id: string;
    month: number;
    weekPlans: Array<{ id: string; startDate: string; endDate: string }>;
  };
  onAddWeek: () => void;
  onDeleteWeek: (weekId: string) => void;
}

const MONTH_COLORS = [
  "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95",
  "#1D4ED8", "#1E40AF", "#0284C7", "#0369A1",
  "#0F766E", "#065F46", "#047857", "#059669",
];

function getAccentColor(month: number): string {
  return MONTH_COLORS[(month - 1) % MONTH_COLORS.length];
}

export const MonthCard = ({ month, onAddWeek, onDeleteWeek }: MonthCardProps) => {
  const formatDate = (date: string) => format(new Date(date), "d MMM", { locale: ru });
  const weekCount = month.weekPlans.length;
  const accentColor = getAccentColor(month.month);

  const cardStyle: CSSProperties = {
    borderTop: `2px solid ${accentColor}`,
    boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)`,
  };

  return (
    <div
      className="w-[260px] flex-shrink-0 rounded-2xl overflow-hidden dark:glass bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] group animate-fade-in"
      style={cardStyle}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            {getMonthName(month.month)}
          </h3>
          <span
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <CalendarDays className="h-3 w-3" />
            {weekCount} {weekCount === 1 ? "неделя" : weekCount < 5 ? "недели" : "недель"}
          </span>
        </div>

        {/* Week fill indicator */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i < weekCount ? accentColor : "rgba(255,255,255,0.1)",
                boxShadow: i < weekCount ? `0 0 6px ${accentColor}60` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Week list */}
      <div className="px-3 pb-2 space-y-1.5 min-h-[60px]">
        {month.weekPlans.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">Нет недель</p>
        ) : (
          month.weekPlans.map((week) => (
            <div
              key={week.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/week"
            >
              <Link
                href={`/dashboard/week?weekId=${week.id}`}
                className="text-xs text-foreground/80 hover:text-foreground transition-colors flex-1"
              >
                {formatDate(week.startDate)} — {formatDate(week.endDate)}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover/week:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onDeleteWeek(week.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-1">
        <Button
          variant="ghost"
          className="w-full h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-white/8 rounded-xl"
          onClick={onAddWeek}
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить неделю
        </Button>
      </div>
    </div>
  );
};
