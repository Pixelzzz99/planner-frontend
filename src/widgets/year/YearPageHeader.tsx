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
    <div className="flex items-center justify-between mb-8 p-4 rounded-lg bg-background/95 backdrop-blur-sm shadow-sm border border-border/50">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Calendrium
      </h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPrevYear}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold relative min-w-[5rem] text-center">
          <span className="relative z-10">{year}</span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 blur-sm rounded-full" />
        </h1>
        <Button variant="ghost" size="icon" onClick={onNextYear}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4 pl-4 border-l border-border/50">
        <ThemeToggle />
      </div>
    </div>
  );
};
