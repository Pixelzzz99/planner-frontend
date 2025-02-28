import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getMonthName } from "@/shared/lib/date/month-formatter";

interface MonthCardProps {
  month: {
    id: number;
    month: string;
    weekPlans: Array<{
      id: number;
      startDate: string;
      endDate: string;
    }>;
  };
  onAddWeek: () => void;
}

export const MonthCard = ({ month, onAddWeek }: MonthCardProps) => {
  const formatDate = (date: string) =>
    format(new Date(date), "d MMM", { locale: ru });

  return (
    <div className="w-[280px] flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">
            {getMonthName(month.month)}
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {month.weekPlans.map((week) => (
              <Link
                key={week.id}
                href={`/dashboard/week?weekId=${week.id}`}
                className="block p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-700">
                  {formatDate(week.startDate)} - {formatDate(week.endDate)}
                </span>
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4 text-gray-600 hover:text-gray-900"
            onClick={onAddWeek}
          >
            + Добавить неделю
          </Button>
        </div>
      </div>
    </div>
  );
};
