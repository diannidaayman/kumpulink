# Kumpulink

## Overview

Kumpulink adalah aplikasi web pribadi untuk menghimpun
tautan, berkas PDF, dan gambar ke dalam group yang rapi,
lalu membagikan satu group tertentu kepada rekan kerja
lewat sebuah link. Pemilik dapat mengatur apakah sebuah
group perlu login untuk dibuka, dan untuk setiap item di
dalamnya memilih salah satu dari tiga tingkat: terbuka,
perlu identitas, atau perlu persetujuan pemilik lebih
dulu. Seluruh akses tercatat, lengkap dengan siapa dan
jam berapa. Penerima link hanya melihat group yang
dibagikan kepadanya — group lain milik pemilik tidak
pernah terlihat maupun diketahui keberadaannya.

Masalah yang dipecahkan: saat menyiapkan sebuah acara
kerja, bahan-bahan tersebar di banyak tempat dan dikirim
berulang kali di grup chat. Menyatukannya di satu tempat
mudah, tetapi menyatukannya tanpa ikut membocorkan
kumpulan tautan pribadi, dan tanpa kehilangan jejak siapa
yang sudah membuka dokumen penting, itu yang belum ada.

## Goals

1. Satu link dapat dibagikan untuk satu group, dan
   penerima tidak dapat melihat maupun menebak keberadaan
   group lain milik pemilik.
2. Setiap akses ke item yang ditandai butuh identitas
   tercatat di server dengan nama, email, dan waktu yang
   tidak bergantung pada JavaScript di browser penerima.
3. Pemilik dapat menyiapkan satu acara lengkap — membuat
   group, mengisi tautan dan berkas, mengatur izin,
   menyalin link dan QR — dalam waktu di bawah lima menit.
4. Untuk item yang paling sensitif, tidak ada satu pun
   akses yang terjadi tanpa keputusan sadar dari pemilik,
   dan setiap keputusan itu meninggalkan jejak permanen.

## Core User Flow

### Alur Pemilik

1. Pemilik membuka `/dashboard` dan masuk dengan Google.
   Email yang cocok dengan `OWNER_EMAIL` diberi peran
   `OWNER`.
2. Dashboard menampilkan seluruh group sebagai daftar
   akordeon dalam keadaan terlipat, lengkap dengan judul,
   jumlah item, status berbagi, dan tanggal kedaluwarsa.
3. Pemilik membuat group baru, misalnya "Rapat Kerja".
   Slug dibuat otomatis dari judul dan dapat diubah.
4. Pemilik membuka akordeon group tersebut dan menambah
   item: menempel URL absensi, mengunggah rundown PDF,
   menempel tautan Google Drive berisi materi presentasi.
   Urutan item diatur dengan geser.
5. Pemilik menyetel tingkat akses tiap item: absensi
   dibiarkan `OPEN`, rundown disetel `IDENTITY`, dan
   notulen rahasia disetel `APPROVAL`.
6. Di panel Bagikan, pemilik memilih tingkat akses halaman
   (publik atau wajib login), menetapkan tanggal
   kedaluwarsa, menyalin link, dan mengunduh QR code.
7. Saat acara berjalan, pemilik menerima email bahwa ada
   permintaan akses ke notulen. Ia membuka halaman
   Permintaan di dashboard, melihat daftar pemohon beserta
   keperluannya, lalu menyetujui atau menolak — satu per
   satu, atau sekaligus untuk satu pemohon.
8. Setelah acara selesai, pemilik membuka tab Riwayat
   Akses pada group tersebut untuk melihat siapa saja
   yang membuka item terproteksi dan pada jam berapa.
9. Pemilik mencabut link dengan satu saklar, atau
   membiarkannya mati sendiri saat kedaluwarsa. Izin yang
   sudah disetujui ikut mati bersamanya.

### Alur Pengunjung

1. Pengunjung membuka link `/g/rapat-kerja` atau memindai
   QR code.
2. Bila group disetel wajib login, pengunjung melihat
   layar masuk yang menyebutkan judul group agar ia tahu
   tidak salah alamat, lalu masuk dengan Google.
3. Halaman menampilkan hanya group tersebut: judul,
   deskripsi, dan daftar item. Tidak ada navigasi menuju
   group lain.
4. Pengunjung mengklik item `OPEN` dan langsung diteruskan
   ke tujuan.
