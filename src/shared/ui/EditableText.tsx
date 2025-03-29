import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
}

export function EditableText({ text, onSave, className }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Автоматическая настройка высоты
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [isEditing, value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== text) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn("cursor-text w-full break-words", className)}
    >
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full resize-none overflow-hidden min-h-[24px] p-1"
          rows={1}
          autoFocus
        />
      ) : (
        <span className="block py-1 whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {text}
        </span>
      )}
    </div>
  );
}
