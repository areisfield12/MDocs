"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageComparisonSliderProps {
  leftImage: string;
  rightImage: string;
  leftLabel?: string;
  rightLabel?: string;
  defaultPosition?: number;
  width: number;
  height: number;
}

export function ImageComparisonSlider({
  leftImage,
  rightImage,
  leftLabel,
  rightLabel,
  defaultPosition = 50,
  width,
  height,
}: ImageComparisonSliderProps) {
  const [position, setPosition] = useState(defaultPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(clamped);
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  const leftLabelOpacity = Math.max(0, Math.min(1, (position - 5) / 20));
  const rightLabelOpacity = Math.max(0, Math.min(1, (95 - position) / 20));

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-border-default select-none"
      style={{
        aspectRatio: `${width} / ${height}`,
        cursor: "col-resize",
        boxShadow: "0 12px 48px rgba(0,0,0,0.20)",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Left image (GitHub) — always fully visible behind */}
      <Image
        src={leftImage}
        alt={leftLabel ?? "Before"}
        fill
        className="object-cover object-left-top pointer-events-none"
        draggable={false}
        priority
      />

      {/* Right image (Commit) — clipped to show only right portion */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <Image
          src={rightImage}
          alt={rightLabel ?? "After"}
          fill
          className="object-cover object-left-top pointer-events-none"
          draggable={false}
          priority
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white"
        style={{
          left: `${position}%`,
          boxShadow: "0 0 8px rgba(0,0,0,0.4)",
        }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-white shadow-lg"
        style={{
          left: `${position}%`,
          width: 36,
          height: 36,
          boxShadow: "0 2px 12px rgba(0,0,0,0.30)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 4L1 8L5 12M11 4L15 8L11 12"
            stroke="#555"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Left label */}
      {leftLabel && (
        <div
          className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md text-xs font-medium text-white"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            opacity: leftLabelOpacity,
            transition: "opacity 0.1s",
            pointerEvents: "none",
          }}
        >
          {leftLabel}
        </div>
      )}

      {/* Right label */}
      {rightLabel && (
        <div
          className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md text-xs font-medium text-white"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            opacity: rightLabelOpacity,
            transition: "opacity 0.1s",
            pointerEvents: "none",
          }}
        >
          {rightLabel}
        </div>
      )}
    </div>
  );
}
