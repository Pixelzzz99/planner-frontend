import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Archive, CalendarIcon, Clock, Tags } from "lucide-react";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  taskForm: any;
  setTaskForm: (value: any) => void;
  onSubmit: () => void;
  onArchive: () => void;
}

export function TaskSheet({
  isOpen,
  onClose,
  taskForm,
  setTaskForm,
  onSubmit,
  onArchive,
}: TaskSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* 
        h-full + flex-col: чтобы футер был прижат к низу 
        (flex-1 содержимого «растягивается»), 
        а Footer оставался снизу даже при небольшом количестве контента.
      */}
      <SheetContent className="w-[90vw] sm:w-[50vw] sm:max-w-[50vw] h-full flex flex-col overflow-hidden rounded-md border bg-white shadow-lg">
        {/* Шапка */}
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                {taskForm.id ? "Редактировать задачу" : "Новая задача"}
              </h2>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Основное содержимое (flex-1, чтобы «тянуться») */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Поле «Заголовок» */}
          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">
              Заголовок
            </Label>
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Например: «Подготовить отчёт»"
              className="
                border-gray-300
                focus-visible:ring-blue-600
                focus-visible:ring-1
              "
            />
          </div>

          {/* Мета-информация */}
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" className="h-8 gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Сегодня</span>
            </Button>
            <Button variant="outline" className="h-8 gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Установить время</span>
            </Button>
            <Button variant="outline" className="h-8 gap-2">
              <Tags className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Добавить метки</span>
            </Button>
          </div>

          {/* Описание */}
          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">
              Описание
            </Label>
            <Textarea
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Добавьте описание задачи..."
              className="
                min-h-[120px]
                border border-gray-300
                rounded-md
                p-2
                placeholder:text-gray-400
                focus-visible:ring-1
                focus-visible:ring-blue-600
              "
            />
          </div>

          {/* Статус */}
          <button
            type="button"
            onClick={() =>
              setTaskForm((prev) => ({ ...prev, done: !prev.done }))
            }
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-md
              border
              border-gray-200
              bg-gray-50
              p-3
              text-left
              hover:bg-gray-100
              transition-colors
            "
          >
            <Switch
              checked={taskForm.done}
              className="data-[state=checked]:bg-green-600"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {taskForm.done ? "Задача выполнена" : "В процессе"}
              </div>
              <div className="text-xs text-gray-500">
                {taskForm.done
                  ? "Нажмите, чтобы отметить как невыполненную"
                  : "Нажмите, чтобы отметить как выполненную"}
              </div>
            </div>
          </button>
        </div>

        {/* Футер (в самом низу) */}
        <SheetFooter className="border-t px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onArchive}
            className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <Archive className="h-4 w-4" />
            <span className="text-sm">В архив</span>
          </Button>
          <Button
            onClick={onSubmit}
            className="px-4 rounded-md"
            variant="ghost"
          >
            {taskForm.id ? "Сохранить" : "Создать"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
