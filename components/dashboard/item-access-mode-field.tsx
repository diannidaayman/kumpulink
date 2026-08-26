/**
 * APPROVAL TIDAK ADA di sini, dan itu hanya separuh penegakannya —
 * separuh lainnya ada di itemAccessModeSchema, yang menolaknya di batas
 * sistem. Menyembunyikan pilihan saja tidak dihitung sebagai kontrol
 * akses; fitur yang belum jadi tidak boleh berarti pintu yang terbuka.
 *
 * Saat Unit 7 membukanya, tambahkan opsinya di sini, tambahkan
 * "APPROVAL" di skema Zod, dan tambahkan peringatan untuk item bersumber
 * EXTERNAL — ketiganya dalam perubahan yang sama.
 */
export function ItemAccessModeField({
  id,
  defaultValue = "OPEN",
}: {
  id: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground" htmlFor={id}>
        Tingkat akses
      </label>
      <select
        id={id}
        name="accessMode"
        defaultValue={defaultValue}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm"
      >
        <option value="OPEN">Terbuka</option>
        <option value="IDENTITY">Perlu masuk</option>
      </select>
    </div>
  );
}
