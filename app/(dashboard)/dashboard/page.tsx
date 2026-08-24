import { GroupList } from "@/components/dashboard/group-list";
import { listGroupsForDashboard } from "@/lib/db/groups";

export default async function DashboardPage() {
  const groups = await listGroupsForDashboard();

  // Keadaan kosong dirender DI DALAM GroupList, bukan sebagai kembalian
  // awal di sini. Mengembalikannya lebih awal ikut menyembunyikan tombol
  // "Group baru", sehingga daftar kosong menjadi jalan buntu — persis
  // pada layar yang paling membutuhkan jalan keluar.
  //
  // `now` dihitung di SERVER lalu diturunkan sebagai prop. Menghitungnya
  // di dalam komponen klien membuat render server dan render klien
  // memakai dua waktu berbeda, dan lencana status ikut berbeda di antara
  // keduanya — persis definisi ketidakcocokan hidrasi.
  return <GroupList groups={groups} now={new Date()} />;
}
