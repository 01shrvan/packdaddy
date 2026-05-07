import { runCommand } from "../exec.js"
import type { AnalyzerResult, ProjectConfig } from "../types.js"

export async function runAuditAnalyzer(
  config: ProjectConfig
): Promise<AnalyzerResult> {
  const command = getAuditCommand(config.packageManager)

  if (!command) {
    return {
      name: "audit",
      status: "skipped",
      summary: `${config.packageManager} audit output is not supported yet.`,
      items: [],
      warnings: [],
    }
  }

  const result = await runCommand(command.command, command.args, config.root)
  const raw = result.stdout.trim()

  if (!raw) {
    return {
      name: "audit",
      status: "skipped",
      summary: "Audit returned no JSON output.",
      items: [],
      warnings: result.stderr.trim() ? [result.stderr.trim()] : [],
    }
  }

  const parsed = JSON.parse(raw) as {
    vulnerabilities?: Record<
      string,
      { severity?: string; via?: unknown[]; range?: string }
    >
    metadata?: { vulnerabilities?: Record<string, number> }
  }
  const vulnerabilities = parsed.vulnerabilities ?? {}
  const items = Object.entries(vulnerabilities).map(([name, value]) => ({
    name,
    severity: value.severity,
    detail: value.range,
  }))

  return {
    name: "audit",
    status: items.length > 0 ? "warning" : "ok",
    summary:
      items.length > 0
        ? `${items.length} vulnerable packages reported.`
        : "No vulnerabilities reported.",
    items,
    warnings: result.stderr.trim() ? [result.stderr.trim()] : [],
  }
}

function getAuditCommand(packageManager: ProjectConfig["packageManager"]) {
  switch (packageManager) {
    case "npm":
      return { command: "npm", args: ["audit", "--json"] }
    case "pnpm":
      return { command: "pnpm", args: ["audit", "--json"] }
    case "yarn":
      return { command: "yarn", args: ["npm", "audit", "--json"] }
    case "bun":
      return undefined
  }
}
