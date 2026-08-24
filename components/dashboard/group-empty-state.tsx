/**
 * Dua kalimat yang sengaja berbeda. Menyatakan "belum ada group" ketika
 * yang terjadi adalah penyaring terlalu sempit membuat pemilik
 * menyimpulkan hal yang keliru tentang datanya sendiri.
 */
const MESSAGES = {
  none: {
    title: "Belum ada group",
    body: "Buat group pertama untuk mulai menghimpun tautan dan berkas.",
  },
  filtered: {
    title: "Tidak ada group yang cocok",
    body: "Kosongkan kolom pencarian atau pilih Semua.",
  },
} as const;

export function GroupEmptyState({ reason }: { reason: "none" | "filtered" }) {
  const { title, body } = MESSAGES[reason];
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="text-base font-medium text-card-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
