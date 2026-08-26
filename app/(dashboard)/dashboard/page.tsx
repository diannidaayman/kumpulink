import { GroupList } from "@/components/dashboard/group-list";
import { requireOwner } from "@/lib/auth/session";
import { listGroupsForDashboard } from "@/lib/db/groups";
import { listItemsForDashboard } from "@/lib/db/items";

export default async function DashboardPage() {
  // Layout tidak menjamin gerbang ini saat navigasi lunak antar saudara,
  // dan Next.js merender layout serta halaman secara bersamaan — jadi
  // halaman ini memanggil gerbangnya sendiri, seperti setiap server action.
  // auth() sudah di-cache per permintaan, jadi ini tidak menambah biaya.
  await requireOwner();

  const [groups, itemsByGroup] = await Promise.all([
    listGroupsForDashboard(),
    listItemsForDashboard(),
  ]);

  // Keadaan kosong dirender DI DALAM GroupList, bukan sebagai kembalian
  // awal di sini. Mengembalikannya lebih awal ikut menyembunyikan tombol
  // "Group baru", sehingga daftar kosong menjadi jalan buntu — persis
  // pada layar yang paling membutuhkan jalan keluar.
  //
  // `now` dihitung di SERVER lalu diturunkan sebagai prop. Menghitungnya
  // di dalam komponen klien membuat render server dan render klien
  // memakai dua waktu berbeda, dan lencana status ikut berbeda di antara
  // keduanya — persis definisi ketidakcocokan hidrasi.
  return <GroupList groups={groups} itemsByGroup={itemsByGroup} now={new Date()} />;
}