5. Pengunjung mengklik item `IDENTITY`. Jika belum masuk,
   ia diminta masuk lebih dulu lalu dikembalikan ke titik
   semula dan diteruskan. Item semacam ini diberi
   keterangan bahwa aksesnya dicatat.
6. Untuk item `APPROVAL`, kartunya sudah menandakan bahwa
   izin diperlukan sebelum diklik. Pengunjung mengajukan
   permintaan dengan keperluan opsional — satu item, atau
   semua item terkunci di group itu sekaligus.
7. Pengunjung menerima email begitu pemilik memutuskan.
   Email persetujuan memuat tautan langsung ke itemnya,
   jadi ia tidak perlu mencari kembali halaman group.
8. Permintaan yang ditolak tidak dapat diajukan ulang.
   Halaman menjelaskan keadaannya dan menyarankan
   menghubungi pemilik secara langsung.

## Features

### Manajemen Konten

- Membuat, mengubah, menghapus, dan menyusun ulang group
- Group ditampilkan sebagai akordeon yang dapat dilipat
  dan dibuka di dashboard
- Menambahkan item bertipe `LINK`, `PDF`, atau `IMAGE`
- Setiap item bersumber `EXTERNAL` (menempel URL) atau
  `UPLOAD` (mengunggah berkas ke aplikasi)
- Menyusun ulang urutan item dengan geser
- Menonaktifkan sebuah item tanpa menghapusnya

### Berbagi dan Kontrol Akses

- Setiap group memiliki slug unik yang dapat dikustomisasi
- Tingkat akses halaman per group: `PRIVATE`,
  `REQUIRE_LOGIN`, atau `PUBLIC`
- Saklar `shareEnabled` untuk mencabut link seketika
- Tanggal kedaluwarsa opsional per group
- Setelan `accessMode` per item dengan tiga nilai: `OPEN`,
  `IDENTITY`, atau `APPROVAL`
- QR code per group, dibuat di server sebagai SVG
- Halaman publik hanya menampilkan satu group, tanpa
  jejak group lain

### Permintaan dan Persetujuan Akses

- Pengunjung mengajukan izin untuk item `APPROVAL`, dengan
  keterangan keperluan opsional maksimal 300 karakter
- Tombol ajukan sekaligus untuk semua item terkunci dalam
  satu group
- Halaman Permintaan di dashboard, dikelompokkan per group
  lalu per pemohon, dengan lencana jumlah tertunda
- Menyetujui atau menolak satuan maupun sekaligus per
  pemohon, dengan catatan opsional dari pemilik
- Mencabut izin yang sudah disetujui
- Izin yang disetujui kedaluwarsa mengikuti tanggal
  kedaluwarsa group
- Permintaan yang ditolak tidak dapat diajukan ulang oleh
  pemohon; hanya pemilik yang dapat mengubah keputusannya
- Email ke pemilik saat ada permintaan baru, dikumpulkan
  maksimal satu email per group per sepuluh menit
- Email ke pemohon saat keputusan dibuat, memuat tautan
  langsung ke item bila disetujui

### Riwayat Akses

- Mencatat dua jenis peristiwa: `PAGE_VIEW`, hanya bila
  pengunjung sedang masuk, dan `ITEM_ACCESS`, selalu
- Menyimpan nama dan email hasil salin pada saat kejadian,
  bukan sekadar rujukan, agar riwayat tetap utuh
- Mencatat waktu, alamat IP, dan perangkat
- Mencatat hasil `GRANTED` maupun `DENIED` beserta
  alasannya, sehingga percobaan akses ke link yang sudah
  mati juga terekam
- Tabel riwayat per group di dashboard, dapat disaring
  berdasarkan item dan rentang tanggal

### Autentikasi

- Masuk dengan Google saja, tanpa kata sandi
- Peran `OWNER` ditentukan dari variabel lingkungan
  `OWNER_EMAIL`, bukan dari data yang dapat diubah lewat
  antarmuka
- Semua pengunjung yang masuk otomatis berperan `VIEWER`
- Tombol keluar selalu terlihat di halaman publik saat
  pengunjung sedang masuk

## Scope

### In Scope

- Aplikasi pemilik tunggal — hanya satu orang yang
  mengelola konten
- Group sebagai unit datar: satu group adalah satu link
  yang dibagikan
- Unggahan berkas PDF dan gambar, disimpan di object
  storage privat
