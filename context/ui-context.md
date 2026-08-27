# UI Context

## Theme

Mendukung mode terang dan gelap. Secara bawaan mengikuti
setelan perangkat melalui `prefers-color-scheme`, dengan
tombol ganti manual yang pilihannya diingat di
`localStorage`.

Bahasa visualnya tenang dan formal: permukaan bersih,
garis batas tipis, satu warna aksen biru, dan tidak ada
hiasan yang tidak menjelaskan apa pun.

Halaman publik sesekali ditayangkan di proyektor ruang
rapat, tetapi itu bukan adegan pemakaian utamanya dan
**tidak** mengunci arah visual aplikasi. Layar yang
dirancang untuk dituju adalah ponsel peserta dan laptop
pemilik. Keterbacaan dijaga lewat lantai yang sudah
mengikat — kontras WCAG AA di kedua mode, teks halaman
publik dimulai dari `text-base`, dan warna bukan
satu-satunya pembawa makna — bukan lewat pembatasan gaya
demi jarak pandang ruangan.

Diubah 21 Agustus 2026, menggantikan aturan sebelumnya
yang menyatakan keterbacaan proyektor lebih penting
daripada gaya.

Halaman publik dirancang mobile-first. Peserta acara
membukanya dari ponsel setelah memindai QR code, dan itulah
jalur pemakaian yang paling sering terjadi.

## Colors

Seluruh warna didefinisikan sebagai CSS custom property di
`app/globals.css`, dalam dua blok: `:root` untuk mode
terang dan `.dark` untuk mode gelap. Komponen hanya boleh
merujuk token — tidak ada nilai heksadesimal yang ditulis
langsung di komponen.

### Mode terang

| Role                   | CSS Variable          | Value     |
| ---------------------- | --------------------- | --------- |
| Latar halaman          | `--bg-base`           | `#F8FAFC` |
| Permukaan kartu        | `--bg-surface`        | `#FFFFFF` |
| Permukaan terangkat    | `--bg-elevated`       | `#F1F5F9` |
| Teks utama             | `--text-primary`      | `#0F172A` |
| Teks redup             | `--text-muted`        | `#64748B` |
| Aksen utama            | `--accent-primary`    | `#2563EB` |
| Teks di atas aksen     | `--accent-on`         | `#FFFFFF` |
| Garis batas            | `--border-default`    | `#E2E8F0` |
| Galat                  | `--state-error`       | `#DC2626` |
| Berhasil               | `--state-success`     | `#16A34A` |
| Peringatan             | `--state-warning`     | `#D97706` |

### Mode gelap

| Role                   | CSS Variable          | Value     |
| ---------------------- | --------------------- | --------- |
| Latar halaman          | `--bg-base`           | `#0B0F19` |
| Permukaan kartu        | `--bg-surface`        | `#131A28` |
| Permukaan terangkat    | `--bg-elevated`       | `#1C2433` |
| Teks utama             | `--text-primary`      | `#E8EDF5` |
| Teks redup             | `--text-muted`        | `#94A3B8` |
| Aksen utama            | `--accent-primary`    | `#60A5FA` |
| Teks di atas aksen     | `--accent-on`         | `#0B0F19` |
| Garis batas            | `--border-default`    | `#253044` |
| Galat                  | `--state-error`       | `#F87171` |
| Berhasil               | `--state-success`     | `#4ADE80` |
| Peringatan             | `--state-warning`     | `#FBBF24` |

**Kenapa `--accent-on`, bukan `--accent-foreground`.** Nama yang kedua
sudah dipakai shadcn/ui dengan arti berbeda — di sana ia berarti teks di
atas permukaan hover yang redup, bukan teks di atas aksen biru. Satu nama
properti CSS tidak dapat bernilai dua hal dalam scope yang sama.
Dibiarkan, setiap tombol `ghost` dan setiap baris `dropdown-menu` akan
menampilkan teks putih di atas latar abu muda saat di-hover. Nilai
paletnya tidak berubah; hanya ejaan nama variabelnya.

Setiap pasangan teks dan latar di atas harus memenuhi
rasio kontras WCAG AA, yaitu 4.5:1 untuk teks biasa dan
3:1 untuk teks besar. Warna baru tidak boleh ditambahkan
tanpa memeriksa rasionya di kedua mode.

Warna tidak pernah menjadi satu-satunya pembawa makna.
Status akses selalu disertai teks atau ikon, bukan sekadar
perbedaan warna.

## Typography

| Role      | Font           | Variable      |
| --------- | -------------- | ------------- |
| Teks UI   | Inter          | `--font-sans` |
| Monospasi | JetBrains Mono | `--font-mono` |

Monospasi dipakai khusus untuk hal yang dibaca huruf demi
huruf atau dibandingkan angka demi angka: slug group, URL
berbagi, alamat IP di tabel riwayat, dan **seluruh cap
waktu yang terlihat pengguna** — waktu di tabel riwayat,
waktu pengajuan pada kartu permintaan dan pada halaman
menunggu, serta tanggal kedaluwarsa pada baris akordeon.

Alasan cap waktu ikut masuk: ia dibandingkan baris demi
baris, bukan dibaca sebagai prosa. Angka berlebar tetap
membuat kolom jam berbaris lurus ke bawah, dan itu justru
inti kegunaan tabel riwayat.

Diperluas 21 Agustus 2026; sebelumnya aturan ini hanya
menyebut slug, URL, dan alamat IP.

