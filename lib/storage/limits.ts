import { ACCEPTED_MIME_TYPES } from "@/lib/storage/detect-file-type";

/**
 * 4 MB, bukan 10 MB. Batas badan permintaan Vercel Functions adalah
 * 4,5 MB di tingkat infrastruktur dan tidak dapat dinaikkan lewat
 * konfigurasi apa pun; permintaan yang melebihinya mati dengan
 * 413 FUNCTION_PAYLOAD_TOO_LARGE sebelum satu baris kode ini berjalan.
 * Alasan lengkapnya ada di architecture.md bagian Storage Model.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Nama berkas unggahan dipotong sebelum disimpan; ia label, bukan kunci. */
export const MAX_FILE_NAME_LENGTH = 255;

/**
 * Untuk atribut `accept` pada kontrol berkas. Ia SEMATA kenyamanan
 * peramban dan bukan penegakan apa pun — dialog berkas dapat disetel
 * "Semua berkas", dan permintaan dapat disusun tanpa peramban sama
 * sekali. Yang menegakkan adalah detectFileType() di server.
 */
export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(",");
