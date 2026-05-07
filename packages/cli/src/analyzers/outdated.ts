import { runCommand } from "../exec.js"
import type { AnalyzerResult, ProjectConfig } from "../types.js"

export async function runOutdatedAnalyzer(
  config: ProjectConfig
): Promise<AnalyzerResult> {
  const command = getOutdatedCommand(config.packageManager)

  if (!command) {
    return {
      name: "outdated",
      status: "skipped",
      summary: `${config.packageManager} outdated output is not supported yet.`,
      items: [],
      warnings: [],
    }
  }

  const result = await runCommand(command.command, command.args, config.root)
  const raw = result.stdout.trim()

  if (!raw) {
    return {
      name: "outdated",
      status: "ok",
      summary: "No outdated dependencies reported.",
      items: [],
      warnings: result.stderr.trim() ? [result.stderr.trim()] : [],
    }
  }

  const parsed = parseOutdatedJson(raw)
  const items = Object.entries(parsed).map(([name, value]) => ({
    name,
    current: value.current,
    wanted: value.wanted,
    latest: value.latest,
    detail: value.type,
  }))

  return {
    name: "outdated",
    status: items.length > 0 ? "warning" : "ok",
    summary:
      items.length > 0
        ? `${items.length} dependencies have newer versions.`
        : "No outdated dependencies reported.",
    items,
    warnings: result.stderr.trim() ? [result.stderr.trim()] : [],
  }
}

function getOutdatedCommand(packageManager: ProjectConfig["packageManager"]) {
  switch (packageManager) {
    case "npm":
      return { command: "npm", args: ["outdated", "--json"] }
    case "pnpm":
      return { command: "pnpm", args: ["outdated", "--format", "json"] }
    case "yarn":
      return { command: "yarn", args: ["outdated", "--json"] }
    case "bun":
      return { command: "bun", args: ["outdated", "--json"] }
  }
}

function parseOutdatedJson(
  raw: string
): Record<
  string,
  { current?: string; wanted?: string; latest?: string; type?: string }
> {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const json = lines.length > 1 ? lines.at(-1) : raw
  return JSON.parse(json ?? "{}") as Record<
    string,
    { current?: string; wanted?: string; latest?: string; type?: string }
  >
}
