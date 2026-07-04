import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMoveQueue } from "./useMoveQueue";

describe("createMoveQueue", () => {
  it("serializes move requests", async () => {
    const order: string[] = [];
    const execute = async (payload: { taskId: string }) => {
      order.push(payload.taskId);
    };

    const queue = createMoveQueue(execute);
    queue.enqueue({
      taskId: "a",
      weekId: "week-1",
      data: { weekPlanId: "week-1", day: 1 },
    });
    queue.enqueue({
      taskId: "b",
      weekId: "week-1",
      data: { weekPlanId: "week-1", day: 2 },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(order.length, 2);
    assert.deepEqual(order, ["a", "b"]);
  });

  it("coalesces moves for the same task", async () => {
    let callCount = 0;
    let lastDay = 0;
    const execute = async (payload: { data: { day: number } }) => {
      callCount += 1;
      lastDay = payload.data.day;
    };

    const queue = createMoveQueue(execute);
    queue.enqueue({
      taskId: "a",
      weekId: "week-1",
      data: { weekPlanId: "week-1", day: 1 },
    });
    queue.enqueue({
      taskId: "a",
      weekId: "week-1",
      data: { weekPlanId: "week-1", day: 3 },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(callCount, 1);
    assert.equal(lastDay, 3);
  });
});
