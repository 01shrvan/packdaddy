# packdaddy

Audit your `package.json` in one command — find unused, outdated, vulnerable, and heavy dependencies. Works with **npm, pnpm, yarn, and bun**. Zero runtime dependencies (besides the UI layer).

```
npx packdaddy
```

---

## What it does

packdaddy runs up to four analyzers against your project and prints a clean report:

| Analyzer | Flag | What it checks |
|----------|------|----------------|
| unused | `--unused` | Scans source files for imports. Flags packages never referenced. |
| outdated | `--outdated` | Queries npm registry. Reports deps with newer versions available. |
| audit | `--audit` | Hits npm advisory API. Surfaces known CVEs. |
| size | `--size` | Walks `node_modules`. Ranks heaviest packages by disk footprint. |

Pass `--fix` to interactively remove unused packages after scanning.

By default (no flags), **unused + outdated + size** run. Pass `--all` to run all four.

---

## Install

No install required — just use `npx`:

```bash
npx packdaddy
npx packdaddy --all
```

Or with other package managers:

```bash
pnpm dlx packdaddy
bunx packdaddy
yarn dlx packdaddy
```

Or install globally:

```bash
npm install -g packdaddy
packdaddy
```

---

## Usage

```
packdaddy [options]

Options:
  --unused      Find dependencies not imported anywhere in source
  --outdated    Check npm registry for newer versions
  --audit       Check npm advisory API for known CVEs
  --size        Estimate installed sizes from node_modules
  --all         Run every analyzer
  --fix         Interactively remove unused dependencies
  --json        Print machine-readable JSON output
  --cwd <path>  Run against a specific directory (default: cwd)
  -h, --help    Show help
```

### Examples

```bash
# Default scan (unused + outdated + size)
packdaddy

# Full audit
packdaddy --all

# Interactively remove unused packages
packdaddy --fix

# Specific analyzers
packdaddy --unused --size

# Run in a subdirectory
packdaddy --cwd apps/web

# JSON output for CI
packdaddy --all --json | jq '.results'
```

---

## Output

```
┌  packdaddy

●  my-app  ·  pnpm (pnpm-lock.yaml)

◇  Done in 2.1s

◇  unused ──────────────────────────────────────
│
│  3 dependencies look unused.
│
│  lodash        ^4.17.21
│  moment        ^2.29.4
│  some-package  ^1.0.0
│
│  ↳ Fast local heuristic. Verify before removing.
│
└────────────────────────────────────────────────

◆  audit  No vulnerabilities reported.

◇  size ─────────────────────────────────────────
│
│  Mapped 10 heaviest packages.
│
│  typescript    23 MB
│  tailwindcss    5.7 MB
│  react-dom      4.3 MB
│
└────────────────────────────────────────────────

└  1 warning  ·  0 errors  ·  0 skipped
```

---

## How each analyzer works

**unused** — reads every `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`, `.svelte` file in your project (skipping `node_modules`, `.git`, `dist`, etc.) and checks if each package name appears in any import or require statement. Fast local heuristic — no AST parsing.

**outdated** — fetches `https://registry.npmjs.org/<pkg>/latest` for each dependency and compares against the version declared in `package.json`. Works for all packages including scoped ones.

**audit** — POSTs your dependency list to `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`. No package manager required.

**size** — walks each package's folder inside `node_modules` and sums file sizes recursively.

---

## CI usage

```bash
# Exit code is always 0 — packdaddy is informational
packdaddy --all --json > report.json
```

---

## License

MIT — [github.com/01shrvan/packdaddy](https://github.com/01shrvan/packdaddy)
