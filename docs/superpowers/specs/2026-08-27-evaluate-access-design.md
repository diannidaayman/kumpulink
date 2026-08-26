# Unit 4, bagian pertama — `evaluateAccess()` dan matriks pengujiannya

**Tanggal:** 27 Agustus 2026
**Unit:** 4 — Gerbang akses dan halaman publik (Fase 5)
**Lingkup langkah ini:** fungsi murni dan pengujiannya saja

## Lingkup

Yang dibangun:

- `lib/types/access.ts` — tipe masukan dan union hasil
- `lib/access/evaluate-access.ts` — `evaluateGroupAccess()` dan
  `evaluateItemAccess()`
- `tests/access/` — matriks pengujian lengkap
- Dua pembaruan file konteks yang dituntut keputusan di bawah

Yang **tidak** dibangun di langkah ini, dan tidak boleh disentuh:

- Tidak ada halaman, tidak ada route, tidak ada komponen
- Tidak ada penulisan `AccessLog` dan tidak ada `lib/audit/`
- Tidak ada `getFileStream()`
- Tidak ada perubahan skema Prisma dan tidak ada migrasi

Alasan urutan ini ada di `ai-workflow-rules.md`: Unit 4 adalah unit
paling berisiko dalam proyek, dan `evaluateAccess()` ditulis sebelum satu
halaman pun dibuat justru untuk menurunkan risiko itu. Selama langkah ini
berjalan, tidak ada jalur menuju konten yang berubah — sehingga tidak ada
cara langkah ini membocorkan apa pun.

## Keputusan yang diambil sebelum implementasi

Empat hal tidak terdefinisi di file konteks dan diputuskan lebih dulu di
sini. Tiga di antaranya mengubah isi matriks.

### K1 — `APPROVAL` tanpa catatan izin ditolak sebagai `NOT_FOUND`

Matriks Unit 4 menyebut hasilnya "ditolak", tetapi tidak menyebut
alasannya. Enum `DenyReason` tidak memiliki nilai untuk keadaan ini:
`REQUEST_REJECTED` dan `REQUEST_REVOKED` keduanya keliru, karena tidak
ada permintaan yang pernah dibuat.

**Diputuskan:** `DENIED / NOT_FOUND`.

Alasannya, bagian Security Practices di `code-standards.md` sudah
menetapkan `NOT_FOUND` sebagai wajah dari "tidak dapat dilayani, dan
tidak ada yang perlu diketahui lebih jauh". Menambah nilai enum baru
menuntut migrasi Prisma di langkah yang lingkupnya justru menolak
menyentuh database, untuk nilai yang mati lagi di Unit 7. `ITEM_INACTIVE`
ditolak karena maknanya menyimpang — `isActive` item itu bernilai true,
dan riwayat akan berbohong kepada pemilik.

Ini memenuhi kriteria sukses nomor 8: item `APPROVAL` tanpa catatan izin
berstatus `APPROVED` selalu ditolak, termasuk ketika fiturnya belum
selesai dibangun.

**Unit 7 wajib mengganti cabang ini menjadi `NEEDS_REQUEST`.** Cabangnya
diberi komentar yang menyebut hal itu, supaya pembaca berikutnya membaca
sebuah keputusan, bukan sebuah kelalaian.

### K2 — Dua fungsi, bukan satu

`architecture.md` menyebut dua pemakaian berbeda: halaman group
memanggil tahap satu saja, gerbang item memanggil tahap satu lalu tahap
dua.

**Diputuskan:** `evaluateGroupAccess()` dan `evaluateItemAccess()`, dan
yang kedua memanggil yang pertama di baris pertamanya.

Dengan begitu invarian 6 — item tidak pernah lebih permisif daripada
group induknya — menjadi struktur kode, bukan disiplin pemanggil. Tidak
ada cara memanggil tahap dua tanpa tahap satu lolos lebih dulu. Bentuk
"pemanggil merangkai sendiri" ditolak karena menggantungkan invarian
terpenting pada ingatan pemanggil, persis jenis kelalaian yang membuat
`lib/access/` dipusatkan sejak awal.

