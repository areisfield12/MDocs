"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  variant?: "lockup" | "icon";
  theme?: "light" | "dark" | "auto";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({
  variant = "lockup",
  theme = "auto",
  size,
  className,
  style,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const effectiveTheme =
    theme === "auto" ? (mounted ? resolvedTheme : "light") : theme;
  const isDark = effectiveTheme === "dark";

  if (variant === "icon") {
    const iconSize = size ?? 32;

    if (isDark) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 200 200"
          aria-label="Commit"
          className={className}
          style={style}
        >
          <rect width="200" height="200" rx="44.0" fill="#1E1E30" />
          <circle
            cx="100.0"
            cy="100.0"
            r="59.00"
            fill="none"
            stroke="#4f7af8"
            strokeWidth="8.40"
          />
          <circle cx="100.0" cy="100.0" r="35.00" fill="#4f7af8" />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 200 200"
        aria-label="Commit"
        className={className}
        style={style}
      >
        <rect width="200" height="200" rx="44.0" fill="#FFFFFF" />
        <circle
          cx="100.0"
          cy="100.0"
          r="59.00"
          fill="none"
          stroke="#4f7af8"
          strokeWidth="8.40"
        />
        <circle cx="100.0" cy="100.0" r="35.00" fill="#4f7af8" />
      </svg>
    );
  }

  // Lockup variant — 352×72 viewBox, icon square is 72px tall
  const lockupHeight = size ?? 36;
  const lockupWidth = Math.round((352 / 72) * lockupHeight);

  if (isDark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={lockupWidth}
        height={lockupHeight}
        viewBox="0 0 352 72"
        aria-label="Commit"
        className={className}
        style={style}
      >
        <rect width="72" height="72" rx="15.8" fill="#1E1E30" />
        <circle
          cx="36.0"
          cy="36.0"
          r="21.24"
          fill="none"
          stroke="#4f7af8"
          strokeWidth="3.02"
        />
        <circle cx="36.0" cy="36.0" r="12.60" fill="#4f7af8" />
        <text
          x="92"
          y="52.9"
          fontFamily="'Instrument Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="600"
          fontSize="52"
          letterSpacing="-1.2"
          fill="#FFFFFF"
        >
          commit
        </text>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={lockupWidth}
      height={lockupHeight}
      viewBox="0 0 352 72"
      aria-label="Commit"
      className={className}
      style={style}
    >
      <rect width="72" height="72" rx="15.8" fill="#FFFFFF" />
      <circle
        cx="36.0"
        cy="36.0"
        r="21.24"
        fill="none"
        stroke="#4f7af8"
        strokeWidth="3.02"
      />
      <circle cx="36.0" cy="36.0" r="12.60" fill="#4f7af8" />
      <text
        x="92"
        y="52.9"
        fontFamily="'Instrument Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1.2"
        fill="#1A1A2E"
      >
        commit
      </text>
    </svg>
  );
}
