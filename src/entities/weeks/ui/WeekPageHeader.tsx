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
    <div className="fixed top-0 left-0 right-0 z-20 dark:glass bg-background/90 backdrop-blur-md border-b border-white/6">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full p-0 hover:bg-white/10 hover:text-white"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                Неделя
              </p>
              <h1 className="text-lg font-bold gradient-text leading-tight">
                {weekPlan?.startDate &&
                  `${formatDate(weekPlan.startDate, "dd.MM")} — ${formatDate(weekPlan.endDate, "dd.MM.yyyy")}`}
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
