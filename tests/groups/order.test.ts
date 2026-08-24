import { describe, expect, it } from "vitest";
import { moveGroup, renumberGroups } from "@/lib/groups/order";

const GROUPS = [{ id: "a" }, { id: "b" }, { id: "c" }];
const ids = (list: readonly { id: string }[]) => list.map((g) => g.id);

describe("moveGroup", () => {
  it("menaikkan satu posisi", () => {
    expect(ids(moveGroup(GROUPS, "b", "up"))).toEqual(["b", "a", "c"]);
  });

  it("menurunkan satu posisi", () => {
    expect(ids(moveGroup(GROUPS, "b", "down"))).toEqual(["a", "c", "b"]);
  });

  it("tidak mengubah apa pun saat menaikkan yang sudah paling atas", () => {
    expect(ids(moveGroup(GROUPS, "a", "up"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah apa pun saat menurunkan yang sudah paling bawah", () => {
    expect(ids(moveGroup(GROUPS, "c", "down"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah apa pun untuk id yang tidak ada", () => {
    expect(ids(moveGroup(GROUPS, "z", "up"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah larik asalnya", () => {
    moveGroup(GROUPS, "b", "up");
    expect(ids(GROUPS)).toEqual(["a", "b", "c"]);
  });
});

describe("renumberGroups", () => {
  it("menomori ulang rapat mulai dari nol", () => {
    expect(renumberGroups(GROUPS)).toEqual([
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("mengembalikan larik kosong untuk masukan kosong", () => {
    expect(renumberGroups([])).toEqual([]);
  });
});
