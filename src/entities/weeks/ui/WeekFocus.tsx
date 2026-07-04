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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirm } from "@/shared/ui/ConfirmDialog";
import { useGoals } from "@/shared/hooks/useGoals";

interface WeekFocusProps {
  weekPlanId: string;
  weekStart?: string;
  embedded?: boolean;
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

export function WeekFocus({ weekPlanId, weekStart, embedded = false }: WeekFocusProps) {
  const goalYear = weekStart
    ? new Date(weekStart).getFullYear()
    : new Date().getFullYear();

  const { goals } = useGoals(goalYear);
  const {
    focuses,
    isLoading,
    createFocus,
    updateFocus,
    deleteFocus,
    updateFocusStatus,
    statusFilter,
    setStatusFilter,
  } = useWeekFocuses(weekPlanId, goalYear);
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<FocusStatus | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGoalId, setNewGoalId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const sortedFocuses = useMemo(() => {
    if (!focuses) return [];
    return [...focuses];
  }, [focuses]);

  const completedCount = sortedFocuses.filter((f) => f.status === FocusStatus.COMPLETED).length;
  const total = sortedFocuses.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleStartAdd = () => {
    setNewTitle("");
    setNewGoalId("");
    setIsAdding(true);
  };

  const handleConfirmAdd = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      createFocus({
        weekPlanId,
        title: trimmed,
        goalId: newGoalId || null,
      });
    }
    setIsAdding(false);
    setNewTitle("");
    setNewGoalId("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTitle("");
    setNewGoalId("");
  };

  const handleTabChange = (value: FocusStatus | null) => {
    setActiveTab(value);
    setStatusFilter(value);
  };

  const handleDeleteFocus = async (focusId: string, title: string) => {
    const ok = await confirm({
      title: "Удалить фокус?",
      description: `«${title}» будет удалён.`,
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (ok) deleteFocus(focusId);
  };

  if (isLoading) {
    return <Skeleton className={embedded ? "w-full h-24" : "w-full h-[180px] rounded-2xl"} />;
  }

  const content = (
    <>
      <div className={cn("px-3", embedded ? "pt-3 pb-2" : "px-4 pt-4 pb-3 border-b border-black/6 dark:border-white/6")}>
        <div className="flex items-center justify-between mb-2">
          {embedded ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {completedCount}/{total} выполнено
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">Фокусы недели</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!embedded && (
              <span className="text-xs text-muted-foreground">{completedCount}/{total}</span>
            )}
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

        <div className="flex gap-1 mt-2 flex-wrap">
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

      <div className="px-3 py-2.5 space-y-1.5">
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
                  {focus.goal && (
                    <p className="text-[10px] text-orange-500/90 truncate px-1 mt-0.5" title={focus.goal.title}>
                      🎯 {focus.goal.title}
                    </p>
                  )}
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
                    {goals.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="text-xs">
                            Привязать к цели
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                            {goals.map((goal) => (
                              <DropdownMenuItem
                                key={goal.id}
                                disabled={focus.goalId === goal.id}
                                className="text-xs"
                                onClick={() =>
                                  updateFocus({ id: focus.id, data: { goalId: goal.id } })
                                }
                              >
                                {goal.title}
                              </DropdownMenuItem>
                            ))}
                            {focus.goalId && (
                              <DropdownMenuItem
                                className="text-xs text-muted-foreground"
                                onClick={() =>
                                  updateFocus({ id: focus.id, data: { goalId: null } })
                                }
                              >
                                Отвязать от цели
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteFocus(focus.id, focus.title)}
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
              className="flex flex-col gap-2 p-2 rounded-xl border border-primary/40 bg-primary/5"
            >
              <div className="flex items-center gap-2">
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
              </div>
              {goals.length > 0 && (
                <select
                  value={newGoalId}
                  onChange={(e) => setNewGoalId(e.target.value)}
                  className="text-[11px] bg-black/5 dark:bg-white/8 border border-black/8 dark:border-white/8 rounded-lg px-2 py-1.5 outline-none text-foreground"
                >
                  <option value="">Без привязки к цели</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      🎯 {goal.title}
                    </option>
                  ))}
                </select>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </>
  );

  if (embedded) return content;

  return (
    <div className="rounded-2xl glass border border-black/8 dark:border-white/8 overflow-hidden">
      {content}
    </div>
  );
}
