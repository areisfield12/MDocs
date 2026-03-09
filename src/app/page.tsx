import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { ConnectButton } from "@/components/landing/ConnectButton";
import { LandingReveal } from "@/components/landing/LandingReveal";
import { Check } from "lucide-react";
import { ImageComparisonSlider } from "@/components/landing/ImageComparisonSlider";
import { ScrollSteps } from "@/components/landing/ScrollSteps";
import { LoomEmbed } from "@/components/landing/LoomEmbed";

// Screenshot shadow used across all product images
const SCREENSHOT_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.08), 0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(59,130,246,0.08)";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = !!session;

  return (
    // Force dark mode for the marketing page — product theme toggle is unaffected
    <main className="dark min-h-screen bg-bg-base relative">
      {/* Noise texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Section 1 — Navbar */}
      <div className="relative z-10">
        <LandingNav isSignedIn={isSignedIn} />
      </div>

      {/* Section 2 — Hero */}
      <section id="hero" className="relative py-20 z-10">
        {/* Radial orb — blue glow behind headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 900px 600px at 30% 40%, rgba(59,130,246,0.07), transparent)",
          }}
        />
        {/* Radial orb — warm purple near screenshot */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 600px 400px at 80% 50%, rgba(120,80,255,0.04), transparent)",
          }}
        />

        <div className="mx-auto px-6 relative" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Beta badge */}
              <LandingReveal delay={0}>
                <div className="inline-flex items-center mb-5">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 100,
                      padding: "4px 12px",
                      background: "rgba(255,255,255,0.04)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    ↗ Now in beta
                  </span>
                </div>
              </LandingReveal>

              {/* Headline */}
              <LandingReveal delay={50}>
                <h1
                  className="font-display font-bold text-text-primary text-4xl lg:text-5xl"
                  style={{ lineHeight: 1.15, letterSpacing: "-0.03em" }}
                >
                  An editor for websites that{" "}
                  <span className="gradient-text">live in code.</span>
                </h1>
              </LandingReveal>

              {/* Subheadline */}
              <LandingReveal delay={100}>
                <p
                  className="text-lg text-text-secondary mt-5"
                  style={{ maxWidth: 480, lineHeight: 1.6 }}
                >
                  Commit makes content teams feel like they&apos;re editing your
                  website through a CMS, even if your docs live in GitHub.
                </p>
              </LandingReveal>

              {/* CTA Button */}
              <LandingReveal delay={150}>
                <div className="mt-6">
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="btn-primary btn-cta-glow text-base font-medium"
                      style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
                    >
                      Go to dashboard &rarr;
                    </Link>
                  ) : (
                    <ConnectButton
                      className="btn-primary btn-cta-glow text-base font-medium"
                      style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
                    />
                  )}
                </div>
              </LandingReveal>

              {/* Below CTA — dot-separated micro-copy */}
              <LandingReveal delay={200}>
                <p
                  className="mt-4"
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-tertiary)",
                    letterSpacing: "0.01em",
                  }}
                >
                  Free to start &nbsp;·&nbsp; GitHub stays your source of truth
                </p>
              </LandingReveal>

              {/* Feature checkmarks — staggered reveal */}
              <div className="mt-6 flex flex-col gap-2 items-center lg:items-start">
                {[
                  "Edit any markdown file in seconds",
                  "No terminal, no cloning, no cryptic file paths",
                  "Every save commits directly to GitHub",
                ].map((feature, i) => (
                  <LandingReveal key={feature} delay={250 + i * 100}>
                    <div className="flex items-center gap-2">
                      <Check
                        size={15}
                        strokeWidth={2.5}
                        style={{ color: "var(--color-accent)", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--color-text-secondary)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {feature}
                      </span>
                    </div>
                  </LandingReveal>
                ))}
              </div>
            </div>

            {/* Right: Loom demo */}
            <LandingReveal className="flex-1 w-full" type="image" delay={100}>
              <LoomEmbed
                src="https://www.loom.com/embed/8c78baaeacd241bea7f8a4c3be7fc2c4?hideEmbedTopBar=true&hide_owner=true&hide_share=true&hide_title=true"
                boxShadow={SCREENSHOT_SHADOW}
              />
            </LandingReveal>
          </div>
        </div>
      </section>

      {/* Section 3 — Image comparison slider */}
      <section
        className="relative z-10"
        style={{ background: "#0f0f0f" }}
      >
        <div className="gradient-divider" />
        <div className="mx-auto px-6 py-20" style={{ maxWidth: 1100 }}>
          <div className="text-center mb-10">
            <LandingReveal>
              <p className="font-display font-bold text-text-primary text-2xl lg:text-3xl">
                Engineering moved your docs to the codebase, and{" "}
                <span className="gradient-text">
                  marketing lost their editor.
                </span>
              </p>
            </LandingReveal>
            <LandingReveal delay={100}>
              <p className="text-base text-text-secondary mt-3">
                Commit gives it back.
              </p>
            </LandingReveal>
          </div>

          <LandingReveal type="image">
            <ImageComparisonSlider
              leftImage="/comparison-github.png"
              leftLabel="Editing in GitHub"
              rightImage="/comparison-commit.png"
              rightLabel="Editing in Commit"
              topLeftLabel="Before: GitHub"
              topRightLabel="After: Commit"
              width={3456}
              height={1917}
            />
          </LandingReveal>
        </div>
      </section>

      {/* Section 4 — How It Works */}
      <section id="how-it-works" className="relative z-10">
        <div className="gradient-divider" />

        {/* Section header */}
        <div className="text-center pt-16 pb-2">
          <LandingReveal>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--color-accent)",
                marginBottom: 12,
              }}
            >
              How it works
            </p>
          </LandingReveal>
          <LandingReveal delay={80}>
            <h2 className="font-display font-bold text-text-primary text-3xl lg:text-4xl">
              Up and running in minutes.
            </h2>
          </LandingReveal>
        </div>
        <ScrollSteps />
      </section>

      {/* Section 5 — CTA */}
      <section className="relative z-10 overflow-hidden">
        <div className="gradient-divider" />

        {/* Upward blue glow — sits at bottom of section, radiates up */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 700px 400px at 50% 120%, rgba(59,130,246,0.15), transparent)",
          }}
        />

        <div
          className="mx-auto px-6 py-20 flex flex-col items-center text-center gap-8 relative"
          style={{ maxWidth: 1100 }}
        >
          <LandingReveal>
            <h2
              className="font-display font-bold text-text-primary"
              style={{
                fontSize: "clamp(40px, 5vw, 56px)",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              Give your team the{" "}
              <span className="gradient-text">edit button</span>
              <br />
              GitHub never built.
            </h2>
          </LandingReveal>

          <LandingReveal delay={100}>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary btn-cta-glow text-base font-medium"
                style={{ height: 48, paddingLeft: 32, paddingRight: 32 }}
              >
                Go to dashboard &rarr;
              </Link>
            ) : (
              <ConnectButton
                className="btn-primary btn-cta-glow text-base font-medium"
                style={{ height: 48, paddingLeft: 32, paddingRight: 32 }}
                label="Connect your repo →"
              />
            )}
          </LandingReveal>
        </div>
      </section>

      {/* Section 6 — Footer */}
      <footer className="relative z-10">
        <div className="gradient-divider" />
        <div className="flex items-center justify-between px-8 py-8 text-sm text-text-tertiary">
          <span>&copy; 2026 Commit</span>
          <span>Built for GitHub · Not affiliated with GitHub, Inc.</span>
        </div>
      </footer>
    </main>
  );
}
