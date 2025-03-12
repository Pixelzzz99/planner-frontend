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
import { Loader } from "@/shared/ui/loader";
import { useYearPlan } from "@/entities/year-plan/hooks/useYearPlan";
import { useCreateWeek, useDeleteWeek } from "@/entities/weeks/hooks/use-week";

interface DateError {
  startDate?: string;
  endDate?: string;
}

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
      // Проверка на понедельник
      if (startDate.getDay() !== 1) {
        errors.startDate = "Неделя должна начинаться с понедельника";
      }

      // Проверка правильного месяца
      if (
        selectedMonth &&
        (startDate.getMonth() !== selectedMonth.month - 1 ||
          startDate.getFullYear() !== selectedMonth.year)
      ) {
        errors.startDate = "Дата должна быть в выбранном месяце";
      }
    }

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate < startDate) {
        errors.endDate = "Дата окончания не может быть раньше даты начала";
      }

      // Проверка правильного месяца для конечной даты
      if (
        selectedMonth &&
        (endDate.getMonth() !== selectedMonth.month - 1 ||
          endDate.getFullYear() !== selectedMonth.year)
      ) {
        errors.endDate = "Дата должна быть в выбранном месяце";
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

  const handleOpenAddWeekModal = (monthId: string) => {
    const month = yearData?.find((m) => m.id === monthId);
    if (month) {
      setSelectedMonth({
        year: new Date().getFullYear(), // или получите год из данных месяца
        month: month.month, // предполагая, что у вас есть номер месяца в данных
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

    const startDateObj = new Date(newStartDate);
    if (startDateObj.getDay() === 1) {
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

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Calendrium</h1>
        <YearPageHeader />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <GoalsSection />
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Обзор года
                </h2>
                <div className="overflow-x-auto">
                  <div className="flex flex-nowrap gap-6 pb-4">
                    {yearData?.map((month) => (
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
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Добавить неделю
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Начало недели (понедельник)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className={`w-full ${
                  dateErrors.startDate ? "border-red-500" : ""
                }`}
                min={
                  selectedMonth
                    ? `${selectedMonth.year}-${String(
                        selectedMonth.month
                      ).padStart(2, "0")}-01`
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
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Конец недели (воскресенье)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className={`w-full ${
                  dateErrors.endDate ? "border-red-500" : ""
                }`}
                min={startDate}
                max={startDate ? getNextSunday(startDate) : undefined}
                disabled={!startDate || new Date(startDate).getDay() !== 1}
              />
              {dateErrors.endDate && (
                <p className="text-sm text-red-500 mt-1">
                  {dateErrors.endDate}
                </p>
              )}
              {startDate && new Date(startDate).getDay() === 1 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Конец недели автоматически установлен на воскресенье
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleAddWeek}
                disabled={!!dateErrors.startDate || !!dateErrors.endDate}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
