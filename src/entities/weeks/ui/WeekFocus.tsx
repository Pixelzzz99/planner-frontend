import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useWeekFocuses } from "../hooks/useWeekFocuses";
import { Skeleton } from "@/components/ui/skeleton";

interface WeekFocusProps {
  weekPlanId: string;
}

export function WeekFocus({ weekPlanId }: WeekFocusProps) {
  const { focuses, isLoading, createFocus, updateFocus, deleteFocus } =
    useWeekFocuses(weekPlanId);

  const handleSaveFocus = (id: string, newText: string) => {
    updateFocus({ id, data: { title: newText } });
  };

  const handleAddFocus = () => {
    createFocus({ weekPlanId, title: "Новый фокус" });
  };

  const handleDeleteFocus = (id: string) => {
    deleteFocus(id);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <div className="w-full p-4 rounded-md bg-card border border-border shadow-sm space-y-4 overflow-hidden">
      <h2 className="font-semibold text-lg mb-2 text-foreground">
        Фокусы недели
      </h2>
      <div className="space-y-2">
        {focuses.map((focus) => (
          <div key={focus.id} className="flex items-center gap-2 pr-2">
            <div className="flex-1 min-w-0">
              <EditableText
                text={focus.title}
                onSave={(newText) => handleSaveFocus(focus.id, newText)}
                className="text-foreground hover:bg-accent px-2 py-1 rounded-md w-full"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteFocus(focus.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
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
