import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getMonthName } from "@/shared/lib/date/month-formatter";
import { Trash2 } from "lucide-react";

interface MonthCardProps {
  month: {
    id: string;
    month: number;
    weekPlans: Array<{
      id: string;
      startDate: string;
      endDate: string;
    }>;
  };
  onAddWeek: () => void;
  onDeleteWeek: (weekId: string) => void;
}

export const MonthCard = ({
  month,
  onAddWeek,
  onDeleteWeek,
}: MonthCardProps) => {
  const formatDate = (date: string) =>
    format(new Date(date), "d MMM", { locale: ru });

  return (
    <div className="w-[280px] flex-shrink-0">
      <div className="bg-card rounded-lg border border-border hover:border-border/80 transition-colors">
        <div className="border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground text-center">
            {getMonthName(month.month)}
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {month.weekPlans.map((week) => (
              <div
                key={week.id}
                className="block p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <Link href={`/dashboard/week?weekId=${week.id}`}>
                    <span className="text-sm text-foreground">
                      {formatDate(week.startDate)} - {formatDate(week.endDate)}
                    </span>
                  </Link>
                  <Button variant="ghost" onClick={() => onDeleteWeek(week.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4 text-muted-foreground hover:text-foreground"
            onClick={onAddWeek}
          >
            + Добавить неделю
          </Button>
        </div>
      </div>
    </div>
  );
};
