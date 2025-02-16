import { userApi } from "@/entities/user/api/user.api";
import { Session, SessionStrategy } from "next-auth";
import { JWT } from "next-auth/jwt";

// import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID ?? "",
    //   clientSecret: process.env.GOOGLE_SECRET ?? "",
    // }),
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
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.userId;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },

  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