- Tautan eksternal ke layanan mana pun
- Kontrol akses dua lapis: tingkat halaman dan tingkat item
- Tiga tingkat akses per item, termasuk alur permintaan
  dan persetujuan manual oleh pemilik
- Email pemberitahuan permintaan dan keputusannya
- Riwayat akses yang dapat dilihat di layar
- Kedaluwarsa dan pencabutan link, serta pencabutan izin
  yang sudah disetujui
- QR code per group
- Antarmuka mendukung mode terang dan gelap

### Out of Scope

- Pendaftaran publik dan pembuatan konten oleh banyak
  pemilik
- Group bersarang atau sub-group
- Daftar putih email atau kode akses sebagai mekanisme izin
- Pengajuan ulang oleh pemohon setelah ditolak — hanya
  pemilik yang dapat mengubah keputusan
- Persetujuan otomatis berdasarkan aturan, misalnya
  meloloskan semua email berdomain tertentu
- Ekspor riwayat akses ke CSV atau Excel
- Kolaborasi, komentar, atau reaksi pada item
- Domain kustom, tema kustom, atau penyesuaian merek
- Notifikasi push atau pesan instan; pemberitahuan hanya
  lewat email dan lencana di dashboard
- Pratinjau PDF tertanam di dalam halaman group — berkas
  dibuka di tab baru menggunakan penampil bawaan peramban
- Statistik agregat di luar tabel riwayat mentah

### Deliberately Deferred

Hal-hal berikut sengaja tidak dibangun sekarang, tetapi
model datanya dirancang agar tidak menghalangi:

- Ekspor riwayat ke CSV — semua data sudah ada di tabel
  `AccessLog`
- Ringkasan jumlah klik per item — dapat dihitung dari
  `AccessLog`
- Pratinjau PDF tertanam — hanya persoalan cara
  menampilkan, tidak menyentuh model data
- Persetujuan otomatis berdasarkan domain email —
  `AccessRequest` sudah menyimpan email pemohon, jadi
  aturannya dapat ditambahkan tanpa mengubah model data

## Success Criteria

1. Pemilik dapat membuat group berisi satu tautan, satu
   PDF unggahan, dan satu tautan Drive, lalu memperoleh
   link berbagi dan QR code dalam satu sesi tanpa
   meninggalkan dashboard.
2. Pengunjung yang membuka link group bersetelan
   `REQUIRE_LOGIN` tanpa masuk akan diarahkan ke Google,
   dan setelah masuk kembali ke halaman yang sama, bukan
   ke halaman depan.
3. HTML yang dikirim ke pengunjung untuk halaman group
   tidak memuat URL tujuan item mana pun dan tidak memuat
   alamat penyimpanan berkas mana pun.
4. Mengakses item bersetelan `IDENTITY` menghasilkan tepat
   satu baris `AccessLog` berisi nama, email, dan waktu,
   dan baris itu tertulis meskipun JavaScript dimatikan di
   browser pengunjung.
5. Membuka link group yang sudah dicabut atau kedaluwarsa
   menghasilkan halaman yang identik dengan membuka slug
   yang tidak pernah ada, sehingga tidak dapat dibedakan
   dari luar.
6. Pemilik yang masuk tetap dapat membuka group yang
   dicabut atau kedaluwarsa, dengan spanduk yang
   menyatakan link sedang tidak aktif.
7. Halaman publik sebuah group tidak memuat rujukan apa
   pun ke group lain milik pemilik, termasuk di dalam
   metadata dan payload data.
8. Mengakses item `APPROVAL` tanpa catatan izin yang
   berstatus `APPROVED` selalu ditolak, apa pun keadaannya
   — termasuk ketika fitur persetujuan belum selesai
   dibangun. Sikap bawaannya menolak, bukan meloloskan.
9. Pengunjung yang mengajukan izin lalu menutup peramban
   tetap menerima kabar keputusan lewat email, tanpa perlu
   kembali membuka halaman group.
10. Tiga puluh pengunjung yang mengajukan izin dalam satu
    menit menghasilkan paling banyak satu email ke pemilik
    dalam sepuluh menit pertama, bukan tiga puluh.
11. Group yang kedaluwarsa membuat seluruh izin yang sudah
    disetujui di dalamnya ikut berhenti berlaku, tanpa
    tindakan tambahan dari pemilik.

