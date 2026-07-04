"use client";

import { Button } from "@/components/ui/button";
import { EditableText } from "@/shared/ui/EditableText";
import { Trash2, Plus, Loader2, Layers } from "lucide-react";
import { Category } from "../model/category.model";
import { getCategoryColor } from "@/shared/lib/utils/color";
import { useMemo } from "react";
import { Task } from "@/entities/task";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/shared/ui/ConfirmDialog";

interface TaskCategoriesProps {
  categories: Category[];
  tasks?: Task[];
  onAddCategory: () => void;
  onEditCategory: (id: string, changes: { name?: string; plannedTime?: number }) => void;
  onDeleteCategory: (id: string) => void;
  isLoading?: boolean;
}

export function TaskCategories({
  categories,
  tasks = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isLoading,
}: TaskCategoriesProps) {
  const confirm = useConfirm();
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    [categories]
  );

  const actualTime = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => (map[c.id] = 0));
    tasks.forEach((t) => {
      if (t.categoryId && !t.isArchived) {
        map[t.categoryId] = (map[t.categoryId] || 0) + (t.duration || 0);
      }
    });
    return map;
  }, [categories, tasks]);

  return (
    <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Layers className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold text-sm text-foreground">Категории</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddCategory}
            disabled={isLoading}
            className="h-7 w-7 p-0 rounded-lg hover:bg-primary/15 hover:text-primary"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="px-3 py-2.5 space-y-1">
        {sortedCategories.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground/50 text-xs">
            Нет категорий
          </div>
        ) : (
          sortedCategories.map((cat) => {
            const color = getCategoryColor(cat.id);
            const planned = cat.plannedTime || 0;
            const actual = actualTime[cat.id] || 0;
            const pct = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
            const over = actual > planned && planned > 0;

            return (
              <div
                key={cat.id}
                className="group flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {/* Color dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <EditableText
                    text={cat.name}
                    onSave={(n) => onEditCategory(cat.id, { name: n })}
                    className="text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/8 px-1 py-0.5 rounded-md w-full"
                  />

                  {/* Progress bar */}
                  {planned > 0 && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: over ? "#EF4444" : color,
                          }}
                        />
                      </div>
                      <span className={cn("text-[10px] tabular-nums", over ? "text-red-500" : "text-muted-foreground")}>
                        {actual}/{planned}м
                      </span>
                    </div>
                  )}

                  {planned === 0 && actual > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 pl-1">
                      {actual}м
                    </span>
                  )}
                </div>

                {/* Planned time editable */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditableText
                    text={`${cat.plannedTime || 0}`}
                    onSave={(v) => onEditCategory(cat.id, { plannedTime: Number(v) || 0 })}
                    className="text-[10px] w-8 text-center text-muted-foreground hover:bg-black/8 dark:hover:bg-white/10 rounded px-0.5"
                  />
                  <span className="text-[10px] text-muted-foreground/50">м</span>
                </div>

                {/* Delete */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Удалить категорию?",
                      description: `«${cat.name}» будет удалена.`,
                      confirmLabel: "Удалить",
                      destructive: true,
                    });
                    if (ok) onDeleteCategory(cat.id);
                  }}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/15 hover:text-destructive flex-shrink-0"
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Add button at bottom if there are categories */}
      {sortedCategories.length > 0 && (
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            className="w-full h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8 rounded-xl"
            onClick={onAddCategory}
            disabled={isLoading}
          >
            <Plus className="h-3 w-3" />
            Добавить категорию
          </Button>
        </div>
      )}
    </div>
  );
}
