"use client";

import { useState } from "react";

import type { GroupSegment } from "@/components/dashboard/group-filter-bar";
import { resolveGroupStatus } from "@/lib/groups/status";
import type { GroupListItem } from "@/lib/types/group";

export function useGroupFilter(groups: GroupListItem[], now: Date) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<GroupSegment>("active");

  const filtering = query.trim() !== "" || segment !== "all";
  const visible = groups.filter((group) => {
    const status = resolveGroupStatus(group, now);
    const inactive = status === "UNSHARED" || status === "EXPIRED";
    if (segment === "active" && inactive) return false;
    if (segment === "inactive" && !inactive) return false;
    return group.title.toLowerCase().includes(query.trim().toLowerCase());
  });

  return { query, setQuery, segment, setSegment, filtering, visible };
}
