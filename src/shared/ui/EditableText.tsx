import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
}

export function EditableText({ text, onSave, className }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== text) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn("cursor-text", className)}
    >
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="min-w-[200px]"
          autoFocus
        />
      ) : (
        <span className="block py-1">{text}</span>
      )}
    </div>
  );
}
