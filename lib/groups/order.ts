export type Orderable = { id: string };

/**
 * Menukar sebuah group dengan tetangganya. Di tepi larik, dan untuk id
 * yang tidak ada, mengembalikan urutan yang sama — bukan melempar galat.
 * Tombol di tepi memang disembunyikan di antarmuka, jadi keadaan ini
 * hanya tercapai lewat balapan; membatalkan diam-diam lebih baik
 * daripada menjatuhkan halaman.
 */
export function moveGroup<T extends Orderable>(
  groups: readonly T[],
  id: string,
  direction: "up" | "down",
): T[] {
  const from = groups.findIndex((group) => group.id === id);
  if (from === -1) return [...groups];

  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= groups.length) return [...groups];

  const next = [...groups];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * Menomori ulang rapat 0,1,2,… tanpa celah. Dipanggil setiap pemindahan
 * dan setiap penghapusan, sehingga keadaan basis data selalu kanonis dan
 * tidak ada jalur pemulihan celah yang harus ditulis dan diuji.
 */
export function renumberGroups<T extends Orderable>(
  groups: readonly T[],
): { id: string; sortOrder: number }[] {
  return groups.map((group, index) => ({ id: group.id, sortOrder: index }));
}
