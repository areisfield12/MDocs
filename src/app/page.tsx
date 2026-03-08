import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { ConnectButton } from "@/components/landing/ConnectButton";
import { Check } from "lucide-react";
import { ImageComparisonSlider } from "@/components/landing/ImageComparisonSlider";
import { ScrollSteps } from "@/components/landing/ScrollSteps";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = !!session;

  return (
    <main className="min-h-screen bg-bg-base">
      {/* Section 1 — Navbar */}
      <LandingNav isSignedIn={isSignedIn} />

      {/* Section 2 — Hero */}
      <section id="hero" className="py-20 lg:py-24">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Headline */}
              <h1
                className="font-display font-bold text-text-primary text-4xl lg:text-5xl"
                style={{ lineHeight: 1.15 }}
              >
                An editor for websites that live in code.
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg text-text-secondary mt-5"
                style={{ maxWidth: 480, lineHeight: 1.6 }}
              >
                Commit makes content teams feel like they're editing your website through a CMS, even if your docs live in GitHub.
              </p>

              {/* CTA Button */}
              <div className="mt-6">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="btn-primary text-base font-medium"
                    style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
                  >
                    Go to dashboard &rarr;
                  </Link>
                ) : (
                  <ConnectButton
                    className="btn-primary text-base font-medium"
                    style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
                  />
                )}
              </div>

              {/* Below CTA */}
              <p className="text-sm text-text-tertiary mt-4">
                Free to start · Maintains GitHub as your source-of-truth
              </p>

              {/* Feature checkmarks */}
              <div className="mt-6 flex flex-col gap-2 items-center lg:items-start">
                {[
                  "Edit any markdown file in seconds",
                  "No terminal, no cloning, no cryptic file paths",
                  "Every save commits directly to GitHub",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check size={15} strokeWidth={2.5} className="text-success shrink-0" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Loom demo */}
            <div className="flex-1 w-full lg:max-w-[520px]">
              <div
                className="relative w-full rounded-xl overflow-hidden border border-border-default"
                style={{
                  aspectRatio: "16/9",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                }}
              >
                <iframe
                  src="https://www.loom.com/embed/b654d8c2624941c1abdbf56dafce9844"
                  frameBorder="0"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="Commit product demo"
                />
              </div>
              <p className="text-center text-xs text-text-tertiary mt-3">
                See how it works — 2 min demo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Image comparison slider */}
      <section className="py-16 border-t border-border-subtle">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div className="text-center mb-10">
            <p className="font-display font-bold text-text-primary text-2xl lg:text-3xl">
              Engineering moved your docs to the codebase, and marketing lost their editor.
            </p>
            <p className="text-base text-text-secondary mt-3">
              Commit gives it back.
            </p>
          </div>
          <ImageComparisonSlider
            leftImage="/comparison-github.png"
            leftLabel="Editing in GitHub"
            rightImage="/comparison-commit.png"
            rightLabel="Editing in Commit"
            width={3456}
            height={1917}
          />
        </div>
      </section>

      {/* Section 4 — How It Works */}
      <section id="how-it-works" className="border-t border-border-subtle">
        {/* Section header */}
        <div className="text-center pt-24 pb-6">
          <p
            className="text-xs font-medium uppercase text-text-tertiary mb-3"
            style={{ letterSpacing: "0.1em" }}
          >
            How it works
          </p>
          <h2 className="font-display font-bold text-text-primary text-3xl lg:text-4xl">
            Up and running in minutes.
          </h2>
        </div>
        <ScrollSteps />
      </section>

      {/* Section 5 — CTA */}
      <section className="py-20 border-t border-border-subtle">
        <div
          className="mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8"
          style={{ maxWidth: 1100 }}
        >
          <h2
            className="font-display font-bold text-text-primary text-2xl lg:text-3xl"
            style={{ lineHeight: 1.3, maxWidth: 520 }}
          >
            Give your team the edit button GitHub never built.
          </h2>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="btn-primary text-base font-medium shrink-0"
              style={{ height: 48, paddingLeft: 28, paddingRight: 28 }}
            >
              Go to dashboard &rarr;
            </Link>
          ) : (
            <ConnectButton
              className="btn-primary text-base font-medium shrink-0"
              style={{ height: 48, paddingLeft: 28, paddingRight: 28 }}
              label="Connect your repo →"
            />
          )}
        </div>
      </section>

      {/* Section 6 — Footer */}
      <footer className="flex items-center justify-between px-8 py-8 text-sm text-text-tertiary border-t border-border-subtle">
        <span>&copy; 2026 Commit</span>
        <span>Built for GitHub · Not affiliated with GitHub, Inc.</span>
      </footer>
    </main>
  );
}
