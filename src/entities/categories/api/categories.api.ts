import { api } from "@/shared/api/api";
import { Category } from "../model/category.model";

export const categoriesApi = {
  getAll: () => api.get<Category[]>("/categories").then((res) => res.data),

  create: (category: Partial<Category>) =>
    api.post<Category>("/categories", category).then((res) => res.data),

  update: (id: string, category: { name?: string; plannedTime?: number }) =>
    api.patch<Category>(`/categories/${id}`, category).then((res) => res.data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`).then((res) => res.data),
};
