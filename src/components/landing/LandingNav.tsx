"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/Logo";

interface LandingNavProps {
  isSignedIn: boolean;
}

export function LandingNav({ isSignedIn }: LandingNavProps) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-8 py-5"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(8, 8, 8, 0.8)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <Logo variant="lockup" size={42} theme="dark" />
      {isSignedIn ? (
        <Link
          href="/dashboard"
          className="btn-ghost"
          style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
        >
          Go to dashboard &rarr;
        </Link>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="btn-ghost"
          style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
        >
          Sign in with GitHub
        </button>
      )}
    </nav>
  );
}
