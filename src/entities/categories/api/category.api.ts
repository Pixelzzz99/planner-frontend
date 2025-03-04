import { api } from "@/shared/api/api";

export const categoryApi = {
  createCategory: async (userId: string, name: string) => {
    const response = await api.post(`/categories/${userId}`, { name });
    return response.data;
  },

  getUserCategories: async (userId: string) => {
    const response = await api.get(`/categories/${userId}`);
    return response.data;
  },

  updateCategory: async (id: string, name: string) => {
    const response = await api.patch(`/categories/${id}`, { name });
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
