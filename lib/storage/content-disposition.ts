/**
 * `route.ts` unggahan sudah membersihkan fileName saat MENULIS, tetapi
 * yang menaruh nilai itu di sebuah header adalah Unit 4 — dan sanitasi
 * di sisi tulis tidak melindungi baris yang sudah terlanjur ada di
 * database. Penyandiannya karena itu ditegakkan lagi di sini, di titik
 * nilai itu menjadi header.
 *
 * Dua bentuk sekaligus, sesuai RFC 6266: `filename` ASCII sebagai jalur
 * mundur, dan `filename*` bersandi UTF-8 untuk peramban yang memahaminya.
 */
const NON_ASCII_OR_UNSAFE = /[^\x20-\x7e]|["\\]/g;

function toAsciiFallback(fileName: string): string {
  return fileName.replace(NON_ASCII_OR_UNSAFE, "_");
}

function toRfc5987(fileName: string): string {
  return encodeURIComponent(fileName).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function inlineContentDisposition(fileName: string | null): string {
  if (fileName === null || fileName.trim() === "") return "inline";
  return `inline; filename="${toAsciiFallback(fileName)}"; filename*=UTF-8''${toRfc5987(fileName)}`;
}
