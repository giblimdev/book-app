// @/lib/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://fm-online-ten.vercel.app"
      : "http://localhost:3000",
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;
