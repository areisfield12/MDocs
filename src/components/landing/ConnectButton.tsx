"use client";

import { signIn } from "next-auth/react";

interface ConnectButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ConnectButton({ className, style }: ConnectButtonProps) {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: `${window.location.origin}/dashboard` })}
      className={className}
      style={style}
    >
      Connect your GitHub repo &rarr;
    </button>
  );
}
