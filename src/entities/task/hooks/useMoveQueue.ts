import { useCallback, useRef } from "react";
import { MoveTaskDto } from "../models/task.model";

export type MoveQueuePayload = {
  taskId: string;
  data: MoveTaskDto;
  weekId: string;
};

type MoveExecutor = (payload: MoveQueuePayload) => Promise<unknown>;

export function createMoveQueue(execute: MoveExecutor) {
  const pending = new Map<string, MoveQueuePayload>();
  let processing = false;

  const processNext = async () => {
    if (processing || pending.size === 0) return;

    processing = true;
    const next = pending.entries().next().value as
      | [string, MoveQueuePayload]
      | undefined;

    if (!next) {
      processing = false;
      return;
    }

    const [taskId, payload] = next;
    pending.delete(taskId);

    try {
      await execute(payload);
    } finally {
      processing = false;
      if (pending.size > 0) {
        void processNext();
      }
    }
  };

  return {
    enqueue(payload: MoveQueuePayload) {
      pending.set(payload.taskId, payload);
      queueMicrotask(() => {
        void processNext();
      });
    },
    clear() {
      pending.clear();
    },
    get size() {
      return pending.size;
    },
  };
}

export function useMoveQueue(execute: MoveExecutor) {
  const queueRef = useRef<ReturnType<typeof createMoveQueue> | null>(null);
  const executeRef = useRef(execute);
  executeRef.current = execute;

  if (!queueRef.current) {
    queueRef.current = createMoveQueue((payload) => executeRef.current(payload));
  }

  const enqueue = useCallback((payload: MoveQueuePayload) => {
    queueRef.current?.enqueue(payload);
  }, []);

  return { enqueue };
}
