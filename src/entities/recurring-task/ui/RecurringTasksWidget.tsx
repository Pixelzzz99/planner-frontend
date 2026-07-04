"use client";

import { Repeat, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import { useConfirm } from "@/shared/ui/ConfirmDialog";
import { DAYS } from "@/shared/constants/days";

interface RecurringTasksWidgetProps {
  weekId: string;
  embedded?: boolean;
}

export function RecurringTasksWidget({
  weekId,
  embedded = false,
}: RecurringTasksWidgetProps) {
  const {
    templates,
    isLoading,
    applyToWeek,
    deactivateTemplate,
    isApplying,
  } = useRecurringTasks(weekId);
  const confirm = useConfirm();

  const dayLabel = (day: number) =>
    DAYS.find((d) => d.id === day)?.label.slice(0, 2) ?? String(day);

  const content = (
    <>
      <div className={`px-3 ${embedded ? "pt-3 pb-2" : "px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6"} flex items-center justify-between gap-2`}>
        {!embedded && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Repeat className="h-4 w-4 text-violet-500" />
            </div>
            <span className="font-semibold text-sm">Повторяющиеся</span>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className={`h-7 text-[10px] px-2 ${embedded ? "ml-auto" : ""}`}
          disabled={isApplying || templates.length === 0}
          onClick={() => applyToWeek()}
        >
          {isApplying ? "..." : "Добавить на неделю"}
        </Button>
      </div>

      <div className="p-2 space-y-1">
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-4 px-2">
            При создании задачи включите «Повторять каждую неделю»
          </p>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group"
            >
              <span className="text-[10px] text-muted-foreground w-6 shrink-0">
                {dayLabel(t.day)}
              </span>
              <span className="text-xs flex-1 truncate">{t.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Убрать повторение?",
                    description: `«${t.title}» больше не будет добавляться автоматически.`,
                    confirmLabel: "Убрать",
                    destructive: true,
                  });
                  if (ok) deactivateTemplate(t.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );

  if (embedded) return content;

  return (
    <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
      {content}
    </div>
  );
}
