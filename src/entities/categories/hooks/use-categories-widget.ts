import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "./use-categories";
import { Category } from "../model/category.model";

export const useCategoriesWidget = (userId: string) => {
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories = [] } = useCategories(userId);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleOpenAddModal = () => {
    setCategoryForm({ id: "", name: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setCategoryForm(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryForm.id) {
      await createCategory.mutateAsync({ userId, name: categoryForm.name });
    } else {
      await updateCategory.mutateAsync({
        id: categoryForm.id,
        name: categoryForm.name,
        userId,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory.mutateAsync({ id, userId });
  };

  return {
    categories,
    categoryForm,
    setCategoryForm,
    isModalOpen,
    setIsModalOpen,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSubmit,
    handleDelete,
    isLoading:
      createCategory.isPending ||
      updateCategory.isPending ||
      deleteCategory.isPending,
  };
};
