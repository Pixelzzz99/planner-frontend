"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  const handleSubmit = () => {
    onSubmit({
      ...initialData,
      title,
      description,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Название задачи</Label>
        <Input
          id="title"
          placeholder="Например, купить продукты"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="title">Описание задачи</Label>
        <Textarea
          id="description"
          placeholder="Детали задачи"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSubmit}>Сохранить</Button>
      </div>
    </div>
  );
}
