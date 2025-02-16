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
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";

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

  // Если есть какие-то данные об архиве (пока заглушка):
  const [archive, setArchive] = useState<any[]>([]);

  // Пример: если вы загружаете данные с бэка, тогда у вас может быть флаг:
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Страница Года</h1>
      {/** Блок с целями */}
      {/** Блок с месяцами - теперь это сетка */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[10rem] w-full">
          {/* Простейший "спиннер" или Loader */}
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="flex gap-4">
          <GoalsSection />
          <div>
            <h2 className="text">Обзод года</h2>
            <ScrollArea className="w-fit whitespace-nowrap rounded-md border">
              <div className="flex  space-x-4 p-4">
                {yearData.map((month) => (
                  <div key={month.id}>
                    <h2 className="font-semibold mb-2 text-center">
                      {month.name}
                    </h2>
                    <div className="space-y-1">
                      {month.weeks.map((week) => (
                        <Link
                          key={week.id}
                          href={`/dashboard/week?weekId=${week.id}`}
                          className="block bg-gray-100 rounded-md p-2 hover:bg-gray-200 text-sm"
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
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
      {/** Архив задач */}
      <div className="border p-4 rounded-md">
        <h2 className="text-xl mb-2">Архив задач</h2>
        {archive.length === 0 && (
          <div className="text-sm text-gray-500">Архив пока пустой</div>
        )}
        {/* Если архив есть, выводите блоки архива */}
      </div>
      {/* Модалка "Добавить неделю" */}
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
