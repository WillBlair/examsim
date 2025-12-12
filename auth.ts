import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true, // Required for OAuth to work correctly
  ...authConfig,
  providers: [
    Google({
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });
          
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Allow all sign-ins
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      if (token.hasOnboarded !== undefined) {
        (session.user as { hasOnboarded?: boolean }).hasOnboarded = token.hasOnboarded as boolean;
      }

      if (token.username) {
        (session.user as { username?: string }).username = token.username as string;
      }

      // Sync user data from token to session
      if (token.name) {
        session.user.name = token.name as string;
      }
      
      if (token.email) {
        session.user.email = token.email as string;
      }
      
      if (token.picture) {
        session.user.image = token.picture as string;
      }

      return session;
    },
    async jwt({ token, user, trigger }) {
      // On first sign in, user object is available
      if (user) {
        token.sub = user.id;
      }

      if (!token.sub) return token;

      // Fetch fresh user data (optimized query to avoid selecting huge image data)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, token.sub),
        columns: {
          id: true,
          name: true,
          email: true,
          username: true,
          hasOnboarded: true,
          image: true, // We check this but don't pass it if it's base64
          password: false, // Explicitly exclude password
        }
      });

      if (!existingUser) return token;

      // Update all user fields in the token
      token.hasOnboarded = existingUser.hasOnboarded;
      token.username = existingUser.username;
      token.name = existingUser.name;
      token.email = existingUser.email;
      
      // CRITICAL FIX: Do NOT put base64 images in the session cookie!
      if (existingUser.image && !existingUser.image.startsWith("data:image")) {
        token.picture = existingUser.image;
      } else if (existingUser.image && existingUser.image.startsWith("data:image")) {
         // If the DB has a Base64 image, we MUST NOT put it in the token.
         // If the token already had a picture (e.g. from Google), we keep it.
         // BUT if the token's picture IS the Base64 string (from a previous bad login), we must nuke it.
         if (token.picture?.startsWith("data:image")) {
            token.picture = null;
         }
      }

      return token;
    }
  }
});
