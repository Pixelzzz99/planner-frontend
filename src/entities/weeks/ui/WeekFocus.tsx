import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Check,
  XCircle,
  Clock,
  MoreHorizontal,
  Target,
} from "lucide-react";
import { useWeekFocuses } from "../hooks/useWeekFocuses";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState, useRef, useEffect } from "react";
import { FocusStatus, focusStatusLabels } from "../model/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WeekFocusProps {
  weekPlanId: string;
}

const STATUS_ICON: Record<FocusStatus, React.ReactNode> = {
  [FocusStatus.COMPLETED]:   <Check   size={14} className="text-emerald-500 shrink-0 mt-0.5" />,
  [FocusStatus.CANCELED]:    <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />,
  [FocusStatus.IN_PROGRESS]: <Clock   size={14} className="text-sky-500 shrink-0 mt-0.5" />,
};

const STATUS_RING: Record<FocusStatus, string> = {
  [FocusStatus.COMPLETED]:   "border-emerald-500/40 bg-emerald-500/8",
  [FocusStatus.CANCELED]:    "border-red-500/30 bg-red-500/5 opacity-60",
  [FocusStatus.IN_PROGRESS]: "border-sky-500/30 bg-sky-500/5",
};

const FILTER_TABS: { label: string; value: FocusStatus | null }[] = [
  { label: "Все",       value: null },
  { label: "В работе", value: FocusStatus.IN_PROGRESS },
  { label: "Готово",   value: FocusStatus.COMPLETED },
  { label: "Отменено", value: FocusStatus.CANCELED },
];

export function WeekFocus({ weekPlanId }: WeekFocusProps) {
  const {
    focuses,
    isLoading,
    createFocus,
    updateFocus,
    deleteFocus,
    updateFocusStatus,
    statusFilter,
    setStatusFilter,
  } = useWeekFocuses(weekPlanId);

  const [activeTab, setActiveTab] = useState<FocusStatus | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const sortedFocuses = useMemo(() => {
    if (!focuses) return [];
    return [...focuses].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [focuses]);

  const completedCount = sortedFocuses.filter((f) => f.status === FocusStatus.COMPLETED).length;
  const total = sortedFocuses.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleStartAdd = () => {
    setNewTitle("");
    setIsAdding(true);
  };

  const handleConfirmAdd = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      createFocus({ weekPlanId, title: trimmed });
    }
    setIsAdding(false);
    setNewTitle("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTitle("");
  };

  const handleTabChange = (value: FocusStatus | null) => {
    setActiveTab(value);
    setStatusFilter(value);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[180px] rounded-2xl" />;
  }

  return (
    <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground">Фокусы недели</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{completedCount}/{total}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-lg hover:bg-primary/15 hover:text-primary"
              onClick={handleStartAdd}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="h-1 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #8B5CF6, #06B6D4)",
              }}
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={String(tab.value)}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Focus list */}
      <div className="px-3 py-2.5 space-y-1.5 max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {sortedFocuses.length === 0 && !isAdding ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center text-muted-foreground/60 text-xs"
            >
              {statusFilter ? "Нет фокусов с таким статусом" : "Нажмите + чтобы добавить"}
            </motion.div>
          ) : (
            sortedFocuses.map((focus) => (
              <motion.div
                key={focus.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors group",
                  STATUS_RING[focus.status]
                )}
              >
                <div>{STATUS_ICON[focus.status]}</div>

                <div className="flex-1 min-w-0">
                  <EditableText
                    text={focus.title}
                    onSave={(t) => updateFocus({ id: focus.id, data: { title: t } })}
                    className={cn(
                      "text-xs w-full rounded-md px-1 py-0.5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors",
                      focus.status === FocusStatus.CANCELED && "line-through text-muted-foreground",
                      focus.status === FocusStatus.COMPLETED && "text-emerald-600 dark:text-emerald-400"
                    )}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-black/8 dark:hover:bg-white/10"
                    >
                      <MoreHorizontal size={13} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {Object.values(FocusStatus).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => updateFocusStatus(focus.id, s)}
                        disabled={focus.status === s}
                        className="flex items-center gap-2 text-xs"
                      >
                        {STATUS_ICON[s]}
                        {focusStatusLabels[s]}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteFocus(focus.id)}
                      className="text-destructive flex items-center gap-2 text-xs"
                    >
                      <Trash2 size={13} />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Inline input for new focus */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              key="new-input"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 p-2 rounded-xl border border-primary/40 bg-primary/5"
            >
              <Clock size={14} className="text-sky-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmAdd();
                  if (e.key === "Escape") handleCancelAdd();
                }}
                onBlur={handleConfirmAdd}
                placeholder="Название фокуса..."
                className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom add button */}
      {(total > 0 || isAdding) && !isAdding && (
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            className="w-full h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8 rounded-xl"
            onClick={handleStartAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            Добавить фокус
          </Button>
        </div>
      )}
    </div>
  );
}
