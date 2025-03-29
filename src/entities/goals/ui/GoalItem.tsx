import { Goal } from "@/entities/goals/model/goal.dto";
import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const statusStyles = {
  TODO: "bg-secondary/80 text-secondary-foreground",
  IN_PROGRESS:
    "bg-blue-100/80 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300",
  COMPLETED:
    "bg-green-100/80 dark:bg-green-900/80 text-green-700 dark:text-green-300",
};

const statusLabels = {
  TODO: "К выполнению",
  IN_PROGRESS: "В процессе",
  COMPLETED: "Завершено",
};

interface GoalItemProps {
  goal: Goal;
  onUpdate: (newText: string) => void;
  onDelete: () => void;
  onStatusChange: (value: string) => void;
}

export function GoalItem({
  goal,
  onUpdate,
  onDelete,
  onStatusChange,
}: GoalItemProps) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-3 p-3 hover:bg-accent/30 rounded-lg transition-all">
      <div className="flex-1 min-w-0">
        <EditableText
          text={goal.title}
          onSave={onUpdate}
          className="text-foreground hover:bg-accent/50 px-3 py-1.5 rounded-md w-full transition-colors font-medium"
        />
      </div>

      <div className="flex items-center gap-3 mt-2 sm:mt-0">
        <Select value={goal.status} onValueChange={onStatusChange}>
          <SelectTrigger
            className={`h-7 px-3 text-sm font-medium rounded-full border-none ${
              statusStyles[goal.status as keyof typeof statusStyles]
            } transition-all backdrop-blur-sm`}
          >
            <SelectValue>
              {statusLabels[goal.status as keyof typeof statusLabels]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">К выполнению</SelectItem>
            <SelectItem value="IN_PROGRESS">В процессе</SelectItem>
            <SelectItem value="COMPLETED">Завершено</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-2 h-8 w-8 transition-colors"
        >
          <Trash2 size={16} className="transition-transform hover:scale-110" />
        </Button>
      </div>
    </div>
  );
}
