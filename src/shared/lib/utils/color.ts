const CATEGORY_COLORS = [
  "#6E7582", // серый графит
  "#A67F5D", // тауп
  "#5D7A99", // приглушенный синий
  "#7E6E99", // лавандовый серый
  "#598C7D", // шалфейный
  "#8C7D65", // теплый серый
  "#996E6E", // пыльная роза
  "#707045", // оливковый серый
];

export function getCategoryColor(id: string): string {
  // Используем id категории для выбора цвета из массива
  const index = Math.abs(
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