Ukuran teks pada halaman publik dimulai dari `text-base`,
tidak lebih kecil. Judul item memakai `text-base font-medium`,
deskripsi memakai `text-sm text-muted`.

## Waktu dan Zona Waktu

Server berjalan dalam UTC. Seluruh waktu yang dilihat pengguna
ditampilkan dalam **`Asia/Jayapura`**, ditetapkan tetap — tidak
mengikuti zona waktu perangkat pembaca.

Setiap waktu yang ditampilkan disertai label zonanya, misalnya
`19 Agu 2026, 14.05 WIT`. Label ini wajib, tidak opsional.

Alasannya: riwayat akses dipakai untuk mempertanggungjawabkan
kejadian. Bila jam mengikuti perangkat, dua orang yang membahas
baris yang sama menyebut angka yang berbeda, dan riwayat itu
berhenti dapat dijadikan dasar. Satu zona tetap yang tertulis
di layar membuat semua orang membaca jam yang sama.

Aturan ini berlaku untuk seluruh waktu yang terlihat pengguna,
bukan hanya tabel riwayat: waktu pengajuan pada halaman
menunggu, waktu pengajuan pada kartu permintaan di dashboard,
dan tanggal kedaluwarsa group.

## Border Radius

| Context               | Class          |
| --------------------- | -------------- |
| Inline dan UI kecil   | `rounded-md`   |
| Kartu dan panel       | `rounded-xl`   |
| Modal dan overlay     | `rounded-2xl`  |
| Lencana dan pil       | `rounded-full` |

## Component Library

shadcn/ui di atas Tailwind. Komponen berada di
`components/ui/` dan ditambahkan lewat CLI, bukan ditulis
manual. Berkas di `components/ui/` tidak diedit langsung —
bila perlu penyesuaian, bungkus komponennya di
`components/dashboard/` atau `components/public/`.

Komponen yang diperlukan: `accordion`, `button`, `card`,
`dialog`, `sheet`, `input`, `textarea`, `select`, `switch`,
`badge`, `table`, `dropdown-menu`, `sonner`, `skeleton`,
`alert`, `calendar`, `popover`, `checkbox`,
`radio-group`, `tabs`.

`radio-group` dipakai untuk memilih `accessMode` di CMS.
Ketiga pilihannya ditampilkan bersamaan beserta satu baris
penjelasan masing-masing, bukan disembunyikan di dalam
`select`. Ini setelan yang menentukan siapa boleh melihat
apa — akibat memilihnya harus terbaca saat memilih, bukan
setelah salah pilih.

Urutannya `OPEN` → `IDENTITY` → `APPROVAL`, menaik menurut
ketatnya — bukan abjad. Urutan itu sendiri yang mengajarkan
modelnya.

**Baris penjelas menyatakan apa yang terjadi pada seseorang,
bukan menamai ulang setelannya.** Kalimat yang sekadar
menamai setelan hanya mengulang labelnya dan tidak memberi
tahu apa pun. Ketiga kalimatnya:

| Pilihan    | Label          | Baris penjelas                                                        |
| ---------- | -------------- | --------------------------------------------------------------------- |
| `OPEN`     | Terbuka        | Siapa pun yang membuka link langsung diteruskan.                       |
| `IDENTITY` | Perlu identitas | Harus masuk dengan Google. Nama, email, dan jam aksesnya tercatat.     |
| `APPROVAL` | Perlu persetujuan | Harus masuk, mengajukan izin, dan menunggu keputusan Anda.           |

Pilihan yang terpilih adalah satu-satunya yang berkontras
penuh; baris penjelas dua lainnya meredup. Ini melayani
pekerjaan kedua yang berbeda — membaca setelan yang sedang
berlaku saat formulir dibuka kembali, bukan memilih.

Tidak ada pratinjau lencana di dalam pemilih. Kartu item di
dalam akordeon sudah menampilkan lencana hasilnya, dan
menggandakannya berarti dua tempat yang harus dijaga tetap
sama.

Letaknya di dalam baris sisip tambah/ubah item: judul →
tujuan (URL atau berkas) → mode akses → simpan. Mode akses
diletakkan menjelang akhir justru karena ia kontrol paling
tinggi di formulir dan bawaannya `OPEN` sudah benar untuk
sebagian besar item; menaruhnya di awal membuat setiap item
membayar tiga baris untuk keputusan yang jarang berubah.

Saat pemilik mengubah slug sebuah group yang sedang
dibagikan, tampilkan keterangan sebaris di bawah kolom slug:
**"Mengubah slug membuat link yang sudah disebarkan berhenti
berfungsi."** Nada peringatan, bukan galat — mengubah slug
adalah tindakan yang sah dan tombol simpan tetap aktif.

Keterangan ini hanya muncul ketika `shareEnabled` bernilai
`true`. Pada group yang belum pernah dibagikan tidak ada link
yang bisa mati, dan peringatan yang muncul saat tidak ada
akibatnya akan berhenti dibaca justru ketika akibatnya nyata.

Ketika `APPROVAL` dipilih pada item bersumber `EXTERNAL`,
tampilkan `alert` peringatan: persetujuan tidak menghalangi
pemohon yang sudah disetujui untuk menyalin dan menyebarkan
URL aslinya. Sarankan mengunggah berkasnya.

