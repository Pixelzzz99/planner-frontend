import { userApi } from "@/entities/user/api/user.api";
import { Session, SessionStrategy } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    accessToken: string;
  };
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const res = await userApi.login({
          email: credentials.email,
          password: credentials.password,
        });

        const meData = await userApi.checkAuth(res.accessToken);
        if (!meData?.id) {
          return null;
        }

        if (res) {
          return {
            id: meData.id,
            email: meData.email,
            accessToken: res.accessToken,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any; trigger?: string }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (!token) return null;

      try {
        if (token.accessToken) {
          await userApi.checkAuth(token.accessToken);

          return {
            ...session,
            user: {
              id: token.userId,
              email: token.email,
              accessToken: token.accessToken,
            },
          } as CustomSession;
        }
        return null;
      } catch {
        return null;
      }
    },
  },
  events: {
    async signOut({}: { token: JWT }) {
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Error during signout:", error);
      }
    },
  },
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};
