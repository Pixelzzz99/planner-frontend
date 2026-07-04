import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildContainerItems,
  moveOnDragOver,
  resolveDropCommit,
  hasPositionChanged,
} from "./boardDnD";
import { Task } from "../models/task.model";

const task = (id: string, day: number, position: number): Task =>
  ({
    id,
    day,
    position,
    isArchived: false,
    title: id,
  }) as Task;

describe("boardDnD", () => {
  it("buildContainerItems groups by day", () => {
    const items = buildContainerItems(
      [task("a", 1, 1000), task("b", 1, 2000), task("c", 2, 1000)],
      [],
      [1, 2],
    );
    assert.deepEqual(items["1"], ["a", "b"]);
    assert.deepEqual(items["2"], ["c"]);
  });

  it("moveOnDragOver reorders within same column", () => {
    const items = { "1": ["a", "b", "c"], "2": [] };
    const next = moveOnDragOver(
      items,
      { id: "a", rect: { current: { initial: null, translated: null } }, data: { current: {} } },
      {
        id: "c",
        rect: { top: 0, left: 0, width: 0, height: 0 },
        data: { current: { type: "Task" } },
      },
    );
    assert.deepEqual(next?.["1"], ["b", "c", "a"]);
  });

  it("moveOnDragOver moves task to another column", () => {
    const items = { "1": ["a", "b"], "2": ["c"] };
    const next = moveOnDragOver(
      items,
      { id: "a", rect: { current: { initial: null, translated: null } }, data: { current: {} } },
      {
        id: "c",
        rect: { top: 0, left: 0, width: 0, height: 0 },
        data: { current: { type: "Task" } },
      },
    );
    assert.deepEqual(next?.["1"], ["b"]);
    assert.deepEqual(next?.["2"], ["a", "c"]);
  });

  it("resolveDropCommit returns afterTaskId", () => {
    const items = { "1": ["a", "b", "c"], "2": [] };
    const drop = resolveDropCommit(items, "b");
    assert.equal(drop?.day, 1);
    assert.equal(drop?.afterTaskId, "a");
    assert.equal(drop?.isArchive, false);
  });

  it("hasPositionChanged detects reorder", () => {
    const initial = { "1": ["a", "b", "c"], "2": [] };
    const final = { "1": ["b", "a", "c"], "2": [] };
    assert.equal(hasPositionChanged(initial, final, "a"), true);
    assert.equal(hasPositionChanged(initial, initial, "a"), false);
  });
});
