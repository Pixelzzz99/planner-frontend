import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../api/category.api";

export const categoryKeys = {
  all: ["categories"] as const,
  list: (userId: string) => [...categoryKeys.all, userId] as const,
};

export const useCategories = (userId: string) => {
  return useQuery({
    queryKey: categoryKeys.list(userId),
    queryFn: () => categoryApi.getUserCategories(userId),
    enabled: !!userId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      categoryApi.createCategory(userId, name),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list(userId) });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string; userId: string }) =>
      categoryApi.updateCategory(id, name),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list(userId) });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; userId: string }) =>
      categoryApi.deleteCategory(id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list(userId) });
    },
  });
};
