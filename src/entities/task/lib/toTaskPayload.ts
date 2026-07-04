import { CreateTaskDTO, TaskWritePayload, UpdateTaskDTO } from "../models/task.model";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Только поля, которые принимает PATCH /tasks/:id */
export function toTaskUpdatePayload(
  form: UpdateTaskDTO,
): Partial<TaskWritePayload> {
  const payload: Partial<TaskWritePayload> = {};

  if (form.title !== undefined) payload.title = form.title;
  if (form.description !== undefined) payload.description = form.description;
  if (form.priority !== undefined) payload.priority = form.priority;
  if (form.duration !== undefined) payload.duration = form.duration;
  if (form.status !== undefined) payload.status = form.status;
  if (form.day !== undefined) payload.day = form.day;
  if (form.date !== undefined) payload.date = form.date;

  if (form.categoryId && UUID_RE.test(form.categoryId)) {
    payload.categoryId = form.categoryId;
  }

  return payload;
}

export function toTaskCreatePayload(form: UpdateTaskDTO): CreateTaskDTO {
  const payload = {
    title: form.title!,
    description: form.description,
    priority: form.priority!,
    duration: form.duration ?? 0,
    status: form.status!,
    day: form.day!,
    date: form.date!,
  };

  if (form.categoryId && UUID_RE.test(form.categoryId)) {
    return { ...payload, categoryId: form.categoryId };
  }

  return payload;
}
