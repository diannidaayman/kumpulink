/**
 * Slug tampil SEKALI dalam mono di bawah judul. Itu benda yang barusan
 * dipindai pengunjung, dan menampilkannya menjawab "saya tidak salah
 * alamat" tanpa satu kalimat pun.
 */
export function GroupHeader({
  title,
  slug,
  description,
  summary,
}: {
  title: string;
  slug: string;
  description: string | null;
  summary: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">/g/{slug}</p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{summary}</p>
      {description !== null && <p className="mt-3 text-sm">{description}</p>}
    </header>
  );
}
