import { useCallback, useState } from "react";
import {
  Category,
  UpdateCategoryDTO,
} from "@/entities/categories/model/category.model";
import { categoriesApi } from "@/entities/categories/api/categories.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCategoriesWidget() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Получение категорий
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  // Создание категории
  const createMutation = useMutation({
    mutationFn: (category: Partial<Category>) => categoriesApi.create(category),
    onMutate: async (newCategory) => {
      setIsLoading(true);
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      // Сохраняем предыдущее состояние
      const previousCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);
      // Оптимистично обновляем UI
      queryClient.setQueryData<Category[]>(["categories"], (old = []) => [
        ...old,
        { id: "temp-id", ...newCategory } as Category,
      ]);
      return { previousCategories };
    },
    onSuccess: () => {
      toast.success("Категория создана");
    },
    onError: (err, _, context) => {
      // Возвращаем предыдущие данные при ошибке
      queryClient.setQueryData(["categories"], context?.previousCategories);
      toast.error("Ошибка при создании категории");
    },
    onSettled: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Обновление категории
  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: UpdateCategoryDTO) =>
      categoriesApi.update(id, changes),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);

      queryClient.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((cat) => (cat.id === id ? { ...cat, ...changes } : cat))
      );

      return { previousCategories };
    },
    onSuccess: () => {
      toast.success("Категория обновлена");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["categories"], context?.previousCategories);
      toast.error("Ошибка при обновлении категории");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Удаление категории
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);

      queryClient.setQueryData<Category[]>(["categories"], (old = []) =>
        old.filter((cat) => cat.id !== deletedId)
      );

      return { previousCategories };
    },
    onSuccess: () => {
      toast.success("Категория удалена");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["categories"], context?.previousCategories);
      toast.error("Ошибка при удалении категории");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleAddCategory = useCallback(async () => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync({
        name: "Новая категория",
        plannedTime: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [createMutation]);

  const handleEditCategory = useCallback(
    async (id: string, changes: { name?: string; plannedTime?: number }) => {
      await updateMutation.mutateAsync({ id, changes });
    },
    [updateMutation]
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  return {
    categories,
    isLoading,
    onAddCategory: handleAddCategory,
    onEditCategory: handleEditCategory,
    onDeleteCategory: handleDeleteCategory,
  };
}
