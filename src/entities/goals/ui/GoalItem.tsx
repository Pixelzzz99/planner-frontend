import { Goal } from "@/entities/goals/model/goal.dto";
import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import { Trash2, Check, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  TODO:        { icon: <Circle size={13} className="text-muted-foreground/50" />, label: "Ожидает" },
  IN_PROGRESS: { icon: <Clock  size={13} className="text-sky-500" />,            label: "В работе" },
  COMPLETED: { icon: <Check  size={13} className="text-emerald-500" />,         label: "Готово"   },
} as const;

interface GoalItemProps {
  goal: Goal;
  onUpdate: (newText: string) => void;
  onDelete: () => void;
  onStatusChange: (value: string) => void;
}

const STATUS_ORDER: Array<Goal["status"]> = ["TODO", "IN_PROGRESS", "COMPLETED"];

export function GoalItem({ goal, onUpdate, onDelete, onStatusChange }: GoalItemProps) {
  const isCompleted = goal.status === "COMPLETED";

  const handleCycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(goal.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    onStatusChange(next);
  };

  const cfg = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.TODO;

  return (
    <div className={cn(
      "group flex items-center gap-2 px-2 py-2 rounded-xl transition-all",
      "hover:bg-black/5 dark:hover:bg-white/5",
      isCompleted && "opacity-60"
    )}>
      {/* Status cycle button */}
      <button
        onClick={handleCycleStatus}
        className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full hover:bg-primary/15 transition-colors"
        title={cfg.label}
      >
        {cfg.icon}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <EditableText
          text={goal.title}
          onSave={onUpdate}
          className={cn(
            "text-xs w-full rounded-md px-1 py-0.5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors text-foreground",
            isCompleted && "line-through text-muted-foreground",
          )}
        />
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/15 hover:text-destructive flex-shrink-0"
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
}
