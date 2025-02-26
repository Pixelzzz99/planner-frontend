"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoalsSection } from "@/widgets/goals/GoalsSection";
import { createWeek } from "@/entities/weeks/api/week.api";
import { fetchYearPlan } from "@/entities/year-plan/api/year-plan.api";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

export default function YearDashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [yearData, setYearData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isLoading = !yearData.length;

  useEffect(() => {
    if (userId) {
      fetchYearPlan(userId).then((data) => setYearData(data[0].months));
    }
  }, [userId]);

  const handleOpenAddWeekModal = (monthId: number) => {
    setSelectedMonthId(monthId);
    setStartDate("");
    setEndDate("");
    setIsOpen(true);
  };

  const handleAddWeek = async () => {
    if (!selectedMonthId) return;

    const newWeek = await createWeek({
      monthPlanId: selectedMonthId,
      startDate,
      endDate,
    });

    const updated = yearData.map((month) => {
      if (month.id === selectedMonthId) {
        return { ...month, weekPlans: [...month.weekPlans, newWeek] };
      }
      return month;
    });

    setYearData(updated);
    setIsOpen(false);
  };

  const formatDate = (date: string) => format(new Date(date), "dd.MM.yyyy");

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Страница Года</h1>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[10rem] w-full">
          <svg
            className="animate-spin h-8 w-8 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <GoalsSection />
          </div>

          <div className="lg:col-span-8 flex flex-col min-w-0 min-h-0">
            <h2 className="text-xl font-bold mb-4">Обзор года</h2>
            <div className="w-full overflow-x-auto">
              <div className="flex space-x-4 p-4 w-max">
                {yearData.map((month) => (
                  <div
                    key={month.id}
                    className="w-[220px] border p-4 rounded-md flex-shrink-0"
                  >
                    <h3 className="font-semibold mb-2 text-center">
                      {month.month}
                    </h3>
                    <div className="space-y-1">
                      {month.weekPlans.map((week) => (
                        <Link
                          key={week.id}
                          href={`/dashboard/week?weekId=${week.id}`}
                          className="block p-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {formatDate(week.startDate)} -{" "}
                          {formatDate(week.endDate)}
                        </Link>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => handleOpenAddWeekModal(month.id)}
                    >
                      + Добавить неделю
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить неделю</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Начало недели
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="block text-sm font-medium text-gray-700">
              Конец недели
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddWeek}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
