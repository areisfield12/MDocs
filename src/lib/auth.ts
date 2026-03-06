import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
      authorization: {
        params: {
          // Read user identity; write scopes come from GitHub App installation
          scope: "read:user user:email",
        },
      },
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id,
          githubLogin: profile.login,
          avatarUrl: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.githubLogin = (user as any).githubLogin ?? null;
        token.githubId = (user as any).githubId ?? null;
        token.avatarUrl = (user as any).avatarUrl ?? null;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        githubLogin: token.githubLogin as string | null,
        githubId: token.githubId as number | null,
        avatarUrl: token.avatarUrl as string | null,
      },
    }),
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
};
