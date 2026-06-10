import { verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const client = await connectToDatabase();
          const db = client.db();
          const users = db.collection(USERS_COLLECTION);
          const user = await users.findOne({ email: credentials.email });
          if (!user) return null;
          const ok = await verifyPassword(
            credentials.password,
            user.passwordHash,
          );
          if (!ok) return null;
          return {
            id: user._id.toString(),
            name: user.fullName || "",
            email: user.email,
          };
        } catch (err) {
          console.error("Credentials authorize error:", err);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user?.email) return false;
        // Only upsert when an OAuth/account object is present (e.g. Google)
        if (!account) return true;
        const client = await connectToDatabase();
        const db = client.db();
        const users = db.collection(USERS_COLLECTION);
        const now = new Date().toISOString();

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              email: user.email,
              fullName: user.name || "",
              image: (user as any).image || null,
              provider: account.provider || "",
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          { upsert: true },
        );

        return true;
      } catch (err) {
        console.error("NextAuth signIn error:", err);
        return false;
      }
    },
    async session({ session }) {
      try {
        if (!session?.user?.email) return session;
        const client = await connectToDatabase();
        const db = client.db();
        const u = await db.collection(USERS_COLLECTION).findOne({
          email: session.user.email,
        });
        if (u) {
          // attach id and other fields to session.user
          // @ts-ignore
          session.user.id = u._id.toString();
          // @ts-ignore
          session.user.subscription = u.subscription || "free";
        }
      } catch (err) {
        console.error("NextAuth session callback error:", err);
      }

      return session;
    },
  },
};
