import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// This file is used by Middleware (Edge compatible)
export const authConfig = {
  providers: [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
        async authorize(credentials) {
            // This is a placeholder. The actual logic is in auth.ts
            // which is not imported by middleware.
            return null; 
        }
    })
  ], 
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
