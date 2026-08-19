## Konteks Pembangunan Aplikasi — Kumpulink

Baca file berikut secara berurutan sebelum melakukan
implementasi atau mengambil keputusan arsitektur apa pun:

1. `context/project-overview.md` — definisi produk,
   tujuan, fitur, dan batas lingkup
2. `context/architecture.md` — struktur sistem, batas
   tanggung jawab, model penyimpanan, dan invarian
3. `context/ui-context.md` — tema, warna, tipografi,
   dan konvensi komponen
4. `context/code-standards.md` — aturan dan konvensi
   implementasi
5. `context/ai-workflow-rules.md` — alur kerja
   pengembangan, aturan pelingkupan, dan cara pengiriman
6. `context/progress-tracker.md` — fase saat ini,
   pekerjaan selesai, pertanyaan terbuka, langkah berikutnya

Perbarui `context/progress-tracker.md` setelah setiap
perubahan implementasi yang berarti.

Jika implementasi mengubah arsitektur, lingkup, atau
standar yang tertulis di file konteks, perbarui file
terkait sebelum melanjutkan.

## Aturan Khusus Proyek Ini

Ini adalah aplikasi kontrol akses, bukan sekadar
kumpulan tautan. Dua hal berikut adalah alasan
aplikasi ini ada — perlakukan sebagai baris merah:

- **Semua akses ke konten melewati `lib/access/evaluate-access.ts`.**
  Jangan pernah menambahkan jalur baru menuju konten
  yang melewatkan fungsi ini.
- **Log akses ditulis di server sebelum pengalihan atau
  pengaliran berkas terjadi.** Jangan pernah memindahkan
  pencatatan ke JavaScript sisi klien.
- **Keadaan yang tidak pasti selalu berarti menolak.**
  Mode akses yang belum diimplementasikan, catatan izin
  yang tidak ditemukan, dan nilai enum yang tidak dikenali
  menghasilkan penolakan — bukan lolos ke cabang terakhir.

Jika sebuah permintaan tampak mengharuskan pelanggaran
salah satu aturan di atas, hentikan dan tanyakan dulu.
