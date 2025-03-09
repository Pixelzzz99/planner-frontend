import { Plus } from "lucide-react";

interface TaskInsertZoneProps {
  onInsert: () => void;
}

export function TaskInsertZone({ onInsert }: TaskInsertZoneProps) {
  return (
    <div
      className="h-2 group hover:h-8 transition-all duration-200 relative my-1"
      onClick={onInsert}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-pointer">
          <Plus className="w-4 h-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
