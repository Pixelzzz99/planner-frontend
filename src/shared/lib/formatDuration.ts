/** Форматирует длительность в минутах для отображения в UI. */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "0м";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}м`;
  if (mins === 0) return `${hours}ч`;
  return `${hours}ч ${mins}м`;
}
