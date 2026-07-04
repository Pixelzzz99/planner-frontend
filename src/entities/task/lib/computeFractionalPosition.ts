import { Task } from "../models/task.model";

export const computeFractionalPosition = (
  siblings: Pick<Task, "id" | "position">[],
  afterTaskId: string | null | undefined
): number => {
  const STEP = 1000;
  if (siblings.length === 0) return STEP;

  if (afterTaskId === null) return siblings[0].position / 2;
  if (afterTaskId === undefined)
    return siblings[siblings.length - 1].position + STEP;

  const idx = siblings.findIndex((s) => s.id === afterTaskId);
  if (idx < 0) return siblings[siblings.length - 1].position + STEP;

  const prev = siblings[idx].position;
  const next = idx + 1 < siblings.length ? siblings[idx + 1].position : null;
  if (next === null) return prev + STEP;
  return (prev + next) / 2;
};
