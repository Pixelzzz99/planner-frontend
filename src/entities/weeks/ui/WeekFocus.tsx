import { EditableText } from "@/shared/ui/EditableText";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Check,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { useWeekFocuses } from "../hooks/useWeekFocuses";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import {
  FocusStatus,
  focusStatusLabels,
  focusStatusColors,
} from "../model/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface WeekFocusProps {
  weekPlanId: string;
}

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

  const [activeTab, setActiveTab] = useState<string>("all");

  // Сортируем фокусы по дате создания
  const sortedFocuses = useMemo(() => {
    if (!focuses) return [];
    return [...focuses].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [focuses]);

  const handleSaveFocus = (id: string, newText: string) => {
    updateFocus({ id, data: { title: newText } });
  };

  const handleAddFocus = () => {
    createFocus({ weekPlanId, title: "Новый фокус" });
  };

  const handleDeleteFocus = (id: string) => {
    deleteFocus(id);
  };

  const getStatusIcon = (status: FocusStatus) => {
    switch (status) {
      case FocusStatus.COMPLETED:
        return <Check size={16} className="text-green-600" />;
      case FocusStatus.CANCELED:
        return <XCircle size={16} className="text-red-600" />;
      case FocusStatus.IN_PROGRESS:
      default:
        return <Clock size={16} className="text-blue-600" />;
    }
  };

  // Функция для изменения фильтра по табам
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      setStatusFilter(null);
    } else if (Object.values(FocusStatus).includes(value as FocusStatus)) {
      setStatusFilter(value as FocusStatus);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[260px] rounded-lg" />;
  }

  return (
    <div className="w-full p-5 rounded-lg bg-card border border-border shadow-sm space-y-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-foreground">Фокусы недели</h2>
        <Button
          size="sm"
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
          onClick={handleAddFocus}
        >
          <Plus size={18} className="mr-1" /> Добавить
        </Button>
      </div>

      {/* Табы для фильтрации */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full border-b border-border/50"
        defaultValue="all"
      >
        <TabsList className="w-full grid grid-cols-4 mb-3">
          <TabsTrigger value="all" className="text-xs">
            Все
          </TabsTrigger>
          <TabsTrigger
            value={FocusStatus.IN_PROGRESS}
            className="text-xs text-blue-600"
          >
            В процессе
          </TabsTrigger>
          <TabsTrigger
            value={FocusStatus.COMPLETED}
            className="text-xs text-green-600"
          >
            Выполнены
          </TabsTrigger>
          <TabsTrigger
            value={FocusStatus.CANCELED}
            className="text-xs text-red-600"
          >
            Отменены
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-muted/50">
        <AnimatePresence>
          {sortedFocuses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-muted-foreground py-8 bg-muted/20 rounded-lg"
            >
              {statusFilter
                ? "Нет фокусов с выбранным статусом"
                : "Нет фокусов. Добавьте первый!"}
            </motion.div>
          ) : (
            sortedFocuses.map((focus, index) => (
              <motion.div
                key={focus.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-2 group p-3 rounded-lg transition-all",
                  "border border-transparent hover:border-border/80",
                  focusStatusColors[focus.status].bg.replace(
                    "bg-",
                    "hover:bg-"
                  ) + "/10"
                )}
              >
                {getStatusIcon(focus.status)}
                <div className="flex-1 min-w-0 break-words">
                  <EditableText
                    text={focus.title}
                    onSave={(newText) => handleSaveFocus(focus.id, newText)}
                    className={cn(
                      "px-2 py-1 rounded-md w-full break-words",
                      focusStatusColors[focus.status].text,
                      "hover:bg-accent/30 transition-colors"
                    )}
                  />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0",
                    focusStatusColors[focus.status].bg + "/40",
                    focusStatusColors[focus.status].text
                  )}
                >
                  {focusStatusLabels[focus.status]}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Изменить статус
                    </div>
                    {Object.values(FocusStatus).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => updateFocusStatus(focus.id, status)}
                        disabled={focus.status === status}
                        className={cn(
                          "flex items-center cursor-pointer",
                          focus.status === status && "bg-accent/50"
                        )}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-2">
                          {focusStatusLabels[status]}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteFocus(focus.id)}
                      className="text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {focuses.length > 0 && (
        <Button
          variant="outline"
          className="w-full mt-3 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors text-primary"
          onClick={handleAddFocus}
        >
          <Plus className="mr-2" /> Добавить фокус
        </Button>
      )}
    </div>
  );
}
