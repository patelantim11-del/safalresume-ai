import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    // Only use Google OAuth provider for authentication
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