Peringatan itu muncul **menempel di bawah baris pilihan
`APPROVAL`** — bukan di kepala formulir, bukan saat
menyimpan — pada detik kombinasinya menjadi benar.
Menempelkannya pada baris pilihan membuatnya terbaca sebagai
catatan atas pilihan itu, bukan vonis atas seluruh formulir.

Yang membuatnya **bukan galat**: token peringatan, bukan
galat; ikon `AlertTriangle`, bukan `XCircle`; tombol simpan
tetap aktif penuh, karena kombinasi ini diizinkan dan
menghalanginya berarti berbohong; kalimatnya berakhir dengan
saran, bukan larangan.

Yang membuatnya **tidak bisa diabaikan**: ia tidak pernah
hilang sendiri dan tidak dapat ditutup selama kombinasinya
berlaku; ia memakan ruang vertikal sungguhan sehingga tombol
simpan terdorong turun dan pemilik melewatinya secara fisik
untuk menyimpan; dan ia **membawa jalan keluar, bukan cuma
keluhan** — satu tombol sekunder di dalamnya yang mengubah
`source` dari `EXTERNAL` menjadi `UPLOAD` di tempat.
Peringatan yang menawarkan perbaikan jauh lebih sulit
dilewati daripada yang hanya menyatakan masalah.

Toast tidak pernah menjadi satu-satunya umpan balik untuk
tindakan yang mengubah izin.

## Layout Patterns

- **Dashboard** — bilah atas dengan garis batas bawah,
  lalu satu kolom terpusat `max-w-4xl`. Isi utamanya
  daftar group berbentuk akordeon.
- **Bilah identitas dashboard** — bilah atasnya memuat nama
  akun yang sedang masuk dan tombol keluar, selalu terlihat
  tanpa perlu membuka menu. Aturan ini sama dengan bilah
  identitas halaman publik, dan alasannya sama: laptop ruang
  rapat dipakai bergantian. Tanpa jalan keluar yang terlihat,
  riwayat akses mencatat orang berikutnya sebagai orang yang
  pertama masuk.

  Ditambahkan 21 Agustus 2026, setelah pemilik menemukannya
  saat menguji Unit 1 — dokumen ini semula hanya mewajibkan
  tombol keluar di halaman publik, sehingga dashboard lolos
  tanpa jalan keluar sama sekali.

  Tombol ganti tema duduk di bilah atas dashboard sebagai
  ikon di samping tombol keluar. Halaman publik **tidak**
  memilikinya: bilah identitas di sana hanya muncul bagi
  pengunjung yang sedang masuk, sehingga tombolnya akan
  hilang justru bagi mayoritas pengunjung. Halaman publik
  mengikuti `prefers-color-scheme` perangkat.
- **Akordeon group** — dalam keadaan terlipat menampilkan
  judul, jumlah item, lencana status berbagi, dan tanggal
  kedaluwarsa. Saat dibuka menampilkan daftar item yang
  dapat digeser urutannya, dengan tombol tambah item di
  bagian bawah.

  **Hanya satu akordeon terbuka pada satu waktu.** Membuka
  group B menutup group A. Pada 20–50 group, satu akordeon
  terbuka berisi 15 item menyisipkan sekitar satu layar
  penuh ke tengah daftar; dua akordeon terbuka membuat
  daftar berhenti dapat dinavigasi. Saat dibuka, kepala
  barisnya digulirkan ke atas viewport.

  **Baris terlipat berketinggian tetap.** Judul dipotong
  satu baris dengan elipsis dan tidak pernah membungkus —
  daftar berbaris seragam dapat dipindai lewat posisi,
  daftar bergerigi tidak. Judul utuh tetap tersedia di
  atribut `title` dan di halaman publik. Jumlah item
  ditampilkan sebagai angka mono redup, **bukan lencana**,
  supaya tidak bersaing dengan kolom status.

  Anatomi baris terlipat, kiri ke kanan: chevron, judul,
  jumlah item, celah lentur, lalu kolom status berlebar
  tetap. Pada lebar sempit kolom status turun ke bawah
  judul dan tetap rata kiri satu sama lain.
- **Bilah penyaring daftar group** — lengket di kepala
  daftar, memuat satu kolom teks penyaring judul dan
  kontrol tersegmen **Aktif · Nonaktif · Semua** yang
  bawaannya **Aktif**. Group acara lama hampir seluruhnya
  nonaktif atau kedaluwarsa; menyaringnya keluar memangkas
  daftar 40 baris menjadi beberapa yang sedang dikerjakan,
  tanpa menghapus apa pun. Tidak ada pencarian sebagai
  halaman tersendiri, tidak ada konsep arsip, dan tidak ada
  paginasi daftar group.
- **Panel Bagikan** — `sheet` yang muncul dari kanan pada
  layar lebar, dan dari bawah pada ponsel. Berisi pilihan
  tingkat akses, tanggal kedaluwarsa, saklar aktif, URL
  yang dapat disalin, dan pratinjau QR code.
