"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { YearPageHeader } from "@/widgets/year/YearPageHeader";
import { MonthCard } from "@/entities/month/ui/MonthCard";
import { GoalsSection } from "@/widgets/goals/GoalsSection";
import { useSession } from "next-auth/react";
import { useYearPlan } from "@/entities/year-plan/hooks/useYearPlan";
import { useCreateWeek, useDeleteWeek } from "@/entities/weeks/hooks/use-week";

interface DateError {
  startDate?: string;
  endDate?: string;
}

interface LoaderProps {
  className?: string;
}

const Loader = ({ className }: LoaderProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default function YearDashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: yearData, isLoading } = useYearPlan(userId);
  const createWeekMutation = useCreateWeek();
  const deleteWeekMutation = useDeleteWeek();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateErrors, setDateErrors] = useState<DateError>({});
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const validateDates = (start: string, end: string): boolean => {
    const errors: DateError = {};

    if (start) {
      const startDate = new Date(start);
      // Проверка на понедельник (1 - понедельник в getDay())
      if (startDate.getDay() !== 1) {
        errors.startDate = "Неделя должна начинаться с понедельника";
      }

      // Проверка, что дата начала относится к выбранному месяцу или предыдущему
      if (selectedMonth) {
        const selectedMonthDate = new Date(
          selectedMonth.year,
          selectedMonth.month - 1,
          1
        );
        const prevMonth = new Date(selectedMonthDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        // Проверка, что дата начала в текущем или предыдущем месяце
        const isCurrentMonth =
          startDate.getMonth() === selectedMonthDate.getMonth() &&
          startDate.getFullYear() === selectedMonthDate.getFullYear();
        const isPrevMonth =
          startDate.getMonth() === prevMonth.getMonth() &&
          startDate.getFullYear() === prevMonth.getFullYear();

        // Если дата в предыдущем месяце, проверяем, что она в последние 7 дней месяца
        if (isPrevMonth) {
          const lastDayOfPrevMonth = new Date(selectedMonthDate);
          lastDayOfPrevMonth.setDate(0);
          const dayDiff = lastDayOfPrevMonth.getDate() - startDate.getDate();

          if (dayDiff >= 7) {
            errors.startDate =
              "Для предыдущего месяца доступны только последние 7 дней";
          }
        } else if (!isCurrentMonth) {
          errors.startDate = "Дата должна быть в текущем или предыдущем месяце";
        }
      }
    }

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate < startDate) {
        errors.endDate = "Дата окончания не может быть раньше даты начала";
      }

      // Проверка, что неделя длится 7 дней
      const daysDifference = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDifference !== 6) {
        errors.endDate =
          "Неделя должна быть ровно 7 дней (от понедельника до воскресенья)";
      }

      // Если дата начала не в выбранном месяце, проверяем, что дата окончания в выбранном месяце
      if (selectedMonth && startDate.getMonth() !== selectedMonth.month - 1) {
        const isEndDateInCurrentMonth =
          endDate.getMonth() === selectedMonth.month - 1 &&
          endDate.getFullYear() === selectedMonth.year;
        if (!isEndDateInCurrentMonth) {
          errors.endDate = "Неделя должна включать дни выбранного месяца";
        }
      }
    }

    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getNextSunday = (startDateStr: string): string => {
    const startDate = new Date(startDateStr);
    const sundayDate = new Date(startDate);
    sundayDate.setDate(startDate.getDate() + 6); // +6 дней от понедельника = воскресенье
    return sundayDate.toISOString().split("T")[0];
  };

  // Добавляем вспомогательную функцию для определения понедельника
  const isMonday = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    return date.getDay() === 1; // 1 - понедельник в getDay()
  };

  const handleOpenAddWeekModal = (monthId: string) => {
    if (!yearData) return;
    const month = yearData[0].months.find((m) => m.id === monthId);
    if (month) {
      setSelectedMonth({
        year: yearData[0].year || new Date().getFullYear(), // используем год из данных месяца или текущий
        month: month.month,
      });
    }
    setSelectedMonthId(monthId);
    setStartDate("");
    setEndDate("");
    setDateErrors({});
    setIsOpen(true);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Используем новую функцию для проверки понедельника
    if (isMonday(newStartDate)) {
      // Если выбран понедельник
      const sunday = getNextSunday(newStartDate);
      setEndDate(sunday);
      validateDates(newStartDate, sunday);
    } else {
      setEndDate("");
      validateDates(newStartDate, "");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    const expectedSunday = getNextSunday(startDate);

    if (newEndDate !== expectedSunday) {
      setDateErrors((prev) => ({
        ...prev,
        endDate: "Неделя должна заканчиваться в воскресенье",
      }));
    } else {
      setEndDate(newEndDate);
      validateDates(startDate, newEndDate);
    }
  };

  const handleAddWeek = () => {
    if (!selectedMonthId) return;

    if (!validateDates(startDate, endDate)) {
      return;
    }

    createWeekMutation.mutate({
      monthPlanId: selectedMonthId,
      startDate,
      endDate,
    });

    setIsOpen(false);
  };

  const handleDeleteWeek = (weekId: string) => {
    deleteWeekMutation.mutate(weekId);
  };

  if (!yearData || yearData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-primary/50">
          Нет данных за год
        </h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="w-12 h-12 text-primary/50" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      <YearPageHeader year={yearData[0].year} />
      <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <GoalsSection />
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-md border border-border/50 transition-all">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-6">
                Обзор года
              </h2>
              <div className="overflow-x-auto pb-2">
                <div className="flex flex-nowrap gap-6 pb-4 px-1">
                  {yearData[0]?.months.map((month) => (
                    <MonthCard
                      key={month.id}
                      month={month}
                      onAddWeek={() => handleOpenAddWeekModal(month.id)}
                      onDeleteWeek={handleDeleteWeek}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Добавить неделю
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Начало недели (понедельник)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className={`w-full transition-all ${
                  dateErrors.startDate
                    ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]"
                    : "hover:border-primary/50 focus:border-primary"
                }`}
                min={
                  selectedMonth
                    ? (() => {
                        // Получаем первый день предыдущего месяца
                        // Получаем последний день предыдущего месяца
                        const lastDayPrevMonth = new Date(
                          selectedMonth.year,
                          selectedMonth.month - 1,
                          0
                        );
                        // Получаем дату за 7 дней до конца месяца (для ограничения)
                        const limitDay = new Date(lastDayPrevMonth);
                        limitDay.setDate(lastDayPrevMonth.getDate() - 6);
                        return limitDay.toISOString().split("T")[0];
                      })()
                    : undefined
                }
                max={
                  selectedMonth
                    ? `${selectedMonth.year}-${String(
                        selectedMonth.month
                      ).padStart(2, "0")}-31`
                    : undefined
                }
              />
              {dateErrors.startDate && (
                <p className="text-sm text-red-500 mt-1">
                  {dateErrors.startDate}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Можно выбрать понедельник из текущего или предыдущего месяца (до
                7 дней)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Конец недели (воскресенье)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className={`w-full transition-all ${
                  dateErrors.endDate
                    ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]"
                    : "hover:border-primary/50 focus:border-primary"
                }`}
                min={startDate}
                disabled={!startDate || new Date(startDate).getDay() !== 1}
              />
              {dateErrors.endDate && (
                <p className="text-sm text-red-500 mt-1">
                  {dateErrors.endDate}
                </p>
              )}
              {startDate && new Date(startDate).getDay() === 1 && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  {endDate
                    ? "Выбран период с понедельника по воскресенье"
                    : "Конец недели автоматически установлен на воскресенье"}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="hover:bg-background/80"
              >
                Отмена
              </Button>
              <Button
                onClick={handleAddWeek}
                disabled={!!dateErrors.startDate || !!dateErrors.endDate}
                className="relative overflow-hidden group"
              >
                <span className="relative z-10">Сохранить</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
