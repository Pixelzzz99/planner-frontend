import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeFractionalPosition } from "../lib/computeFractionalPosition";

describe("computeFractionalPosition", () => {
  const siblings = [
    { id: "a", position: 1000 },
    { id: "b", position: 2000 },
    { id: "c", position: 3000 },
  ];

  it("returns step for empty list", () => {
    assert.equal(computeFractionalPosition([], undefined), 1000);
  });

  it("inserts before first item", () => {
    assert.equal(computeFractionalPosition(siblings, null), 500);
  });

  it("appends after last item", () => {
    assert.equal(computeFractionalPosition(siblings, undefined), 4000);
  });

  it("inserts between items", () => {
    assert.equal(computeFractionalPosition(siblings, "a"), 1500);
  });
});
