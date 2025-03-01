"use client";

import { useState, useEffect } from "react";
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
import { createWeek } from "@/entities/weeks/api/week.api";
import { fetchYearPlan } from "@/entities/year-plan/api/year-plan.api";
import { useSession } from "next-auth/react";
import { Loader } from "@/shared/ui/loader";
import { MonthsPlan } from "@/entities/year-plan/model/year-plan.model";

export default function YearDashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [yearData, setYearData] = useState<MonthsPlan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isLoading = !yearData.length;

  useEffect(() => {
    if (userId) {
      fetchYearPlan(userId).then((data) => setYearData(data[0].months));
    }
  }, [userId]);

  const handleOpenAddWeekModal = (monthId: string) => {
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

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      <YearPageHeader />

      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                  {yearData.map((month) => (
                    <MonthCard
                      key={month.id}
                      month={month}
                      onAddWeek={() => handleOpenAddWeekModal(month.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
                Начало недели
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Конец недели
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
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