- **Halaman publik** — satu kolom terpusat `max-w-2xl`
  dengan padding lega. Judul group, deskripsi, lalu daftar
  kartu item ditumpuk vertikal. Tidak ada bilah samping
  dan tidak ada navigasi lain.

  Di bawah judul group: **slug dalam mono**, sekali saja.
  Itu benda yang barusan dipindai pengunjung, dan
  menampilkannya menjawab "saya tidak salah alamat" tanpa
  satu kalimat pun. Lalu **baris ringkasan bernada mono**,
  misalnya `8 item · 3 perlu masuk · 2 butuh persetujuan`,
  yang memberi bentuk halaman sebelum digulir dan gratis
  dihitung di server.

  Daftar item mengikuti `sortOrder` pemilik apa adanya.
  Tidak ada kepala bagian, tidak ada pengelompokan menurut
  tingkat akses, dan tidak ada pengurutan ulang: pemilik
  mengatur urutan karena ada alasannya, dan perbedaan
  tingkat akses dibawa oleh isi kartu, bukan oleh posisi.
  Tidak ada gerakan atau animasi masuk pada daftar item.
- **Spanduk pratinjau pemilik** — ditempatkan **di atas
  judul group**, sehingga terbaca sebagai bingkai halaman
  dan bukan sebagai item di dalamnya. Rule tebal di tepi
  kiri dalam aksen peringatan di atas permukaan
  `--bg-elevated`, dengan ikon `Ban`. Ia satu-satunya
  elemen di halaman yang memakai aksen peringatan, dan
  dibuat **lebih datar daripada kartu item** — tanpa
  bayangan, tanpa bobot tebal — supaya terbaca sebagai
  chrome, bukan isi. Tidak dapat ditutup.
- **Bilah identitas halaman publik** — bila pengunjung
  sedang masuk, tampilkan nama dan tombol keluar di bagian
  atas halaman, selalu terlihat tanpa perlu membuka menu.
  Laptop ruang rapat dipakai bergantian; tanpa tombol ini,
  riwayat akses akan mencatat lima orang berikutnya sebagai
  orang yang pertama masuk.
- **Modal** — overlay terpusat dengan latar buram.
- **Halaman Riwayat** — **halaman tersendiri per group**,
  bukan tab di dalam akordeon dan bukan sheet. Penyaring
  item, penyaring rentang tanggal, dan paginasi tidak muat
  di dalam akordeon yang sudah terpotong kolom `max-w-4xl`.

  Diputuskan 21 Agustus 2026, menggantikan rumusan
  sebelumnya "lebar penuh di dalam kolom dashboard" dan
  langkah 8 pada `project-overview.md` yang menyebutnya
  sebagai tab.
- **Tabel riwayat** — lebar penuh di dalam halaman Riwayat,
  dengan kolom Waktu, Nama, Email, Item, dan Hasil. Kolom
  Waktu mengikuti aturan zona waktu di bawah.

  **Urutan pengorbanan saat layar menyempit.** Pemilik
  membuka riwayat untuk menjawab satu pertanyaan: siapa
  membuka apa, kapan. Maka Nama, Item, dan Waktu adalah
  tiga serangkai yang tidak dapat direduksi.

  1. **Email lebih dulu** — kolom terpanjang dan paling
     jarang dipindai. Tidak dihapus, melainkan turun
     menjadi baris kedua mono redup di dalam sel Nama.
  2. **Item menyusut** dengan elipsis; judul utuh tetap
     tersedia di atribut `title`.
  3. **Hasil tidak pernah dikorbankan** — ia justru alasan
     tabel ini ada. Baris `DENIED` menampilkan `denyReason`
     sebagai baris kedua di dalam selnya.
  4. **Waktu berlebar tetap** dan tidak pernah menyusut.

  **Alamat IP** tampil sebagai baris mono redup di bawah
  Waktu pada tampilan lebar, dan dihilangkan dari kartu
  ponsel — ia bahan forensik, bukan bahan pindai. Ini
  menyelesaikan pertentangan antara bagian Typography, yang
  menyebut IP ada di tabel riwayat, dan daftar lima kolom
  di atas yang tidak menyebutnya.

  **Kartu di ponsel** disusun menurut pertanyaan yang
  dijawab, **tanpa label medan sama sekali** — posisi dan
  gaya huruf yang memikulnya: nama paling kuat
  (`text-base font-medium`) dengan email mono redup di
  bawahnya, lalu judul item, lalu waktu mono redup berlabel
  zona, dan Hasil sebagai pil di slot penanda kanan.

  **Paginasi berbasis halaman** di kaki tabel dengan jumlah
  total dinyatakan, misalnya `1–50 dari 214`. Bukan gulir
  tak berujung: ini catatan pertanggungjawaban, dan posisi
  baris harus stabil serta dapat dirujuk.

  **Penyaring:** item, rentang tanggal, dan satu cip
  "Hanya yang ditolak". Baris `DENIED` adalah alasan
  seseorang membuka halaman ini di hari yang buruk, dan
  mencarinya di antara dua ratus baris `GRANTED` adalah
  pekerjaan yang tidak perlu ada.
