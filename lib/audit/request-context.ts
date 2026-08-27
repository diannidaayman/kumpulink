import "server-only";

import { headers } from "next/headers";

import { firstForwardedIp } from "@/lib/audit/forwarded-ip";

export type RequestContext = {
  ipAddress: string | null;
  userAgent: string | null;
};

export async function readRequestContext(): Promise<RequestContext> {
  const headerList = await headers();
  return {
    ipAddress: firstForwardedIp(headerList.get("x-forwarded-for")),
    userAgent: headerList.get("user-agent"),
  };
}
