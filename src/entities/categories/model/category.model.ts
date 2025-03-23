export interface UpdateCategoryDTO {
  id: string;
  changes: {
    name?: string;
    plannedTime?: number;
    actualTime?: number;
  };
}
export interface Category {
  id: string;
  userId: string;
  name: string;
  plannedTime: number;
  actualTime: number;
  createdAt: string;
}
