# MDocs Design System

Aesthetic target: **Linear.app** — dark, precise, minimal, confident.

**Do not use:** purple gradients, glassmorphism, generic SaaS aesthetics, Inter, Roboto, rounded-2xl, excessive border radius, decorative drop shadows.

---

## Architecture

| File | Purpose |
|---|---|
| `src/styles/tokens.css` | All design tokens as CSS custom properties |
| `src/styles/components.css` | Reusable component classes (`.btn-primary`, `.card`, etc.) |
| `src/app/globals.css` | Tailwind imports, `@theme` mappings, base styles, TipTap styles |
| `src/app/layout.tsx` | Font loading (Geist Sans, DM Sans, Geist Mono via `next/font`) |

Tailwind v4 uses CSS-based configuration via `@theme` in `globals.css` — there is no `tailwind.config.ts` file. All Tailwind utility classes reference the tokens defined in `tokens.css`.

---

## Fonts

| Role | Font | CSS Variable | Usage |
|---|---|---|---|
| Display | Geist Sans | `var(--font-display)` | Headlines H1–H3, MDocs wordmark |
| UI | DM Sans | `var(--font-ui)` | Body text, labels, buttons, navigation, all UI chrome |
| Mono | Geist Mono | `var(--font-mono)` | File paths, code blocks, commit SHAs, branch names |

Fonts are loaded via `next/font` in `layout.tsx` and injected as CSS variables (`--font-geist-sans`, `--font-dm-sans`, `--font-geist-mono`). The tokens in `tokens.css` alias these to semantic names (`--font-display`, `--font-ui`, `--font-mono`).

**Weights in use:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold). No 300 or 800.

---

## Type Scale

All sizes use `font-size` / `line-height` / `letter-spacing` together. In Tailwind, use `text-sm`, `text-base`, etc. — they are mapped to include line-height and tracking.

| Token | Size | Line height | Tracking |
|---|---|---|---|
| `--text-xs` | 11px | 1.5 | 0.02em |
| `--text-sm` | 13px | 1.5 | 0.01em |
| `--text-base` | 15px | 1.6 | 0 |
| `--text-lg` | 17px | 1.5 | -0.01em |
| `--text-xl` | 20px | 1.4 | -0.02em |
| `--text-2xl` | 26px | 1.3 | -0.03em |
| `--text-3xl` | 34px | 1.2 | -0.04em |
| `--text-4xl` | 46px | 1.1 | -0.05em |
| `--text-5xl` | 62px | 1.0 | -0.05em |

Larger sizes use negative tracking (tighter). Smaller sizes use positive tracking (looser). This creates the characteristic Linear "tight headline, readable body" feel.

---

## Color System

Supports light and dark mode. Dark mode is the default (set by `next-themes` with `defaultTheme="dark"`). Toggle via the sun/moon icon in the header. Light tokens live in `:root`, dark tokens override in `.dark`. The `@custom-variant dark` directive enables Tailwind's `dark:` prefix for the few places that need it.

### Backgrounds (layered depth)

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-base` | `#080809` | Page background |
| `--color-bg-subtle` | `#0e0e10` | Cards, sidebars |
| `--color-bg-muted` | `#141416` | Hover states, input backgrounds |
| `--color-bg-emphasis` | `#1c1c1f` | Active states, selected items |
| `--color-bg-overlay` | `#232326` | Modals, dropdowns |

### Borders

| Token | Hex | Usage |
|---|---|---|
| `--color-border-subtle` | `#1f1f23` | Hairline dividers |
| `--color-border-default` | `#2a2a2f` | Card borders, input borders |
| `--color-border-strong` | `#3a3a42` | Focused inputs, active borders |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#f0f0f2` | Headings, primary content |
| `--color-text-secondary` | `#8b8b96` | Labels, metadata |
| `--color-text-tertiary` | `#52525c` | Placeholders, disabled |
| `--color-text-inverse` | `#080809` | Text on light backgrounds |

### Accent (single blue)

| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#4f7af8` | Primary CTA, links, active indicators |
| `--color-accent-hover` | `#6b91fa` | Hover state |
| `--color-accent-subtle` | `#1a2754` | Accent backgrounds (badges) |
| `--color-accent-border` | `#2d4a9e` | Accent borders |

### Semantic

| Token | Hex |
|---|---|
| `--color-success` / `--color-success-subtle` | `#3dd68c` / `#0d2e1f` |
| `--color-warning` / `--color-warning-subtle` | `#f0b429` / `#2e2008` |
| `--color-error` / `--color-error-subtle` | `#f26c6c` / `#2e1010` |