Gerbang item memanggil `evaluateItemAccess()` **saja** — satu panggilan,
bukan dua.

### K3 — Pemilik lolos di tahap dua

Tahap dua di `architecture.md` tidak memiliki cabang `OWNER` sama
sekali. Akibatnya pemilik yang membuka item `APPROVAL` miliknya sendiri
akan ditolak: ia sudah masuk, tetapi tidak memiliki catatan izin atas
namanya. Pemilik meminta izin kepada dirinya sendiri.

**Diputuskan:** pemilik `GRANTED` di tahap dua, **setelah** kedua
pemeriksaan struktural.

Urutannya menjadi:

1. Item tidak ditemukan atau bukan milik group ini → `DENIED / NOT_FOUND`
2. `isActive = false` → `DENIED / ITEM_INACTIVE`
3. Pemohon berperan `OWNER` → `GRANTED`
4. Aturan `accessMode`

Kepemilikan tidak memunculkan item yang tidak ada, dan tidak membatalkan
penonaktifan yang pemilik lakukan sendiri — untuk membuka item nonaktif
ia cukup mengaktifkannya lagi di CMS. Cabang `OWNER` hanya melewati
aturan `accessMode`, yang memang ditujukan kepada pengunjung.

Ini aturan izin baru. `architecture.md` diperbarui dalam perubahan yang
sama, sesuai `ai-workflow-rules.md` bagian Keeping Docs in Sync.

### K4 — `resolveGroupStatus()` tidak dipakai ulang

Diwariskan dari Unit 2 dan ditegaskan lagi di `progress-tracker.md`:
`resolveGroupStatus()` adalah fungsi tampilan yang cabang terakhirnya
permisif. Evaluator akses menuntut penolakan sebagai bawaan. Keduanya
berbagi ambang kedaluwarsa yang sama (`<=`), tetapi tidak berbagi kode.

## Arsitektur

### Berkas

| Berkas | Isi |
| ------ | --- |
| `lib/types/access.ts` | Tipe masukan dan union hasil |
| `lib/access/evaluate-access.ts` | Kedua fungsi evaluator |
| `tests/access/group-stage.test.ts` | Matriks tahap satu |
| `tests/access/item-stage.test.ts` | Matriks tahap dua |
| `tests/access/stage-order.test.ts` | Invarian 6 |

Tipe berada di `lib/types/access.ts` dan bukan di dalam berkas
evaluator, karena pemanggil di langkah-langkah Unit 4 berikutnya —
halaman group dan gerbang item — perlu menyebut `AccessDecision` untuk
mencabangkan responsnya. `code-standards.md` menempatkan tipe yang
dipakai lebih dari satu berkas di `lib/types/`.

Matriks dipecah tiga berkas dan bukan satu supaya invarian 6 berdiri
sendiri dan tidak tenggelam di antara belasan baris tabel. Ia bukan baris
tabel; ia alasan tabelnya disusun berurutan.

### Tipe hasil

```ts
export type AccessDecision =
  | { kind: "GRANTED"; ownerPreview: boolean }
  | { kind: "NEEDS_LOGIN" }
  | { kind: "NEEDS_REQUEST" }
  | { kind: "PENDING_APPROVAL" }
  | { kind: "DENIED"; reason: AccessDenyReason };
```

Union eksplisit, bukan boolean — `code-standards.md` menuntutnya, karena
alasan penolakan diperlukan untuk log dan keadaan `NEEDS_*` menentukan
halaman apa yang dirender.

`NEEDS_REQUEST` dan `PENDING_APPROVAL` **didefinisikan sekarang tetapi
belum pernah dihasilkan** di Unit 4. Keduanya lahir di Unit 7. Tipenya
ditulis lebih dulu supaya pemanggil yang dibangun sesudah langkah ini
sudah menangani keduanya sejak awal, dan supaya Unit 7 tidak perlu
mengubah bentuk union yang sudah dipakai pemanggil-pemanggilnya.

