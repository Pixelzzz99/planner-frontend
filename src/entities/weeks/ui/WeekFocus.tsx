import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWeekFocuses } from "../hooks/useWeekFocuses";
import { Skeleton } from "@/components/ui/skeleton";

interface WeekFocusProps {
  weekPlanId: string;
}

export function WeekFocus({ weekPlanId }: WeekFocusProps) {
  const { focuses, isLoading, createFocus, updateFocus } =
    useWeekFocuses(weekPlanId);

  const handleSaveFocus = (id: number, newText: string) => {
    updateFocus({ id, data: { title: newText } });
  };

  const handleAddFocus = () => {
    createFocus({ weekPlanId, title: "Новый фокус" });
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <div className="w-full p-4 rounded-md bg-card border border-border shadow-sm space-y-4">
      <h2 className="font-semibold text-lg mb-2 text-foreground">
        Фокусы недели
      </h2>
      <div className="space-y-2">
        {focuses.map((focus) => (
          <EditableText
            key={focus.id}
            text={focus.title}
            onSave={(newText) => handleSaveFocus(focus.id, newText)}
            className="text-foreground hover:bg-accent px-2 py-1 rounded-md"
          />
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full hover:bg-accent"
        onClick={handleAddFocus}
      >
        <Plus className="mr-2" /> Добавить фокус
      </Button>
    </div>
  );
}
