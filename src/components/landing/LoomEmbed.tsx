"use client";

import { useState, useEffect } from "react";

interface LoomEmbedProps {
  src: string;
  boxShadow: string;
}

export function LoomEmbed({ src, boxShadow }: LoomEmbedProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playing) return;
    const handleBlur = () => setPlaying(true);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [playing]);

  return (
    <div
      className={`${playing ? "" : "animate-float"} relative w-full rounded-xl overflow-hidden border border-border-default`}
      style={{
        aspectRatio: "16/9",
        boxShadow,
        maskImage: "linear-gradient(to bottom, black 80%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent)",
      }}
    >
      <iframe
        src={src}
        frameBorder="0"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        title="Commit product demo"
      />
    </div>
  );
}
