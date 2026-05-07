import type { AnalyzerItem, AnalyzerResult, ScanReport } from "./types.js"

export function renderJson(report: ScanReport) {
  return `${JSON.stringify(
    {
      ...report,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`
}

export function renderReport(report: ScanReport) {
  const counts = getCounts(report.results)
  const lines = [
    color("packdaddy", "magenta", true),
    color("dependency scan", "dim"),
    "",
    `project: ${report.project.name}`,
    `manager: ${report.project.packageManager}${report.project.lockfile ? ` (${report.project.lockfile})` : ""}`,
    `workspace: ${report.project.isWorkspace ? "yes" : "no"}`,
    `summary: ${counts.warning} warning${plural(counts.warning)}, ${counts.error} error${plural(counts.error)}, ${counts.skipped} skipped`,
    "",
  ]

  for (const result of report.results) {
    lines.push(...renderResult(result), "")
  }

  lines.push(color("tip: use --json for machine-readable output", "dim"))
  return `${lines.join("\n").trimEnd()}\n`
}

function renderResult(result: AnalyzerResult) {
  const lines = [
    sectionTitle(result.name),
    `  ${statusLabel(result.status)} ${result.summary}`,
  ]

  for (const item of result.items.slice(0, 12)) {
    lines.push(`  - ${renderItem(item)}`)
  }

  for (const warning of result.warnings) {
    lines.push(`  ! ${warning}`)
  }

  return lines
}

function renderItem(item: AnalyzerItem) {
  const parts = [color(item.name, "white", true)]

  if (item.current || item.wanted || item.latest) {
    const versions = [item.current, item.wanted, item.latest]
      .filter(Boolean)
      .join(" -> ")
    if (versions) {
      parts.push(color(versions, "magenta"))
    }
  }

  if (item.sizeBytes) {
    parts.push(color(formatBytes(item.sizeBytes), "green"))
  }

  if (item.severity) {
    parts.push(color(item.severity, "yellow"))
  }

  if (item.detail) {
    parts.push(color(item.detail, "dim"))
  }

  return parts.join("  ")
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)}${units[unitIndex]}`
}

function getCounts(results: AnalyzerResult[]) {
  return results.reduce(
    (acc, result) => {
      acc[result.status] += 1
      return acc
    },
    { ok: 0, warning: 0, error: 0, skipped: 0 },
  )
}

function plural(value: number) {
  return value === 1 ? "" : "s"
}

function sectionTitle(name: string) {
  return color(`-- ${name} --`, "cyan", true)
}

function statusLabel(status: AnalyzerResult["status"]) {
  switch (status) {
    case "ok":
      return color("[ok]", "green", true)
    case "warning":
      return color("[warn]", "yellow", true)
    case "error":
      return color("[err]", "red", true)
    case "skipped":
      return color("[skip]", "dim", true)
  }
}

function color(
  value: string,
  tone: "magenta" | "cyan" | "green" | "yellow" | "red" | "white" | "dim",
  bold = false,
) {
  const tones: Record<typeof tone, string> = {
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    red: "\u001b[31m",
    white: "\u001b[37m",
    dim: "\u001b[2m",
  }

  const reset = "\u001b[0m"
  const prefix = `${bold ? "\u001b[1m" : ""}${tones[tone]}`
  return `${prefix}${value}${reset}`
}
