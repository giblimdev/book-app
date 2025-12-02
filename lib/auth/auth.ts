// @/lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  appName: "Plateforme Intellectuelle",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    cookieCache: {
      enabled: false,
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24,
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },

  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },

  cookies: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    prefix: "auth",
  },

  trustedOrigins: [
    process.env.NODE_ENV === "production"
      ? "https://fm-online-ten.vercel.app"
      : "http://localhost:3000",
  ],

  // ✅ Configuration corrigée - IMPORTANT
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(), // ← Correction ici
    },
    crossSubDomainCookies: {
      enabled: false,
      domain: process.env.COOKIE_DOMAIN,
    },
  },

  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    emailVerification: "/auth/verify-email",
    error: "/auth/error",
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  plugins: [nextCookies()],

  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://fm-online-ten.vercel.app"
      : "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
