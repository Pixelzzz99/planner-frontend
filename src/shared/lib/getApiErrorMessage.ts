import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Произошла ошибка"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.message === "string") return data.message;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
