import { useState } from "react";
import { Input } from "@/components/ui/input";

interface EditableTextProps {
  text: string;
  onSave: (newText: string) => void;
}

export function EditableText({ text, onSave }: EditableTextProps) {
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
    <div onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}
