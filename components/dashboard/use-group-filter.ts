"use client";

import { useState } from "react";

import { filterGroups } from "@/lib/groups/filter";
import type { GroupListItem, GroupSegment } from "@/lib/types/group";

export function useGroupFilter(groups: GroupListItem[], now: Date) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<GroupSegment>("active");

  const filtering = query.trim() !== "" || segment !== "all";
  const visible = filterGroups(groups, { query, segment }, now);

  return { query, setQuery, segment, setSegment, filtering, visible };
}
