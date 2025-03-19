import { userApi } from "@/entities/user/api/user.api";
import {
  AuthOptions,
  Session,
  SessionStrategy,
  DefaultUser,
  DefaultSession,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

declare module "next-auth" {
  interface User extends DefaultUser {
    accessToken?: string;
  }
  interface Session {
    user?: {
      id?: string;
      email?: string | null;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(process.env.NEXTAUTH_URL);
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token) return session;

      try {
        if (token.accessToken) {
          await userApi.checkAuth(token.accessToken);

          return {
            ...session,
            user: {
              id: token.sub,
              email: token.email,
              accessToken: token.accessToken,
            },
          } as Session;
        }
        return session;
      } catch {
        return session;
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
