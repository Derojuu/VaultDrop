# VaultDrop

**Every file has rules.** VaultDrop seals a file's decryption key inside Flare
Confidential Compute and releases it only when the recipient provably satisfies
the sender's access conditions. See [`PITCH.md`](./PITCH.md) for the full product
brief and hackathon positioning.

## Stack

- **Next.js 16** (App Router, no `src/`) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` config) + **shadcn/ui** conventions
- **Framer Motion**, **React Hook Form + Zod**, **Lucide**, **Sonner**,
  **TanStack Query**, **next-themes**, **React Dropzone**, **Zustand**

## Getting started

```bash
pnpm install
cp .env.example .env.local   # already present with local defaults
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script               | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start the dev server (Turbopack)         |
| `pnpm build`         | Production build                         |
| `pnpm typecheck`     | `tsc --noEmit`                           |
| `pnpm lint`          | ESLint (Next + Prettier compatible)      |
| `pnpm format`        | Prettier write (with Tailwind sorting)   |

## Architecture

```
app/          Routes, layout, providers, global CSS (design system)
components/   ui/ primitives · layout/ · sections/ · brand/
lib/          Infrastructure: env validation, query client, cn(), constants
utils/        Pure helpers (formatting)
hooks/        Reusable client hooks
services/     API client / data-access layer
store/        Zustand global UI state
types/        Shared domain types
styles/       Typed design tokens (JS-side source of truth)
```

## Design system

The visual language is a dark "privacy-tech" aesthetic ported from a reference
site: near-black canvas (`#0C0D0F`), indigo accent (`#5E7CFA`), Hanken Grotesk +
IBM Plex Mono, glassmorphic pills, radial glows, hatch overlays, and mono
micro-labels. Tokens live in `app/globals.css` (CSS vars + Tailwind `@theme`)
and mirror into `styles/tokens.ts` for JS/animation use.
