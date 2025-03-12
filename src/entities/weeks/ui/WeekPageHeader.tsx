import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WeekPlan } from "../model/types";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatDate } from "date-fns";

interface WeekPageHeaderProps {
  onBack: () => void;
  weekPlan: WeekPlan;
}
export const WeekPageHeader = ({ onBack, weekPlan }: WeekPageHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hover:bg-accent rounded-full p-2 h-10 w-10"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {weekPlan?.startDate &&
                `Неделя ${formatDate(
                  weekPlan.startDate,
                  "dd.MM.yyyy"
                )} - ${formatDate(weekPlan.endDate, "dd.MM.yyyy")}`}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
