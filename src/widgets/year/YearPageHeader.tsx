import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const YearPageHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8 p-4 rounded-lg bg-background/95 backdrop-blur-sm shadow-sm border border-border/50">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Calendrium
      </h1>
      <h1 className="text-3xl font-bold relative">
        <span className="relative z-10">2024</span>
        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 blur-sm rounded-full"></span>
      </h1>
      <div className="flex items-center gap-4 pl-4 border-l border-border/50">
        <ThemeToggle />
      </div>
    </div>
  );
};
