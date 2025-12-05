import NextAuth, { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  username: string;
  hasOnboarded: boolean;
  grade: string;
  subjects: string[];
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

