/** Форматирует длительность в минутах для отображения в UI задач. */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "0м";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}м`;
  if (mins === 0) return `${hours}ч`;
  return `${hours}ч ${mins}м`;
}

/** Минуты (сумма задач) → часы для категорий. */
export function formatHoursFromMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return "0ч";

  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}ч` : `${hours.toFixed(1)}ч`;
}

/** Плановые часы в неделю для категории. */
export function formatPlannedHours(hours: number): string {
  if (!hours || hours <= 0) return "0ч";
  return Number.isInteger(hours) ? `${hours}ч` : `${hours.toFixed(1)}ч`;
}

export function parsePlannedHours(value: string): number {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
