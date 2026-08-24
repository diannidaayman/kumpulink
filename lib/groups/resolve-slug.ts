import { randomSlug } from "@/lib/groups/random-slug";
import { MAX_SLUG_LENGTH, slugify } from "@/lib/groups/slugify";

export const MIN_SLUG_LENGTH = 3;
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MAX_SUFFIX = 50;
const SHORT_SLUG_SUFFIX_LENGTH = 4;

export type ResolveSlugInput = {
  title: string;
  requestedSlug: string;
  takenSlugs: readonly string[];
  currentSlug?: string | null;
};

export type SlugResolution =
  | { status: "ok"; slug: string }
  | { status: "conflict"; requested: string; suggestion: string };

/** Memangkas pangkal supaya pangkal + akhiran tetap muat MAX_SLUG_LENGTH. */
function withSuffix(base: string, suffix: string): string {
  const room = MAX_SLUG_LENGTH - suffix.length - 1;
  return `${base.slice(0, room).replace(/-+$/, "")}-${suffix}`;
}

function firstFreeSuffixed(base: string, taken: ReadonlySet<string>): string | null {
  for (let n = 2; n <= MAX_SUFFIX; n += 1) {
    const candidate = withSuffix(base, String(n));
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Memutuskan slug akhir sebuah group.
 *
 * Bentuk dan panjang slug TIDAK divalidasi di sini — itu tugas skema Zod
 * di lib/validation/group.ts. Fungsi ini hanya mengurus ketersediaan.
 *
 * Pembangkit acak diterima sebagai argumen supaya seluruh matriks di
 * bawah dapat diuji tanpa keacakan.
 */
export function resolveSlug(
  input: ResolveSlugInput,
  generateRandom: () => string = randomSlug,
): SlugResolution {
  const taken = new Set(input.takenSlugs);
  if (input.currentSlug) taken.delete(input.currentSlug);

  const derived = slugify(input.title);
  const isDerived = input.requestedSlug === derived;

  if (!isDerived) {
    if (!taken.has(input.requestedSlug)) {
      return { status: "ok", slug: input.requestedSlug };
    }
    const suggestion =
      firstFreeSuffixed(input.requestedSlug, taken) ?? generateRandom();
    return { status: "conflict", requested: input.requestedSlug, suggestion };
  }

  // isDerived hanyalah heuristik: ia membandingkan requestedSlug dengan
  // slugify(title), dan tidak bisa membedakan slug yang diisi otomatis oleh
  // form dari slug yang kebetulan sama tapi diketik sendiri oleh pemilik.
  // Pada mode ubah, field slug TIDAK PERNAH diisi otomatis (slugTouched
  // mulai dari true) — jadi slug yang datang bersama currentSlug pasti
  // ketikan tangan, sama seperti kasus !isDerived di atas. Karena itu,
  // bentroknya ditolak dengan usulan, bukan diberi akhiran diam-diam:
  // slug lama itu mungkin sudah beredar, dan mengubahnya tanpa sepengetahuan
  // pemilik bisa mematahkan tautan yang sudah dibagikan.
  if (input.currentSlug && taken.has(derived)) {
    const suggestion =
      firstFreeSuffixed(derived, taken) ?? generateRandom();
    return { status: "conflict", requested: derived, suggestion };
  }

  // Judul yang tidak menyisakan huruf atau angka sama sekali.
  if (derived.length === 0) {
    let candidate = generateRandom();
    while (taken.has(candidate)) candidate = generateRandom();
    return { status: "ok", slug: candidate };
  }

  // Judul sah tetapi terlalu pendek — "AI", "HR". Diperpanjang, bukan
  // ditolak: yang salah bukan judulnya.
  const base =
    derived.length < MIN_SLUG_LENGTH
      ? `${derived}-${generateRandom().slice(0, SHORT_SLUG_SUFFIX_LENGTH)}`
      : derived;

  if (!taken.has(base)) return { status: "ok", slug: base };

  const suffixed = firstFreeSuffixed(base, taken);
  if (suffixed) return { status: "ok", slug: suffixed };

  let candidate = generateRandom();
  while (taken.has(candidate)) candidate = generateRandom();
  return { status: "ok", slug: candidate };
}
