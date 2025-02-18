"use client";

import { useState } from "react";
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

const initialYearData = [
  { id: 1, name: "Январь", weeks: [] },
  { id: 2, name: "Февраль", weeks: [] },
  { id: 3, name: "Март", weeks: [] },
  { id: 4, name: "Апрель", weeks: [] },
  { id: 5, name: "Май", weeks: [] },
  { id: 6, name: "Июнь", weeks: [] },
  { id: 7, name: "Июль", weeks: [] },
  { id: 8, name: "Август", weeks: [] },
  { id: 9, name: "Сентябрь", weeks: [] },
  { id: 10, name: "Октябрь", weeks: [] },
  { id: 11, name: "Ноябрь", weeks: [] },
  { id: 12, name: "Декабрь", weeks: [] },
];

export default function YearDashboardPage() {
  const [yearData, setYearData] = useState(initialYearData);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState<number | null>(null);
  const [newWeekLabel, setNewWeekLabel] = useState("");

  const isLoading = false;

  const handleOpenAddWeekModal = (monthId: number) => {
    setSelectedMonthId(monthId);
    setNewWeekLabel("");
    setIsOpen(true);
  };

  const handleAddWeek = () => {
    if (!selectedMonthId) return;

    const updated = yearData.map((month) => {
      if (month.id === selectedMonthId) {
        const newWeek = {
          id: Date.now(),
          label: newWeekLabel || "Новая неделя",
        };
        return { ...month, weeks: [...month.weeks, newWeek] };
      }
      return month;
    });

    setYearData(updated);
    setIsOpen(false);
  };

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
        // Grid: 1 колонка на мобильных, 12 колонок на lg
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Левая колонка: GoalsSection */}
          <div className="lg:col-span-4">
            <GoalsSection />
          </div>

          {/* Правая колонка: Обзор года */}
          <div className="lg:col-span-8 flex flex-col min-w-0 min-h-0">
            <h2 className="text-xl font-bold mb-4">Обзор года</h2>
            {/* Горизонтальный скролл-контейнер */}
            <div className="w-full overflow-x-auto">
              <div className="flex space-x-4 p-4 w-max">
                {yearData.map((month) => (
                  <div
                    key={month.id}
                    className="w-[220px] border p-4 rounded-md flex-shrink-0"
                  >
                    <h3 className="font-semibold mb-2 text-center">
                      {month.name}
                    </h3>
                    <div className="space-y-1">
                      {month.weeks.map((week) => (
                        <Link
                          key={week.id}
                          href={`/dashboard/week?weekId=${week.id}`}
                        >
                          {week.label}
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

      {/* Модальное окно "Добавить неделю" */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить неделю</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Диапазон (например 03.02-09.02)
            </label>
            <Input
              type="text"
              placeholder="03.02-09.02"
              value={newWeekLabel}
              onChange={(e) => setNewWeekLabel(e.target.value)}
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
