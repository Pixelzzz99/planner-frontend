import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
  /** When true, selects all text on enter-edit so typing immediately replaces it */
  selectAllOnEdit?: boolean;
}

export function EditableText({ text, onSave, className, selectAllOnEdit = true }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep value in sync when text prop changes externally
  useEffect(() => {
    if (!isEditing) setValue(text);
  }, [text, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
      el.focus();
      if (selectAllOnEdit) {
        el.select();
      } else {
        // Place cursor at end
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [isEditing, selectAllOnEdit]);

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== text) {
      onSave(trimmed);
    } else if (!trimmed) {
      // Revert to original if left empty
      setValue(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      setValue(text);
      setIsEditing(false);
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
          onChange={(e) => {
            setValue(e.target.value);
            // Auto-resize
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full resize-none overflow-hidden min-h-[24px] p-1 text-inherit bg-transparent border-primary/40"
          rows={1}
        />
      ) : (
        <span className="block py-1 whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {text}
        </span>
      )}
    </div>
  );
}
