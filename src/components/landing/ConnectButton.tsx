"use client";

import { signIn } from "next-auth/react";

interface ConnectButtonProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export function ConnectButton({ className, style, label }: ConnectButtonProps) {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: `${window.location.origin}/dashboard` })}
      className={className}
      style={style}
    >
      {label ?? <>Connect your GitHub repo &rarr;</>}
    </button>
  );
}
