import { useState } from "react";
import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function WeekFocus() {
  const [focuses, setFocuses] = useState([
    { id: "focus-1", text: "Фокус #1" },
    { id: "focus-2", text: "Фокус #2" },
  ]);

  const handleSaveFocus = (id: string, newText: string) => {
    setFocuses((prev) =>
      prev.map((focus) =>
        focus.id === id ? { ...focus, text: newText } : focus
      )
    );
  };

  const handleAddFocus = () => {
    const newFocus = { id: `focus-${Date.now()}`, text: "Новый фокус" };
    setFocuses((prev) => [...prev, newFocus]);
  };

  return (
    <div className="w-full p-4 border rounded-md bg-white shadow space-y-4">
      <h2 className="font-semibold text-lg mb-2">Фокусы недели</h2>
      <div className="space-y-2">
        {focuses.map((focus) => (
          <EditableText
            key={focus.id}
            text={focus.text}
            onSave={(newText) => handleSaveFocus(focus.id, newText)}
          />
        ))}
      </div>
      <Button variant="outline" className="w-full" onClick={handleAddFocus}>
        <Plus className="mr-2" /> Добавить фокус
      </Button>
    </div>
  );
}
