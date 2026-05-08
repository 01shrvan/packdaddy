import { ALL_SCANS, DEFAULT_SCANS } from "./constants.js"
import type { AnalyzerName, CliArgs } from "./types.js"

const SCAN_FLAGS = new Map<string, AnalyzerName>([
  ["unused", "unused"],
  ["outdated", "outdated"],
  ["audit", "audit"],
  ["size", "size"],
])

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    cwd: process.cwd(),
    fix: false,
    help: false,
    json: false,
    scans: [],
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (!token) {
      continue
    }

    if (token === "-h" || token === "--help") {
      args.help = true
      continue
    }

    if (token === "--json") {
      args.json = true
      continue
    }

    if (token === "--fix") {
      args.fix = true
      continue
    }

    if (token === "--all") {
      args.scans = [...ALL_SCANS]
      continue
    }

    if (token === "--cwd") {
      const value = argv[index + 1]
      if (!value || value.startsWith("--")) {
        throw new Error("--cwd requires a path.")
      }
      args.cwd = value
      index += 1
      continue
    }

    if (token.startsWith("--cwd=")) {
      args.cwd = token.slice("--cwd=".length)
      continue
    }

    if (token.startsWith("--")) {
      const scan = SCAN_FLAGS.get(token.slice(2))
      if (!scan) {
        throw new Error(`Unknown option "${token}".`)
      }
      args.scans.push(scan)
      continue
    }

    throw new Error(`Unexpected argument "${token}".`)
  }

  if (args.scans.length === 0) {
    args.scans = [...DEFAULT_SCANS]
  }

  args.scans = [...new Set(args.scans)]
  return args
}

export function getHelpText() {
  return [
    "Usage",
    "  packdaddy [options]",
    "",
    "Options",
    "  --cwd <path>      Project directory to scan",
    "  --unused          Find dependencies that do not appear in source files",
    "  --outdated        Run the package manager outdated check",
    "  --audit           Run the package manager audit check",
    "  --size            Estimate installed dependency sizes",
    "  --all             Run every analyzer",
    "  --json            Print machine-readable JSON",
    "  --fix             Interactively remove unused dependencies",
    "  -h, --help        Show this help message",
    "",
    "Examples",
    "  packdaddy",
    "  packdaddy --cwd apps/web --unused --size",
    "  packdaddy --json --audit",
  ].join("\n")
}
