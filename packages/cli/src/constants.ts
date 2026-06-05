import type { AnalyzerName, PackageManager } from "./types.js"

export const DEFAULT_SCANS: AnalyzerName[] = ["unused", "outdated", "size"]

export const ALL_SCANS: AnalyzerName[] = ["unused", "outdated", "audit", "size"]

export const LOCKFILES: Record<string, PackageManager> = {
  "pnpm-lock.yaml": "pnpm",
  "bun.lock": "bun",
  "bun.lockb": "bun",
  "yarn.lock": "yarn",
  "package-lock.json": "npm",
  "npm-shrinkwrap.json": "npm",
}

export const IGNORED_SCAN_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "out",
])

export const KNOWN_TOOLING = new Set([
  "typescript",
  "eslint",
  "prettier",
  "tailwindcss",
  "@tailwindcss/postcss",
  "postcss",
  "autoprefixer",
  "react-dom",
  "turbo",
  "tsx",
  "ts-node",
  "nodemon",
  "rimraf",
  "concurrently",
  "husky",
  "lint-staged",
  "vite",
  "next",
  "webpack",
  "rollup",
  "esbuild",
  "vitest",
  "jest",
  "mocha",
  "playwright",
  "cypress",
])