---

## Spacing

4px base unit. All spacing values are multiples of 4. Use `--space-{n}` tokens or Tailwind `p-{n}`, `m-{n}`, `gap-{n}`.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |
| `--space-24` | 96px |
| `--space-32` | 128px |

No arbitrary Tailwind values like `p-[13px]`.

---

## Border Radius

Subtle radius — almost sharp but not quite. Do not use `rounded-xl` (12px) or larger.

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 3px | Inputs, small badges |
| `--radius-md` | 6px | Buttons, cards, dropdowns |
| `--radius-lg` | 10px | Modals, larger cards |
| `--radius-full` | 9999px | Pills, avatars, toggles |

---

## Shadows

Elevation only, no decoration. No colored shadows. No glow effects.

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)` | Dropdowns |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)` | Modals |

---

## Transitions

Subtle, fast, smooth — nothing jarring or bouncy. CSS only, never JavaScript for hover effects.

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | 100ms | Hover/active state transitions |
| `--duration-default` | 150ms | General transitions (max for color transitions) |
| `--easing-default` | `cubic-bezier(0.16, 1, 0.3, 1)` | All interactive transitions |

Global rules in `globals.css` apply `cursor: pointer` and base transitions to all `button`, `a`, `[role="button"]`, `[role="tab"]`, and `[role="menuitem"]` elements. Custom interactive components (`div`/`span` with `onClick`) must add `cursor-pointer` via Tailwind.

---

## Hover & Active States

All hover states use `--duration-fast` and `--easing-default`. Do not add `transform: scale()` hover effects (except `.btn-primary:active` at `scale(0.99)`). Do not add `box-shadow` on hover.

### By component type

| Element | Hover | Active/Selected |
|---|---|---|
| **Sidebar nav items** | `hover:bg-bg-muted hover:text-text-primary` | `bg-bg-emphasis text-text-primary` |
| **Sidebar repo rows** | `hover:bg-bg-muted` | `bg-bg-emphasis` + left accent border |
| **Miller column rows** | `hover:bg-bg-muted` | `bg-accent text-text-inverse` (white text) |
| **File list rows** | `hover:bg-bg-muted` | — |
| **Repo cards** | `hover:bg-bg-muted` | — |
| **Icon buttons** | `hover:bg-bg-muted hover:text-text-primary`, `rounded-sm`, `p-1` (4px) | — |
| **Breadcrumb segments** | `hover:text-text-primary` | — |
| **"+ Connect repo"** | `hover:bg-bg-muted hover:text-text-primary` | — |
| **"+ Add field" link** | `hover:text-accent-hover hover:underline` | — |
| **Tag pill × remove** | `hover:text-text-primary` | — |
| **Toggle switch** | `cursor-pointer` (inherent) | — |

### Button hover states

| Class | Hover | Active (mousedown) |
|---|---|---|
| `.btn-primary` | `background: --color-accent-hover` | `opacity: 0.9; transform: scale(0.99)` |
| `.btn-secondary` | `background: --color-bg-overlay; border-color: --color-border-strong` | — |
| `.btn-ghost` | `background: --color-bg-muted; color: --color-text-primary` | — |

### What NOT to do

- No `transform: scale()` on hover (only `.btn-primary:active` at `0.99`)
- No `box-shadow` on hover
- No color transitions longer than 150ms
- No JavaScript for hover effects — CSS/Tailwind only
- Do not change selected/active state logic — only layer hover on top

---

## Component Classes

Defined in `src/styles/components.css`. Use these or compose with Tailwind utilities.

### Buttons

All buttons: 32px height, 13px font, 500 weight, `--radius-md`, `--duration-fast` transition with `--easing-default`. No uppercase, no wide letter-spacing.

| Class | Background | Border | Text |
|---|---|---|---|
| `.btn-primary` | `--color-accent` | transparent | white |
| `.btn-secondary` | `--color-bg-emphasis` | `--color-border-default` | `--color-text-primary` |
| `.btn-ghost` | transparent | transparent | `--color-text-secondary` |

### Inputs

`.input` — 32px height, `--color-bg-muted` background, `--color-border-default` border, `--radius-sm`.

### Cards

`.card` — `--color-bg-subtle` background, `--color-border-subtle` border, `--radius-md`, `--space-4` padding.

### Status Pills

