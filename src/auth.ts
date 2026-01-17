import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Query user from database
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
