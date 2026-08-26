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
      <div role="tablist" aria-label="Sumber item" className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={source === tab.value}
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
