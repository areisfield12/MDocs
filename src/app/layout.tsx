import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "./providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#f9fafb" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#f9fafb" },
                duration: 6000,
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