- **Halaman Permintaan** — daftar di `/dashboard/requests`,
  dikelompokkan per group lalu per pemohon. Satu kartu per
  pemohon memuat nama, email, waktu pengajuan, keperluan,
  dan daftar item yang diminta dengan kotak centang.

  **Label tombol keputusan mengikuti jumlah item.** Saat
  pemohon meminta lebih dari satu item, tombol di kepala
  kartu berbunyi "Setujui semua" dan "Tolak semua", dan
  bertindak atas seluruh item tanpa memedulikan centangnya
  — itu jalur tercepat dan harus tetap jalur tercepat. Saat
  ia meminta **satu** item, kartunya tidak berkotak centang
  dan tombolnya berbunyi "Setujui" dan "Tolak". Kata
  "semua" untuk satu item membuat pemilik berhenti
  sepersekian detik memastikan ia tidak menyetujui sesuatu
  yang lebih luas, dan kartu ini dibaca puluhan kali saat
  acara berjalan.

  Pada dua item atau lebih, seluruh kotak centang tercentang
  sejak awal. Sepasang tombol yang lebih tenang untuk
  bertindak atas yang tercentang saja muncul **hanya
  ketika** centangnya sudah bukan semuanya.

  **Urutan:** group dengan permintaan tertua lebih dulu; di
  dalamnya, pemohon menurut waktu pengajuan menaik. Saat
  acara berjalan ini adalah antrean.

  **Setelah diputuskan,** kartunya menciut di tempat menjadi
  satu baris penegasan — misalnya "Disetujui — 5 item" —
  yang bertahan sampai halaman ditinggalkan, alih-alih
  lenyap dan menggeser seluruh daftar di bawahnya. Pemilik
  tidak kehilangan posisinya di antrean, dan gerakan
  menciut itu sendiri yang menjelaskan apa yang terjadi;
  toast tidak diperlukan. Lencana di bilah atas berkurang
  bersamaan.

  **Keperluan** tersimpan per item di `AccessRequest`,
  sehingga satu pengajuan massal menghasilkan beberapa baris
  dengan keperluan yang biasanya identik. Tampilkan sekali
  di kepala kartu bila seluruhnya sama, dan per item bila
  berbeda. Menampilkan lima salinan kalimat yang sama
  membuat kartu terbaca sebagai lima permintaan terpisah.
- **Lencana permintaan** — angka jumlah permintaan tertunda
  di bilah atas dashboard, terlihat dari halaman mana pun.

## Item Card Anatomy

Kartu item adalah komponen yang paling sering dilihat, dan
bentuknya sama di halaman publik maupun dashboard.

Dari kiri ke kanan: ikon tipe, lalu blok teks berisi judul
dan deskripsi, lalu penanda di sisi kanan. Ikon tipe duduk
di **rel berlebar tetap**, sehingga seluruh judul lurus satu
garis sepanjang halaman — pada 8–20 item, keteraturan itulah
yang membuat daftar dapat dipindai sambil berdiri.

**Lipatan di ponsel.** Pada lebar ponsel kartu menjadi dua
baris: baris satu memuat ikon tipe dengan judul dan
deskripsi, baris dua memuat lencana dan tombol. Lencana naik
ke slot penanda kanan begitu lebarnya cukup. Susunan
kiri-ke-kanan di atas tetap berlaku pada lebar baca; yang
berubah hanya cara ia melipat. Tanpa lipatan ini, lencana
memaksa judul membungkus buruk di lebar ponsel — dan ponsel
adalah jalur pemakaian yang paling sering terjadi.

Ditambahkan 21 Agustus 2026; aturan sebelumnya menyatakan
susunan kiri-ke-kanan tanpa syarat lebar.

**Hierarki di dalam kartu.** Karena daftar item selalu
mengikuti `sortOrder` pemilik apa adanya — tanpa
pengelompokan dan tanpa pengurutan ulang menurut tingkat
akses — seluruh perbedaan dipikul oleh isi kartu, dengan
urutan baca:

1. **Judul item**, selalu, di setiap kartu tanpa kecuali.
2. **Ada-tidaknya lencana pil.** Item `OPEN` tidak
   berlencana sama sekali; ketiadaan itu bermakna dan
   ditopang oleh afordansi tautan kartunya, bukan oleh
   warna. Ikon `ExternalLink` sengaja berkelas visual lain
   — glif kecil bernada redup, bukan pil bergaris — supaya
   ia tidak terbaca sebagai lencana keadaan.
3. **Tombol.** Hanya kartu yang butuh tindakan yang
   memilikinya, dan tombol adalah elemen terberat di
   halaman. Item yang menunggu keputusan karena itu
   terangkat sendiri secara visual **tanpa berpindah
   posisi**.
4. Deskripsi dan keterangan "Akses Anda akan dicatat" hidup
   di lapisan paling ringan.

| Tipe    | Ikon         |
| ------- | ------------ |
| `LINK`  | `Link`       |
| `PDF`   | `FileText`   |
| `IMAGE` | `Image`      |

Item bersetelan `accessMode = IDENTITY` menampilkan lencana
`Lock` bertuliskan "Perlu masuk", dan di bawah deskripsinya
muncul keterangan kecil bertuliskan "Akses Anda akan
dicatat". Keterangan ini wajib ada dan berbunyi sama untuk
semua tipe item. Pencatatan yang diketahui pemakainya jauh
lebih berguna secara pertanggungjawaban daripada pencatatan
diam-diam.

Item bersetelan `accessMode = APPROVAL` tidak berperilaku
seperti tautan. Kartunya menampilkan keadaan izin pemohon
dan tombol yang sesuai, sehingga ia tahu apa yang harus
dilakukan tanpa perlu mengkliknya lebih dulu dan mendarat
di halaman yang menolaknya.

Item bersumber `EXTERNAL` menampilkan ikon `ExternalLink`
di sisi kanan, sebagai tanda pengunjung akan meninggalkan
aplikasi.

