import { useCallback, useState } from "react";
import { Category, UpdateCategoryDTO } from "../model/category.model";
import { categoriesApi } from "../api/categories.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryKeys } from "../model/keys";

const updateCategoryCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  categoryId: string,
  timeChange: number,
  field: "plannedTime" | "actualTime"
) => {
  const currentCategories =
    queryClient.getQueryData<Category[]>(categoryKeys.lists()) || [];

  const updatedCategories = currentCategories.map((cat) =>
    cat.id === categoryId
      ? { ...cat, [field]: Math.max(0, cat[field] + timeChange) }
      : cat
  );

  queryClient.setQueryData(categoryKeys.lists(), updatedCategories);
  queryClient.invalidateQueries({
    queryKey: categoryKeys.lists(),
    refetchType: "none",
  });
};

export function useCategoriesWidget() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoriesApi.getAll(),
    staleTime: 30000, // 30 секунд
  });

  const createMutation = useMutation({
    mutationFn: (category: Partial<Category>) => categoriesApi.create(category),
    onMutate: async (newCategory) => {
      setIsLoading(true);
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
      const previousCategories = queryClient.getQueryData<Category[]>(
        categoryKeys.lists()
      );

      queryClient.setQueryData<Category[]>(categoryKeys.lists(), (old = []) => [
        ...old,
        { id: "temp-id", ...newCategory } as Category,
      ]);

      return { previousCategories };
    },
    onSuccess: () => {
      toast.success("Категория создана");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        categoryKeys.lists(),
        context?.previousCategories
      );
      toast.error("Ошибка при создании категории");
    },
    onSettled: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: UpdateCategoryDTO) =>
      categoriesApi.update(id, changes),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
      const previousCategories = queryClient.getQueryData<Category[]>(
        categoryKeys.lists()
      );

      queryClient.setQueryData<Category[]>(categoryKeys.lists(), (old = []) =>
        old.map((cat) => (cat.id === id ? { ...cat, ...changes } : cat))
      );

      return { previousCategories };
    },
    onSuccess: () => {
      toast.success("Категория обновлена");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        categoryKeys.lists(),
        context?.previousCategories
      );
      toast.error("Ошибка при обновлении категории");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
      const previousCategories = queryClient.getQueryData<Category[]>(
        categoryKeys.lists()
      );

      queryClient.setQueryData<Category[]>(categoryKeys.lists(), (old = []) =>
        old.filter((cat) => cat.id !== deletedId)
      );

      return { previousCategories };
    },
    onSuccess: () => {
      toast.success("Категория удалена");
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        categoryKeys.lists(),
        context?.previousCategories
      );
      toast.error("Ошибка при удалении категории");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });

  const updateCategoryTime = useCallback(
    (categoryId: string, timeChange: number) => {
      updateCategoryCache(queryClient, categoryId, timeChange, "plannedTime");

      updateMutation.mutate({
        id: categoryId,
        changes: {
          plannedTime:
            (categories.find((c) => c.id === categoryId)?.plannedTime || 0) +
            timeChange,
        },
      });
    },
    [queryClient, categories, updateMutation]
  );

  const updateCategoryActualTime = useCallback(
    (categoryId: string, timeChange: number) => {
      updateCategoryCache(queryClient, categoryId, timeChange, "actualTime");

      updateMutation.mutate({
        id: categoryId,
        changes: {
          actualTime:
            (categories.find((c) => c.id === categoryId)?.actualTime || 0) +
            timeChange,
        },
      });
    },
    [queryClient, categories, updateMutation]
  );

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
    updateCategoryTime,
    updateCategoryActualTime,
  };
}
