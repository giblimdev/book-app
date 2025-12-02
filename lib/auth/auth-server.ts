// lib/auth-server.ts
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session?.user || null;
}