Seluruh kartu item di halaman publik membuka tab baru
dengan `target="_blank"` dan `rel="noopener noreferrer"`,
sehingga halaman group tetap terbuka dan pengunjung tidak
perlu menekan tombol kembali untuk membuka item berikutnya.
PDF dan gambar unggahan dikirim dengan
`Content-Disposition: inline`, jadi tampil di penampil
bawaan peramban di tab baru itu.

**Pratinjau tertanam, hanya untuk `OPEN` bersumber
`UPLOAD`.** Ditetapkan 26 Agustus 2026; rumusan sebelumnya
melarang pratinjau tertanam tanpa kecuali. Kartu item yang
bermode `OPEN` **dan** bersumber `UPLOAD` menampilkan isi
berkasnya langsung di halaman group. Kartunya tetap dapat
diklik untuk membuka tab baru — pratinjau menambah, tidak
menggantikan.

Item `IDENTITY` dan `APPROVAL` **tidak pernah** dipratinjau,
sekalipun bersumber `UPLOAD`. Alasannya bukan tata letak
melainkan pertanggungjawaban: berkas yang tampil sendiri
berarti tertarik tanpa diklik, dan `AccessLog` akan mencatat
setiap pengunjung membuka setiap dokumen terlindungi hanya
karena ia menggulir halaman. Klik itulah keputusan sadar
yang dicatat riwayat, dan pratinjau menghapusnya. Alasan
lengkapnya di `project-overview.md` bagian In Scope.

Pratinjau **tidak boleh menjadi jalur akses kedua**: ia
tetap melewati gerbang item yang sama seperti klik biasa,
sesuai invarian 1. Tidak ada URL Blob yang muncul di HTML
halaman group, apa pun mode aksesnya.

Belum dibangun. Menunggu Unit 4 menyediakan rute penyajian
berkas; dijadwalkan Unit 5 atau sesudahnya.

## Tata Bahasa Lencana

Satu aturan bentuk yang berlaku untuk **seluruh** lencana di
kedua permukaan, dan yang menghasilkan seluruh kosakata
keadaan di bawah:

Pil `rounded-full` berisi ikon Lucide `h-4 w-4` dan teks,
dengan garis batas setipis rambut dalam warna keadaan di
atas permukaan bernada tipis dari warna yang sama.
**Lencana tidak pernah terisi penuh.**

Alasannya bukan selera. Bila lencana boleh terisi penuh, ia
akan bersaing dengan tombol, dan pemakai kehilangan cara
membedakan penanda dari kontrol. Dengan aturan ini,
satu-satunya elemen terisi penuh di layar mana pun adalah
tombol yang benar-benar dapat ditindak — sehingga "ada yang
bisa saya lakukan di sini" terbaca sebelum satu kata pun
dibaca.

Lencana selalu memuat teks, tidak pernah ikon saja. Warna
dan ikon menyertai kata, tidak menggantikannya.

## Access State Visuals

**Satu baris akordeon selalu memuat tepat satu lencana,
tidak pernah dua.** Keempat status group bukan hal
sederajat: `PRIVATE`, `REQUIRE_LOGIN`, dan `PUBLIC` adalah
**setelan**, sedangkan "Nonaktif" adalah **keadaan yang
membatalkan setelan itu** — group yang dicabut atau
kedaluwarsa tidak dapat dicapai siapa pun, sehingga tingkat
aksesnya tidak lagi berarti apa-apa. Maka lencana
"Nonaktif" **menggantikan** lencana visibilitas, bukan
menemaninya.

Ini bukan penghematan ruang. Lencana menempati kolom kanan
berlebar tetap sehingga membentuk satu garis vertikal yang
dapat dibaca sebagai kolom; memindai berarti membaca satu
jalur ke bawah, bukan berburu di tiap baris. Jumlah dan
bentuk yang konstan adalah syarat kolom itu terbaca sekilas,
dan dua lencana pada sebagian baris akan merusaknya sekaligus
menyiratkan bahwa "Publik + Nonaktif" adalah keadaan yang
bermakna.

| Keadaan                        | Tampilan                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| Group `PRIVATE`                | Lencana abu bertuliskan "Privat", ikon `EyeOff`                     |
| Group `REQUIRE_LOGIN`          | Lencana aksen bertuliskan "Wajib masuk", ikon `Lock`                |
| Group `PUBLIC`                 | Lencana hijau bertuliskan "Publik", ikon `Globe`                    |
| Berbagi dimatikan              | Lencana **netral** bertuliskan "Tidak dibagikan", ikon `Link2Off`   |
| Group kedaluwarsa              | Lencana **peringatan** bertuliskan "Kedaluwarsa", ikon `Ban`        |
| Group berakhir < 7 hari lagi   | Tanggal kedaluwarsa bernada peringatan **disertai kata**, misalnya "berakhir 3 hari lagi" — bukan tanggal berwarna saja |

**Kenapa dua baris, bukan satu lencana "Nonaktif".** Nadanya mengikuti
siapa penyebabnya. Saklar berbagi yang mati adalah pilihan sadar
pemilik — termasuk untuk group yang belum pernah dibagikan sama sekali,
yang bawaannya memang `shareEnabled = false` — sehingga nadanya netral.
Kedaluwarsa terjadi **tanpa** pemilik memutuskan apa pun pada saat itu,
dan justru itu yang pantas diperingatkan.

Ditetapkan 21 Agustus 2026, menggantikan satu lencana "Nonaktif" bernada
peringatan yang berlaku untuk keduanya. Rumusan lama membuat setiap group
yang baru dibuat langsung tampil berikon larangan berwarna peringatan,
padahal ia belum pernah dibagikan — bukan dicabut.