`ownerPreview` selalu ada pada `GRANTED` sebagai boolean, bukan penanda
opsional. Pemanggil tidak perlu membedakan `false` dari "tidak
disebutkan".

`AccessDenyReason` adalah himpunan bagian dari `DenyReason` Prisma,
dipersempit dengan `Extract<>`:

```ts
export type AccessDenyReason = Extract<
  DenyReason,
  | "NOT_FOUND"
  | "REVOKED"
  | "EXPIRED"
  | "PRIVATE"
  | "ITEM_INACTIVE"
  | "REQUEST_REJECTED"
  | "REQUEST_REVOKED"
  | "APPROVAL_EXPIRED"
>;
```

`FILE_MISSING` dan `RATE_LIMITED` sengaja berada di luar himpunan ini.
Keduanya keputusan pemanggil — yang pertama diketahui saat berkas
ternyata tidak ada di Blob, yang kedua diputuskan sebelum evaluator
dipanggil sama sekali. Tipe yang jujur mencegah keduanya tertukar dengan
keputusan izin. Dipersempit dengan `Extract<>` dan bukan ditulis ulang
sebagai union literal, supaya nilai yang dihapus dari skema menghasilkan
galat tipe, bukan tipe yang diam-diam berbeda dari enum database.

### Tipe masukan

```ts
export type AccessGroup = {
  id: string;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
};

export type AccessItem = {
  id: string;
  groupId: string;
  isActive: boolean;
  accessMode: AccessMode;
};

export type AccessSession = { userId: string; role: Role } | null;

export type AccessRequestRecord = {
  status: RequestStatus;
  expiresAt: Date | null;
} | null;
```

Bentuk struktural minimal, bukan model Prisma. Alasannya, matriks harus
dapat ditulis tanpa merakit model lengkap berisi belasan kolom yang tidak
berpengaruh pada keputusan. Kolom yang tidak ikut menentukan izin tidak
ikut masuk — termasuk `fileKey`, yang tidak punya urusan apa pun di sini.

`Visibility`, `AccessMode`, `Role`, `RequestStatus`, dan `DenyReason`
diimpor sebagai `import type` dari `@prisma/client`. Impor tipe tidak
menyeret klien Prisma ke dalam berkas dan tidak merusak kemurnian; pola
ini sudah dipakai `lib/types/item.ts`.

`group` dan `item` boleh bernilai `null`, dan itulah cara "tidak
ditemukan" dinyatakan. Pemanggil meneruskan hasil query apa adanya tanpa
perlu mencabangkan lebih dulu — pencabangan itu justru yang dipusatkan di
sini.

`AccessRequestRecord` diberikan pemanggil dan tidak pernah diambil
sendiri. `code-standards.md` menyebut alasannya: mengambilnya sendiri
menghancurkan kemurnian dan membuat matriks memerlukan database.

`now: Date` selalu argumen. Tidak ada `new Date()` di dalam fungsi murni.

### `evaluateGroupAccess(group, session, now)`

Tujuh langkah, berurutan, berhenti pada kecocokan pertama, persis seperti
`architecture.md`:

1. `group === null` → `DENIED / NOT_FOUND`
2. `session?.role === "OWNER"` → `GRANTED`, dengan `ownerPreview` bernilai
   true bila `shareEnabled = false` **atau** sudah kedaluwarsa
3. `shareEnabled = false` → `DENIED / REVOKED`
4. `expiresAt` sudah lewat → `DENIED / EXPIRED`
5. `visibility === "PRIVATE"` → `DENIED / PRIVATE`
6. `visibility === "REQUIRE_LOGIN"` dan `session === null` → `NEEDS_LOGIN`
7. Selain itu → `GRANTED` dengan `ownerPreview: false`

Ambang kedaluwarsa: `expiresAt.getTime() <= now.getTime()`. Sama dengan
`resolveGroupStatus()`, supaya dua tempat tidak menjawab beda pada detik
yang sama. `expiresAt === null` berarti tidak pernah kedaluwarsa.

