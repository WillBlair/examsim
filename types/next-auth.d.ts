import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasOnboarded?: boolean;
      username?: string;
    } & DefaultSession["user"];
  }
}

