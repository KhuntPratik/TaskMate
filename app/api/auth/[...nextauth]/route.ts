import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // ================= GOOGLE DB LOGIN =================
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existingByEmail = await prisma.users.findUnique({
        where: { email },
      });
      if (existingByEmail) return true;

      const baseUsername =
        (user.name || email.split("@")[0] || "user")
          .trim()
          .replace(/\s+/g, "");

      let usernameCandidate = baseUsername;
      for (let i = 0; i < 5; i++) {
        const existingByUsername = await prisma.users.findUnique({
          where: { username: usernameCandidate },
        });
        if (!existingByUsername) break;
        usernameCandidate = `${baseUsername}${Math.floor(
          Math.random() * 10000
        )}`;
      }

      const randomPassword = crypto.randomBytes(16).toString("hex");
      const passwordhash = await bcrypt.hash(randomPassword, 10);

      await prisma.users.create({
        data: {
          username: usernameCandidate,
          email,
          passwordhash,
          roleid: 2,
        },
      });

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
