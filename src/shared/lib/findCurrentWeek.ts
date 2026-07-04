import { YearPlan } from "@/entities/year-plan/model/year-plan.model";

export function findCurrentWeekId(
  yearPlans: YearPlan[] | undefined,
  date = new Date(),
): string | null {
  if (!yearPlans?.length) return null;

  const year = date.getFullYear();
  const yearPlan = yearPlans.find((y) => y.year === year);
  if (!yearPlan) return null;

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  for (const month of yearPlan.months) {
    for (const week of month.weekPlans) {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (today >= start && today <= end) return week.id;
    }
  }

  return null;
}
