"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const steps = [
  {
    heading: "Connect your repo",
    body: "Point Commit at any GitHub repository. Your file structure appears instantly — no configuration, no migration.",
    image: "/how-it-works-1-v2.png",
    width: 3456,
    height: 1914,
  },
  {
    heading: "Open any file and start editing",
    body: "Your team sees a clean, familiar editor. No markdown syntax, no terminal commands. Just the content, exactly as it should look.",
    image: "/how-it-works-2-v2.png",
    width: 3456,
    height: 1916,
  },
  {
    heading: "Save and propose changes",
    body: "Every edit becomes a commit. Every submission becomes a pull request. Your engineers stay in control — your team just never has to think about any of that.",
    image: "/how-it-works-3-v2.png",
    width: 3456,
    height: 1916,
  },
];

export function ScrollSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrolled = -el.getBoundingClientRect().top;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(0.9999, scrolled / total));
      setActiveStep(Math.floor(progress * steps.length));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef} style={{ height: `${steps.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div
          className="mx-auto px-6 w-full flex items-center gap-12 lg:gap-20"
          style={{ maxWidth: 1200 }}
        >
          {/* Left: image stack — larger, ~60% */}
          <div className="flex-[3] min-w-0">
            <div
              className="relative rounded-xl overflow-hidden border border-border-default"
              style={{
                aspectRatio: "3456/1916",
                boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
              }}
            >
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    opacity: i === activeStep ? 1 : 0,
                    transform: `translateX(${
                      i === activeStep ? 0 : i < activeStep ? -32 : 32
                    }px)`,
                    transition:
                      "opacity 0.5s ease, transform 0.5s ease",
                    pointerEvents: i === activeStep ? "auto" : "none",
                  }}
                >
                  <Image
                    src={step.image}
                    alt={step.heading}
                    fill
                    className="object-cover object-left-top"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: copy stack — ~40% */}
          <div className="flex-[2] min-w-0 max-w-[400px]">
            {/* Step dots */}
            <div className="flex items-center gap-3 mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeStep ? 24 : 8,
                    height: 8,
                    background:
                      i === activeStep
                        ? "var(--color-accent)"
                        : "var(--color-border-default)",
                  }}
                />
              ))}
            </div>

            {/* Step copy — stacked, only active visible */}
            <div className="relative" style={{ minHeight: 200 }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    opacity: i === activeStep ? 1 : 0,
                    transform: `translateY(${
                      i === activeStep ? 0 : i < activeStep ? -20 : 20
                    }px)`,
                    transition:
                      "opacity 0.45s ease, transform 0.45s ease",
                    pointerEvents: i === activeStep ? "auto" : "none",
                  }}
                >
                  <p
                    className="text-xs font-medium uppercase text-text-tertiary mb-3"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    Step {i + 1}
                  </p>
                  <h3 className="font-display font-bold text-text-primary text-2xl lg:text-3xl mb-4">
                    {step.heading}
                  </h3>
                  <p
                    className="text-base text-text-secondary"
                    style={{ lineHeight: 1.7 }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
