# UI Context

## Theme

Mendukung mode terang dan gelap. Secara bawaan mengikuti
setelan perangkat melalui `prefers-color-scheme`, dengan
tombol ganti manual yang pilihannya diingat di
`localStorage`.

Bahasa visualnya tenang dan formal: permukaan bersih,
garis batas tipis, satu warna aksen biru, dan tidak ada
hiasan yang tidak menjelaskan apa pun. Halaman publik akan
dibuka rekan kerja dan kadang ditayangkan di proyektor
ruang rapat, jadi keterbacaan dari jarak jauh lebih
penting daripada gaya.

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
huruf: slug group, URL berbagi, dan alamat IP di tabel
riwayat.

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

Ketika `APPROVAL` dipilih pada item bersumber `EXTERNAL`,
tampilkan `alert` peringatan: persetujuan tidak menghalangi
pemohon yang sudah disetujui untuk menyalin dan menyebarkan
URL aslinya. Sarankan mengunggah berkasnya.

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
- **Akordeon group** — dalam keadaan terlipat menampilkan
  judul, jumlah item, lencana status berbagi, dan tanggal
  kedaluwarsa. Saat dibuka menampilkan daftar item yang
  dapat digeser urutannya, dengan tombol tambah item di
  bagian bawah.
- **Panel Bagikan** — `sheet` yang muncul dari kanan pada
  layar lebar, dan dari bawah pada ponsel. Berisi pilihan
  tingkat akses, tanggal kedaluwarsa, saklar aktif, URL
  yang dapat disalin, dan pratinjau QR code.
- **Halaman publik** — satu kolom terpusat `max-w-2xl`
  dengan padding lega. Judul group, deskripsi, lalu daftar
  kartu item ditumpuk vertikal. Tidak ada bilah samping
  dan tidak ada navigasi lain.
- **Bilah identitas halaman publik** — bila pengunjung
  sedang masuk, tampilkan nama dan tombol keluar di bagian
  atas halaman, selalu terlihat tanpa perlu membuka menu.
  Laptop ruang rapat dipakai bergantian; tanpa tombol ini,
  riwayat akses akan mencatat lima orang berikutnya sebagai
  orang yang pertama masuk.
- **Modal** — overlay terpusat dengan latar buram.
- **Tabel riwayat** — lebar penuh di dalam kolom dashboard,
  dengan kolom Waktu, Nama, Email, Item, dan Hasil. Kolom
  Waktu mengikuti aturan zona waktu di bawah. Pada ponsel
  berubah menjadi tumpukan kartu.
- **Halaman Permintaan** — daftar di `/dashboard/requests`,
  dikelompokkan per group lalu per pemohon. Satu kartu per
  pemohon memuat nama, email, waktu pengajuan, keperluan,
  dan daftar item yang diminta dengan kotak centang.
  Tombol "Setujui semua" dan "Tolak semua" berada di kepala
  kartu, sehingga jalur tercepat adalah memutuskan satu
  orang sekaligus. Memutuskan per item tetap mungkin lewat
  centang.
- **Lencana permintaan** — angka jumlah permintaan tertunda
  di bilah atas dashboard, terlihat dari halaman mana pun.

## Item Card Anatomy

Kartu item adalah komponen yang paling sering dilihat, dan
bentuknya sama di halaman publik maupun dashboard.

Dari kiri ke kanan: ikon tipe, lalu blok teks berisi judul
dan deskripsi, lalu penanda di sisi kanan.

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
bawaan peramban di tab baru itu — bukan tertanam di dalam
halaman group.

## Access State Visuals

| Keadaan                        | Tampilan                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| Group `PRIVATE`                | Lencana abu bertuliskan "Privat", ikon `EyeOff`                     |
| Group `REQUIRE_LOGIN`          | Lencana aksen bertuliskan "Wajib masuk", ikon `Lock`                |
| Group `PUBLIC`                 | Lencana hijau bertuliskan "Publik", ikon `Globe`                    |
| Link dicabut atau kedaluwarsa  | Lencana peringatan bertuliskan "Nonaktif", ikon `Ban`               |
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

Bila ada lebih dari satu item `APPROVAL` yang belum
diajukan, tampilkan satu tombol "Ajukan izin untuk semua"
di atas daftar. Tanpa itu, pengunjung menghadapi tiga
dialog berturut-turut untuk satu keperluan yang sama.

Dialog pengajuan memuat nama item, kolom keperluan
opsional maksimal 300 karakter, dan — ini yang wajib —
nama serta email yang akan terkirim ke pemilik, ditampilkan
apa adanya. Orang berhak tahu identitas apa yang sedang ia
serahkan sebelum menekan tombol kirim.

## Empty and Error States

Setiap keadaan kosong menyebutkan langkah berikutnya, bukan
sekadar menyatakan bahwa tidak ada apa-apa.

- Belum ada group — "Belum ada group. Buat group pertama
  untuk mulai menghimpun tautan dan berkas."
- Group kosong — "Group ini belum berisi apa-apa. Tambah
  tautan, PDF, atau gambar."
- Riwayat kosong — "Belum ada yang mengakses group ini."
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