`.pill` + `.pill-success` / `.pill-warning` / `.pill-error` / `.pill-accent` — small rounded indicators with subtle background.

---

## Tailwind Usage

In Tailwind v4, use the mapped utilities:

```html
<!-- Background -->
<div class="bg-bg-base">
<div class="bg-bg-subtle">

<!-- Text color -->
<p class="text-text-primary">
<p class="text-text-secondary">

<!-- Border -->
<div class="border border-border-default">

<!-- Font families -->
<h1 class="font-display">
<p class="font-ui">
<code class="font-mono">

<!-- Spacing -->
<div class="p-4 gap-2">

<!-- Border radius -->
<div class="rounded-md">
<div class="rounded-sm">

<!-- Shadows -->
<div class="shadow-md">
```

---

## Logo & Brand Assets

### Logo kit

The production logo kit lives at `/Downloads/commit-logo-kit/` (source) with copies in:

- **SVGs** → `public/images/logo/` — `lockup-light.svg`, `lockup-dark.svg`, `icon-light.svg`, `icon-dark.svg`, `icon-indigo.svg`
- **Favicons** → `public/` — `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `favicon-192.png`, `favicon-512.png`
- **Manifest** → `public/site.webmanifest`

### `<Logo>` component

**File:** `src/components/Logo.tsx`

The canonical way to render the logo anywhere in the app. Never use raw `<img>` tags or inline SVG literals — always use this component.

```tsx
import { Logo } from "@/components/Logo";

// Full lockup (icon + wordmark) — default
<Logo />
<Logo variant="lockup" size={24} />

// Icon only
<Logo variant="icon" size={22} />

// Force a theme instead of auto-detecting
<Logo theme="light" />
<Logo theme="dark" />
```

**Props:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"lockup" \| "icon"` | `"lockup"` | Lockup = icon + "commit" wordmark. Icon = square only. |
| `theme` | `"light" \| "dark" \| "auto"` | `"auto"` | Auto uses `next-themes` `resolvedTheme` with SSR-safe mount guard. |
| `size` | `number` | `36` (lockup) / `32` (icon) | Height in px. Lockup width is derived proportionally (352:72 ratio). |
| `className` | `string` | — | Passed to the `<svg>` element. |
| `style` | `CSSProperties` | — | Passed to the `<svg>` element. |

The component is `"use client"` because it reads `next-themes`. It always renders something on SSR (defaults to light variant until hydrated).

### Brand colors

| Role | Value |
|---|---|
| Primary blue (accent) | `#4f7af8` |
| Wordmark on light | `#1A1A2E` |
| Wordmark on dark | `#FFFFFF` |
| Icon square bg on light | `#FFFFFF` |
| Icon square bg on dark | `#1E1E30` |

### What NOT to do

- Do not re-create, recolor, or modify the SVG source files.
- Do not render logo via `<img src="/images/logo/...">` — use `<Logo>` so dark/light switching works.
- Do not add new one-off logo implementations in individual components — extend `Logo.tsx` instead.
- The old `MDocsLogo.tsx` / `MDocsMark` component has been deleted. Do not re-create it.

---

## Rules for Future Sessions

1. **Never use raw hex values** in components. Always reference a token.
2. **Never use Inter or Roboto.** Display = Geist, UI = DM Sans, Mono = Geist Mono.
3. **Never use `rounded-xl` or larger** (except `rounded-full` for pills/avatars).
4. **Never use decorative shadows or glow effects.**
5. **Never add font weights 300 or 800.**
6. **All spacing must be multiples of 4px.** No arbitrary values.
7. **Accent blue is `#4f7af8`.** Do not introduce additional accent colors without updating this doc.
8. **Both modes supported.** Light tokens in `:root`, dark overrides in `.dark`. Keep both in sync when adding new color tokens.
9. **Every interactive element must have `cursor: pointer`.** Buttons and anchors get it globally via `globals.css`. Custom clickable `div`/`span` elements must add `cursor-pointer` via Tailwind.
10. **Use design-token-mapped Tailwind classes for hover states.** Use `hover:bg-bg-muted`, `hover:text-text-primary`, etc. — never unmapped names like `hover:bg-surface-hover` or `hover:text-fg-secondary`. See the "Hover & Active States" section for the full reference.
11. **Icon buttons use `p-1 rounded-sm`** (4px padding, 3px radius) so the hover background fill looks intentional.
12. **No hover transitions longer than 150ms.** Use `--duration-fast` (100ms) for all hover/active transitions.
