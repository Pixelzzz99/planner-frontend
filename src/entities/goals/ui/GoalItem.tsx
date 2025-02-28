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
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
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
    <div className="group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1 flex items-center gap-3">
        <EditableText
          text={goal.title}
          onSave={onUpdate}
          className="text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md flex-1"
        />
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <Select value={goal.status} onValueChange={onStatusChange}>
          <SelectTrigger
            className={`h-7 px-3 text-sm font-medium rounded-full border-none ${
              statusStyles[goal.status as keyof typeof statusStyles]
            }`}
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
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 h-8 w-8"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
