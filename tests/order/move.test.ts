import { describe, expect, it } from "vitest";
import { moveInList, renumber } from "@/lib/order/move";

const GROUPS = [{ id: "a" }, { id: "b" }, { id: "c" }];
const ids = (list: readonly { id: string }[]) => list.map((g) => g.id);

describe("moveInList", () => {
  it("menaikkan satu posisi", () => {
    expect(ids(moveInList(GROUPS, "b", "up"))).toEqual(["b", "a", "c"]);
  });

  it("menurunkan satu posisi", () => {
    expect(ids(moveInList(GROUPS, "b", "down"))).toEqual(["a", "c", "b"]);
  });

  it("tidak mengubah apa pun saat menaikkan yang sudah paling atas", () => {
    expect(ids(moveInList(GROUPS, "a", "up"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah apa pun saat menurunkan yang sudah paling bawah", () => {
    expect(ids(moveInList(GROUPS, "c", "down"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah apa pun untuk id yang tidak ada", () => {
    expect(ids(moveInList(GROUPS, "z", "up"))).toEqual(["a", "b", "c"]);
  });

  it("tidak mengubah larik asalnya", () => {
    moveInList(GROUPS, "b", "up");
    expect(ids(GROUPS)).toEqual(["a", "b", "c"]);
  });
});

describe("renumber", () => {
  it("menomori ulang rapat mulai dari nol", () => {
    expect(renumber(GROUPS)).toEqual([
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("mengembalikan larik kosong untuk masukan kosong", () => {
    expect(renumber([])).toEqual([]);
  });
});
