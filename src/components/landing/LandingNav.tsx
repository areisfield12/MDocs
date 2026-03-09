"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/Logo";

interface LandingNavProps {
  isSignedIn: boolean;
}

export function LandingNav({ isSignedIn }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-8 py-5 ${
        scrolled
          ? "backdrop-blur-md border-b border-border-subtle"
          : "border-b border-transparent"
      }`}
      style={scrolled ? { backgroundColor: "color-mix(in srgb, var(--color-bg-base) 80%, transparent)" } : undefined}
    >
      <Logo variant="lockup" size={42} />
      {isSignedIn ? (
        <Link href="/dashboard" className="btn-secondary">
          Go to dashboard &rarr;
        </Link>
      ) : (
        <button onClick={() => signIn("github")} className="btn-secondary">
          Sign in with GitHub
        </button>
      )}
    </nav>
  );
}
