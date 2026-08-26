"use client";

import { useState } from "react";

import { ItemExternalForm } from "@/components/dashboard/item-external-form";
import { ItemUploadForm } from "@/components/dashboard/item-upload-form";
import { cn } from "@/lib/utils";

type Source = "EXTERNAL" | "UPLOAD";

const TABS: { value: Source; label: string }[] = [
  { value: "EXTERNAL", label: "Tempel URL" },
  { value: "UPLOAD", label: "Unggah berkas" },
];

export function ItemAddPanel({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const [source, setSource] = useState<Source>("EXTERNAL");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Dua tombol biasa berlabel, bukan pola tab ARIA: tab menuntut
          tabpanel, aria-controls, dan roving tabindex dengan panah kiri-
          kanan, dan setengah dari itu terasa lebih menyesatkan bagi
          pembaca layar daripada tidak ada sama sekali. */}
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSource(tab.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm",
              source === tab.value
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {source === "EXTERNAL" ? (
        <ItemExternalForm groupId={groupId} onDone={onDone} />
      ) : (
        <ItemUploadForm groupId={groupId} onDone={onDone} />
      )}
    </div>
  );
}