**Urutannya saat keduanya berlaku:** berbagi mati menang atas
kedaluwarsa. Ketika saklarnya mati, link-nya mati apa pun tanggalnya, dan
keadaan yang sedang dipilih pemilik lebih berguna dibaca daripada keadaan
yang sudah tidak berpengaruh.
| Item butuh identitas           | Lencana `Lock` bertuliskan "Perlu masuk"                            |
| Item bermasalah                | Lencana galat bertuliskan "Berkas hilang", ikon `AlertTriangle`     |

## Item Bermode Persetujuan

Kartu item `APPROVAL` berubah bentuk mengikuti keadaan
izin pemohon. Kartunya baru berperilaku sebagai tautan
biasa setelah izin disetujui.

| Keadaan pemohon        | Lencana                                      | Aksi pada kartu                       |
| ---------------------- | -------------------------------------------- | ------------------------------------- |
| Belum masuk            | `ShieldCheck` "Butuh persetujuan"             | Tombol "Masuk untuk mengajukan"       |
| Belum mengajukan       | `ShieldCheck` "Butuh persetujuan"             | Tombol "Ajukan izin"                  |
| Menunggu keputusan     | `Clock` "Menunggu persetujuan", warna redup   | Nonaktif, disertai waktu pengajuan    |
| Disetujui              | `ShieldCheck` "Disetujui", warna berhasil     | Tautan biasa ke gerbang item          |
| Ditolak                | `ShieldX` "Tidak disetujui", warna galat      | Nonaktif, disertai catatan pemilik    |
| Izin dicabut           | `ShieldX` "Izin dicabut", warna galat         | Nonaktif                              |
| Izin kedaluwarsa       | `Clock` "Izin berakhir", warna peringatan     | Nonaktif                              |

**Ketujuh keadaan itu dibangun sebagai tiga kelas
perilaku**, dan inilah yang menjaga kartu tetap sederhana:

- **Terbuka** — hanya "Disetujui". Kartu **adalah** tautan
  biasa: seluruh kartu menjadi sasaran ketuk, membuka tab
  baru, persis seperti kartu `OPEN`. Satu-satunya sisa alur
  persetujuan adalah lencananya. Kartu yang disetujui tidak
  menyimpan jejak lain bahwa ia pernah terkunci.
- **Dapat ditindak** — "Belum masuk" dan "Belum
  mengajukan". Kartu bukan tautan; ia memuat lencana dan
  **satu** tombol.
- **Tertutup atau menunggu** — "Menunggu", "Ditolak",
  "Dicabut", "Kedaluwarsa". Kartu bukan tautan dan **tanpa
  tombol sama sekali**: lencana, ditambah satu baris
  keterangan di bawah deskripsi berisi waktu pengajuan,
  catatan pemilik, atau tanggal berakhir.

Aturan yang menahan kartu dari keramaian: **satu kartu tidak
pernah memuat lebih dari satu lencana dan satu tombol.**
Ketiga keadaan tertutup dibedakan oleh kata — "Tidak
disetujui", "Izin dicabut", "Izin berakhir" — masing-masing
dengan baris kedua yang berbeda isinya, bukan oleh warna.

Keadaan yang tidak dapat ditindak **menghilangkan tombolnya,
bukan mengabukannya.** Tombol abu tetap mengundang ketukan
dan berakhir sebagai kegagalan senyap.

Bila ada lebih dari satu item `APPROVAL` yang belum
diajukan, tampilkan satu tombol "Ajukan izin untuk semua"
di atas daftar, dalam panel ramping di bawah judul group —
bukan bilah lengket, yang memakan viewport ponsel. Tanpa
tombol itu, pengunjung menghadapi tiga dialog berturut-turut
untuk satu keperluan yang sama. Pada satu item saja tombol
ini tidak muncul, karena tombol per kartu sudah menjawabnya.
Setelah pengajuan terkirim, panelnya lenyap — hilangnya
panel itu sendiri adalah sinyal keadaan.

Pengajuan massal mencakup item **`APPROVAL` saja**. Item
`IDENTITY` juga terkunci, tetapi ia tidak butuh permintaan —
hanya butuh masuk, dan mengikutkannya akan mengirim
permintaan yang tidak pernah perlu diputuskan pemilik.

Tombol per kartu dan tombol massal hidup berdampingan dan
tidak saling menggantikan: yang per kartu adalah jalur tepat,
yang massal adalah jalur cepat. Keduanya menuju halaman
pengajuan yang sama; bedanya hanya item mana yang tercentang
saat halaman terbuka.

**Halaman pengajuan adalah bentuk kanonisnya; dialog adalah
peningkatan di atasnya.** Keduanya memuat isi yang sama
persis, dan tombolnya tetap berupa tautan biasa menuju
halaman itu. Bukan dua rancangan, melainkan satu rancangan
dengan dua wadah — dokumen ini sebelumnya mewajibkan
keduanya ada tanpa pernah menyatakan mana yang menjadi
sumber.

Isi pengajuan memuat nama item, kolom keperluan opsional
maksimal 300 karakter dengan hitungan sisa karakter, dan —
ini yang wajib — nama serta email yang akan terkirim ke
pemilik, ditampilkan apa adanya di atas permukaan bergaris
batas, **berbobot setara dengan daftar item, bukan cetakan
kecil di kaki halaman**. Orang berhak tahu identitas apa
yang sedang ia serahkan sebelum menekan tombol kirim; yang
diserahkan ditampilkan sejajar dengan yang diminta.

