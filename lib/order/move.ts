export type Orderable = { id: string };

/**
 * Menukar sebuah entri dengan tetangganya. Di tepi larik, dan untuk id
 * yang tidak ada, mengembalikan urutan yang sama — bukan melempar galat.
 * Tombol di tepi memang disembunyikan di antarmuka, jadi keadaan ini
 * hanya tercapai lewat balapan; membatalkan diam-diam lebih baik
 * daripada menjatuhkan halaman.
 *
 * Generik atas apa pun yang berid: group memakainya di dashboard, item
 * memakainya di dalam akordeon. Itulah kenapa ia tidak tinggal di
 * lib/groups/ — ia bukan milik salah satu dari keduanya.
 */
export function moveInList<T extends Orderable>(
  list: readonly T[],
  id: string,
  direction: "up" | "down",
): T[] {
  const from = list.findIndex((entry) => entry.id === id);
  if (from === -1) return [...list];

  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= list.length) return [...list];

  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * Menomori ulang rapat 0,1,2,… tanpa celah. Dipanggil setiap pemindahan
 * dan setiap penghapusan, sehingga keadaan basis data selalu kanonis dan
 * tidak ada jalur pemulihan celah yang harus ditulis dan diuji.
 */
export function renumber<T extends Orderable>(
  list: readonly T[],
): { id: string; sortOrder: number }[] {
  return list.map((entry, index) => ({ id: entry.id, sortOrder: index }));
}
