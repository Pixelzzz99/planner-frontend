import { api } from "@/shared/api/api";

export async function createCategory(userId: string, name: string) {
  const response = await api.post(`/categories/${userId}`, { name });
  return response.data;
}

export async function getUserCategories(userId: string) {
  const response = await api.get(`/categories/${userId}`);
  return response.data;
}

export async function updateCategory(id: string, name: string) {
  const response = await api.patch(`/categories/${id}`, { name });
  return response.data;
}

export async function deleteCategory(id: string) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}
