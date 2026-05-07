# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root via pnpm workspaces + Turbo.

```bash
pnpm build         # Build all packages
pnpm dev           # Start all dev servers
pnpm lint          # ESLint across workspace
pnpm format        # Prettier across workspace
pnpm typecheck     # TypeScript type checking
```

Scoped to a specific package:
```bash
pnpm --filter packdaddy build    # Compile CLI to dist/
pnpm --filter packdaddy link --global  # Install CLI globally for local testing
pnpm --filter web dev            # Next.js dev server (Turbopack)
pnpm --filter web build          # Production build of web app
```

Run the built CLI directly:
```bash
node packages/cli/dist/index.js --cwd <path> --unused --size
```

## Architecture

This is a pnpm workspace monorepo orchestrated by Turbo (`turbo.json`).

```
apps/
  web/          Next.js 16 landing page (React 19, Tailwind v4)
packages/
  cli/          Zero-dependency TypeScript CLI (the core product)
  ui/           Shared React component library (shadcn/ui, Radix, Tailwind v4)
  eslint-config/     Shared ESLint flat configs (base, next, react-internal)
  typescript-config/ Shared tsconfig bases (base, nextjs, react-library)
```

### CLI (`packages/cli`)

The CLI is the core product — a dependency analyzer for Node.js projects. It has **zero runtime dependencies** (Node built-ins only).

Entry: `src/index.ts` → `src/args.ts` → `src/analyze.ts` → `src/analyzers/*` → `src/report.ts`

- `config.ts` — detects package manager (npm/pnpm/yarn/bun) from lockfile, resolves project root
- `analyzers/unused.ts` — scans source files for import references vs `package.json` deps
- `analyzers/outdated.ts` — shells out to the detected package manager's `outdated` command
- `analyzers/audit.ts` — shells out to the detected package manager's `audit` command
- `analyzers/size.ts` — estimates installed sizes by reading `node_modules`
- `types.ts` / `constants.ts` — shared types and lockfile-to-package-manager mappings

Default flags when none are specified: `--unused`, `--outdated`, `--size`.

### Web App (`apps/web`)

Landing page for the CLI. Uses `@workspace/ui` for shared components and styles.

- `app/layout.tsx` imports `@workspace/ui/globals.css` (Tailwind v4 theme) and wraps with `ThemeProvider`
- `components/theme-provider.tsx` — next-themes wrapper; press `d` to toggle dark mode
- `next.config.mjs` — transpiles `@workspace/ui` so workspace package works with Next.js
- `postcss.config.mjs` — re-exports PostCSS config from `@workspace/ui`

### UI Package (`packages/ui`)

Shared component library consumed by the web app.

- Components use CVA (`class-variance-authority`) for variant-based styling
- `lib/utils.ts` exports `cn()` — `clsx` + `tailwind-merge` helper
- `styles/globals.css` is the Tailwind v4 theme with `@source` directives — import this in consuming apps

## Key Conventions

- All packages are ES modules (`"type": "module"`)
- TypeScript strict mode is on everywhere; tsconfigs extend `@workspace/typescript-config/*`
- Tailwind v4 syntax (`@theme`, `@source`, `@import "tailwindcss"`) — not v3
- ESLint 9 flat config in each package; Prettier with `prettier-plugin-tailwindcss` for class sorting
- `.prettierrc`: no semicolons, double quotes (`singleQuote: false`)
- shadcn/ui components are configured in `apps/web/components.json` (Radix Nova style, Hugeicons icon library)
