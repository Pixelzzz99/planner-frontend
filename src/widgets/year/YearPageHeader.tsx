import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YearPageHeaderProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const YearPageHeader = ({ year, onPrevYear, onNextYear }: YearPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8 px-5 py-3.5 rounded-2xl dark:glass bg-card/90 border border-white/6 shadow-lg">
      <span className="text-xl font-extrabold gradient-text tracking-tight">
        Calendrium
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white/10"
          onClick={onPrevYear}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-2xl font-bold w-20 text-center gradient-text tabular-nums">
          {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white/10"
          onClick={onNextYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 pl-4 border-l border-white/8">
        <ThemeToggle />
      </div>
    </div>
  );
};
