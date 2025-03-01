import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const YearPageHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-foreground">2024</h1>
      <div className="flex items-center gap-4">
        <Button variant="outline">Экспорт</Button>
        <ThemeToggle />
      </div>
    </div>
  );
};
