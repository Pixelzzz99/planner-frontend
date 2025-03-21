import { Button } from "@/components/ui/button";
import { EditableText } from "@/shared/ui/EditableText";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Category } from "../model/category.model";
import { getCategoryColor } from "@/shared/lib/utils/color";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TaskCategoriesProps {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (
    id: string,
    changes: { name?: string; plannedTime?: number }
  ) => void;
  onDeleteCategory: (id: string) => void;
  isLoading?: boolean;
}

export function TaskCategories({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isLoading,
}: TaskCategoriesProps) {
  return (
    <div className="border border-border p-4 rounded-md shadow-sm bg-card">
      <h2 className="font-semibold mb-4 text-xl text-foreground">
        Категории задач
      </h2>

      <Button
        variant="outline"
        onClick={() => onAddCategory()}
        className="flex items-center gap-2 w-full mb-4 hover:bg-accent"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Plus size={18} />
        )}
        Добавить категорию
      </Button>

      {categories.length === 0 ? (
        <div className="text-muted-foreground text-sm mt-3 text-center">
          Категории отсутствуют
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Время (план/факт)</TableHead>
              <TableHead className="w-[80px] text-center">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="group">
                <TableCell>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(category.id) }}
                  />
                </TableCell>
                <TableCell>
                  <EditableText
                    text={category.name}
                    className="text-foreground text-md font-medium hover:bg-accent/50 px-2 py-1 rounded-md w-full"
                    onSave={(newName) =>
                      onEditCategory(category.id, { name: newName })
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <EditableText
                      text={`${category.plannedTime || 0}`}
                      className="hover:bg-accent/50 px-2 py-1 rounded-md w-12 text-center"
                      onSave={(newTime) =>
                        onEditCategory(category.id, {
                          plannedTime: Number(newTime),
                        })
                      }
                    />
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground w-12 text-center">
                      {category.actualTime || 0}
                    </span>
                    <span className="text-muted-foreground">ч</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
