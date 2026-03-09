"use client";

import { useEffect, useRef } from "react";

interface LandingRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  type?: "default" | "image";
}

export function LandingReveal({
  children,
  className = "",
  delay = 0,
  type = "default",
}: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            el.classList.add("revealed");
          }, delay);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const baseClass = type === "image" ? "landing-reveal-img" : "landing-reveal";
  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}