`PRIVATE` bagi pemilik menghasilkan `GRANTED` tanpa `ownerPreview`.
Penanda itu menyatakan "link sedang tidak aktif", dan group privat bukan
group yang linknya mati — ia group yang linknya memang belum dibagikan.

### `evaluateItemAccess(group, item, session, request, now)`

Baris pertamanya memanggil `evaluateGroupAccess()` dan mengembalikan
hasilnya apa adanya bila `kind !== "GRANTED"`. Baru sesudah itu:

1. `item === null` atau `item.groupId !== group.id` → `DENIED / NOT_FOUND`
2. `isActive = false` → `DENIED / ITEM_INACTIVE`
3. `session?.role === "OWNER"` → `GRANTED`, mewarisi `ownerPreview` dari
   tahap satu (K3)
4. `switch (item.accessMode)`:
   - `OPEN` → `GRANTED`
   - `IDENTITY` dan `APPROVAL`, bila `session === null` → `NEEDS_LOGIN`
   - `IDENTITY` → `GRANTED`
   - `APPROVAL` → `DENIED / NOT_FOUND` — sementara, lihat K1
   - `default` → `DENIED / NOT_FOUND`

Cabang `default` ada dan wajib ada. `code-standards.md`: nilai
`accessMode` yang tidak dikenali ditangani sebagai penolakan, bukan
sebagai kasus yang lolos ke cabang terakhir. Penambahan mode baru tidak
boleh diam-diam membuka akses.

Parameter `request` belum dibaca di Unit 4 — cabang `APPROVAL` menolak
lebih dulu. Ia ada di tanda tangan sejak sekarang supaya Unit 7 mengubah
isi fungsi, bukan mengubah setiap pemanggilnya.

## Matriks pengujian

Pengujian menyebutkan perilaku, bukan nama fungsi. Judul yang benar:
"menolak group kedaluwarsa meski pengunjung sudah masuk". Judul yang
salah: "evaluateGroupAccess mengembalikan EXPIRED".

### `tests/access/group-stage.test.ts`

| Keadaan | Hasil |
| ------- | ----- |
| Group tidak ditemukan | `DENIED / NOT_FOUND` |
| Pemohon `OWNER`, group aktif | `GRANTED`, `ownerPreview: false` |
| Pemohon `OWNER`, group dicabut | `GRANTED`, `ownerPreview: true` |
| Pemohon `OWNER`, group kedaluwarsa | `GRANTED`, `ownerPreview: true` |
| `shareEnabled = false` | `DENIED / REVOKED` |
| `expiresAt` sudah lewat | `DENIED / EXPIRED` |
| `visibility = PRIVATE` | `DENIED / PRIVATE` |
| `REQUIRE_LOGIN`, belum masuk | `NEEDS_LOGIN` |
| `REQUIRE_LOGIN`, sudah masuk | `GRANTED` |
| `PUBLIC`, belum masuk | `GRANTED` |

Ditambah tiga pengujian urutan yang membuktikan "berhenti pada kecocokan
pertama" benar-benar berlaku, bukan kebetulan:

- Group tidak ditemukan menang atas pemohon `OWNER`
- Saklar dicabut menang atas kedaluwarsa
- Kedaluwarsa menang atas `PRIVATE`

Dan satu pengujian ambang: `expiresAt` tepat sama dengan `now` sudah
dihitung kedaluwarsa, sedangkan satu detik sesudahnya belum.

### `tests/access/item-stage.test.ts`

| Keadaan | Hasil |
| ------- | ----- |
| Item bukan milik group ini | `DENIED / NOT_FOUND` |
| Item tidak ditemukan | `DENIED / NOT_FOUND` |
| `isActive = false` | `DENIED / ITEM_INACTIVE` |
| `OPEN`, belum masuk | `GRANTED` |
| `IDENTITY`, belum masuk | `NEEDS_LOGIN` |
| `IDENTITY`, sudah masuk | `GRANTED` |
| `APPROVAL`, belum masuk | `NEEDS_LOGIN` |
| `APPROVAL`, sudah masuk, tanpa catatan izin | `DENIED / NOT_FOUND` |
| `accessMode` bernilai tidak dikenal | `DENIED / NOT_FOUND` |

