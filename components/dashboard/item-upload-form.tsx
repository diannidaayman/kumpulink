"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ItemAccessModeField } from "@/components/dashboard/item-access-mode-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPT_ATTRIBUTE, MAX_UPLOAD_BYTES } from "@/lib/storage/limits";

/**
 * Satu-satunya formulir di CMS yang TIDAK memakai server action.
 * Unggahan berkas memakai route handler, dan itu ditetapkan
 * code-standards.md.
 *
 * Tidak ada pemilih tipe di sini. Untuk sumber UPLOAD, `type` diturunkan
 * dari isi berkas di server — sehingga tidak ada dua nilai yang dapat
 * saling menyimpang.
 */
export function ItemUploadForm({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const uid = useId();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    // Penolakan dini semata KENYAMANAN: ia menghemat pengiriman 20 MB
    // yang sudah pasti gagal. Penegakannya ada di server, dan tetap ada
    // di sana meski pemeriksaan ini dilewati sepenuhnya.
    if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
      setMessage("Ukuran berkas maksimal 4 MB.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/items`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const detail =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: { message?: unknown } }).error?.message === "string"
            ? (body as { error: { message: string } }).error.message
            : "Unggahan gagal. Coba lagi.";
        setMessage(detail);
        return;
      }

      formRef.current?.reset();
      // Route handler sudah memanggil revalidatePath, tetapi halaman ini
      // dicapai lewat fetch, bukan navigasi — jadi hasilnya perlu ditarik.
      router.refresh();
      onDone();
    } catch {
      setMessage("Unggahan gagal. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-title`}>
          Judul
        </label>
        <Input id={`${uid}-title`} name="title" autoFocus required />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-file`}>
          Berkas
        </label>
        <Input id={`${uid}-file`} name="file" type="file" accept={ACCEPT_ATTRIBUTE} required />
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, PNG, JPEG, atau WebP. Maksimal 4 MB.
        </p>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground" htmlFor={`${uid}-desc`}>
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <Textarea id={`${uid}-desc`} name="description" rows={2} />
      </div>

      <ItemAccessModeField id={`${uid}-mode`} />

      {message !== null && <p className="text-sm text-state-error">{message}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Mengunggah…" : "Unggah item"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