## Empty and Error States

Setiap keadaan kosong menyebutkan langkah berikutnya, bukan
sekadar menyatakan bahwa tidak ada apa-apa.

- Belum ada group — "Belum ada group. Buat group pertama
  untuk mulai menghimpun tautan dan berkas."
- Group kosong — "Group ini belum berisi apa-apa. Tambah
  tautan, PDF, atau gambar."
- Riwayat kosong — "Belum ada yang mengakses group ini."
- Riwayat kosong **karena penyaring** — "Tidak ada akses
  yang cocok dengan penyaring ini. Ubah rentang tanggal
  atau pilih item lain." Kalimat ini wajib berbeda dari
  yang di atas: menyatakan "belum ada yang mengakses" saat
  yang terjadi adalah penyaring terlalu sempit membuat
  pemilik menyimpulkan hal yang keliru tentang acaranya.
- Daftar group kosong **karena penyaring** — "Tidak ada
  group yang cocok. Kosongkan kolom pencarian atau pilih
  Semua."
- Permintaan kosong — "Tidak ada permintaan yang menunggu
  keputusan."
- Halaman pengajuan izin — menyebut nama item dan nama
  group, lalu menjelaskan bahwa pemilik akan memutuskan
  dan pemohon akan dikabari lewat email. Jangan menjanjikan
  tenggat waktu yang tidak dapat dipenuhi aplikasi.
- Halaman menunggu keputusan — menyebut waktu pengajuan dan
  menyatakan bahwa pemohon boleh menutup halaman ini karena
  kabarnya dikirim lewat email.
- Halaman permintaan ditolak — menyatakan keadaannya apa
  adanya beserta catatan pemilik bila ada, dan menyarankan
  menghubungi pemilik secara langsung. Tidak menyediakan
  tombol mengajukan ulang.
- Halaman publik tidak ditemukan, dicabut, atau kedaluwarsa
  — satu halaman yang sama untuk ketiganya: "Halaman ini
  tidak tersedia. Link mungkin sudah tidak berlaku atau
  alamatnya keliru." Tanpa menyebut nama group dan tanpa
  menyiratkan bahwa group itu pernah ada.

  Ini halaman terpendek di aplikasi dan satu-satunya yang
  tidak boleh tahu apa pun: tanpa baris kembali, tanpa
  tautan ke `/g/` mana pun, tanpa saran alamat, tanpa
  pencarian, dan tanpa "mungkin maksud Anda". Semua
  keramahan semacam itu membocorkan keberadaan group.
  Kekosongannya adalah fiturnya.

  Tiga halaman keadaan lainnya — pengajuan, menunggu, dan
  ditolak — tahu group-nya dan boleh menyebutnya. Hanya
  halaman ini yang tidak.
- Akses gagal dicatat — "Akses Anda tidak dapat dicatat.
  Aplikasi ini tidak meneruskan apa pun yang tidak dapat ia
  catat, jadi halaman ini tidak dibuka. Coba lagi sebentar
  lagi." HTTP 500, halaman tersendiri, bukan halaman tidak
  tersedia.

  Dua halaman ini sengaja berbeda. Yang satu berarti tidak
  ada apa-apa di sini; yang ini berarti ada, dan gerbangnya
  baru saja meloloskan Anda, tetapi jejaknya gagal ditulis.
  Memakai kalimat yang pertama untuk keadaan yang kedua
  membuat pengunjung berhenti mencoba padahal percobaan
  berikutnya mungkin berhasil. Ditetapkan 27 Agustus 2026,
  keputusan U4-8.
- Pemilik membuka group nonaktif — halaman tampil normal,
  didahului spanduk peringatan: "Link berbagi group ini
  sedang tidak aktif. Hanya Anda yang dapat melihat
  halaman ini."

## Icons

Lucide React. Hanya ikon bergaya garis. Ukuran `h-4 w-4`
untuk inline dan lencana, `h-5 w-5` untuk tombol, `h-6 w-6`
untuk ikon tipe pada kartu item. Ikon dekoratif diberi
`aria-hidden`; ikon yang berdiri sendiri sebagai tombol
wajib punya `aria-label`.

## Accessibility

- Akordeon dashboard dapat dioperasikan penuh dengan
  papan ketik dan mengumumkan keadaan terlipat atau
  terbuka.
- Penyusunan ulang item dengan geser wajib punya alternatif
  papan ketik berupa tombol naik dan turun.
- Cincin fokus selalu terlihat di kedua mode warna.
- Halaman publik dapat digunakan tanpa JavaScript untuk
  hal-hal pokoknya: daftar item dan penerusan lewat gerbang
  tetap berfungsi, karena keduanya dirender di server dan
  berupa tautan biasa.
- **Dashboard boleh bergantung pada JavaScript.** Garis
  dasar tanpa JavaScript adalah janji untuk pengunjung,
  bukan untuk pemilik. Inilah yang membuat bilah penyaring,
  geser-urutan, dan pilih-banyak layak dipakai di CMS — asal
  setiap kontrol tetap punya jalur papan ketik.
- Ikon dekoratif diberi `aria-hidden`; ikon yang berdiri
  sendiri sebagai tombol wajib punya `aria-label`.
