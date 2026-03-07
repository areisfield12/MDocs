import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "./providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "MDocs — Collaborative Markdown for GitHub Teams",
  description:
    "Edit markdown files that live in GitHub with a Google Docs experience — WYSIWYG editing, PR workflows, and AI-assisted authoring.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.className} ${dmSans.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--color-bg-emphasis)",
                color: "var(--color-text-primary)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                border: "1px solid var(--color-border-default)",
              },
              success: {
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-text-primary)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--color-error)",
                  secondary: "var(--color-text-primary)",
                },
                duration: 6000,
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