Ditambah tiga pengujian cabang pemilik (K3):

- Pemilik dibolehkan membuka item `APPROVAL` tanpa catatan izin
- Pemilik dibolehkan membuka item `IDENTITY`
- Pemilik **tetap ditolak** untuk item nonaktif — cabang pemilik berdiri
  setelah `ITEM_INACTIVE`, bukan sebelumnya

Nilai `accessMode` tidak dikenal ditulis di pengujian sebagai
`"SOMETHING_ELSE" as AccessMode`. Pemeranan itu disengaja dan diberi
komentar: yang sedang diuji adalah data yang lebih tua atau lebih baru
daripada kode — baris database yang ditulis versi berikutnya, dibaca
versi sekarang. TypeScript tidak melindungi dari itu, jadi cabang
`default` yang melindunginya, dan pengujian ini yang membuktikannya.

### `tests/access/stage-order.test.ts` — invarian 6

Bukan baris tabel, melainkan alasan tabelnya berurutan. Bentuknya: untuk
**setiap** keadaan yang membuat tahap satu menolak — group tidak
ditemukan, dicabut, kedaluwarsa, dan privat — pasangkan dengan item
paling permisif yang mungkin ada, yaitu item `OPEN` yang aktif dan benar
milik group itu, lalu pastikan hasilnya tetap penolakan tahap satu
beserta alasan tahap satu.

Ditambah satu kasus: group `REQUIRE_LOGIN` tanpa sesi, dipasangkan dengan
item `OPEN`. Hasilnya `NEEDS_LOGIN` dari tahap satu, bukan `GRANTED` dari
item terbuka. Item terbuka di dalam group yang wajib login tidak membuat
group itu terbuka.

Kelima kasus ditulis dengan `it.each` atas satu daftar keadaan,
sehingga menambah keadaan penolakan tahap satu di kemudian hari otomatis
menambah pengujian invariannya.

## Perubahan file konteks

Dikerjakan **sebelum** kode ditulis.

1. **`context/architecture.md`, bagian Access Evaluation, Tahap dua.**
   Sisipkan langkah pemilik sebagai nomor 3, sesudah `ITEM_INACTIVE` dan
   sebelum aturan `accessMode`, beserta alasan mengapa ia berdiri di sana
   dan bukan lebih awal. Nomor langkah sesudahnya bergeser.

2. **`context/progress-tracker.md`.** Catat K1 dan K3 sebagai keputusan
   Unit 4. K1 diberi penanda tegas bahwa Unit 7 wajib menggantinya
   menjadi `NEEDS_REQUEST`; selama belum, sikapnya menolak. K3 dicatat
   sebagai aturan izin baru yang lahir di sini dan sudah dituliskan ke
   `architecture.md`.

`ai-workflow-rules.md` tidak berubah — bagian Unit 4 di sana sudah
menggambarkan langkah ini dengan benar.

## Cara langkah ini dinyatakan selesai

Selesai bila keempatnya benar, dan tidak sebelum itu:

1. `npm test` lulus seluruhnya, dengan matriks `tests/access/` di
   dalamnya
2. `npm run typecheck` bersih
3. `npm run lint` nol peringatan
4. Tidak ada berkas di luar daftar berkas di atas yang berubah, kecuali
   kedua file konteks

`npm run build` tidak dijalankan sebagai gerbang di langkah ini: belum
ada halaman yang dibangun, sehingga ia tidak membuktikan apa pun yang
tidak sudah dibuktikan `typecheck`. Ia menjadi gerbang lagi di langkah
Unit 4 berikutnya, yang memang membuat halaman.

**Berhenti setelah matriks lulus.** Halaman group publik, gerbang item,
dan `lib/audit/` adalah langkah berikutnya, bukan langkah ini.
