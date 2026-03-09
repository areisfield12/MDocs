"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageComparisonSliderProps {
  leftImage: string;
  rightImage: string;
  leftLabel?: string;
  rightLabel?: string;
  topLeftLabel?: string;
  topRightLabel?: string;
  defaultPosition?: number;
  width: number;
  height: number;
}

export function ImageComparisonSlider({
  leftImage,
  rightImage,
  leftLabel,
  rightLabel,
  topLeftLabel,
  topRightLabel,
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
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.08), 0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(59,130,246,0.08)",
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

      {/* Drag handle — glowing pill */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
        style={{
          left: `${position}%`,
          background: "white",
          borderRadius: "100px",
          padding: "6px 12px",
          boxShadow: "0 0 20px rgba(255,255,255,0.3), 0 2px 12px rgba(0,0,0,0.3)",
          pointerEvents: "none",
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

      {/* Top left label — "Before: GitHub" */}
      {topLeftLabel && (
        <div
          className="absolute top-4 left-4 pointer-events-none"
          style={{
            opacity: leftLabelOpacity,
            transition: "opacity 0.1s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              borderRadius: 4,
              padding: "4px 8px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {topLeftLabel}
          </span>
        </div>
      )}

      {/* Top right label — "After: Commit" */}
      {topRightLabel && (
        <div
          className="absolute top-4 right-4 pointer-events-none"
          style={{
            opacity: rightLabelOpacity,
            transition: "opacity 0.1s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              borderRadius: 4,
              padding: "4px 8px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {topRightLabel}
          </span>
        </div>
      )}

      {/* Bottom left label — pill badge */}
      {leftLabel && (
        <div
          className="absolute bottom-4 left-4 pointer-events-none"
          style={{
            opacity: leftLabelOpacity,
            transition: "opacity 0.1s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              borderRadius: 100,
              padding: "4px 10px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {leftLabel}
          </span>
        </div>
      )}

      {/* Bottom right label — pill badge */}
      {rightLabel && (
        <div
          className="absolute bottom-4 right-4 pointer-events-none"
          style={{
            opacity: rightLabelOpacity,
            transition: "opacity 0.1s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              borderRadius: 100,
              padding: "4px 10px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {rightLabel}
          </span>
        </div>
      )}
    </div>
  );
}
