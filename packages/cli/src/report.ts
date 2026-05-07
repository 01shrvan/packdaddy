import type { AnalyzerItem, AnalyzerResult, ScanReport } from "./types.js"

export function renderJson(report: ScanReport) {
  return `${JSON.stringify(report, null, 2)}\n`
}

export function renderReport(report: ScanReport) {
  const lines = [
    "packdaddy",
    "",
    `project: ${report.project.name}`,
    `manager: ${report.project.packageManager}${report.project.lockfile ? ` (${report.project.lockfile})` : ""}`,
    `workspace: ${report.project.isWorkspace ? "yes" : "no"}`,
    "",
  ]

  for (const result of report.results) {
    lines.push(renderResult(result), "")
  }

  return `${lines.join("\n").trimEnd()}\n`
}

function renderResult(result: AnalyzerResult) {
  const lines = [`[${result.status}] ${result.name}: ${result.summary}`]

  for (const item of result.items.slice(0, 12)) {
    lines.push(`  - ${renderItem(item)}`)
  }

  for (const warning of result.warnings) {
    lines.push(`  ! ${warning}`)
  }

  return lines.join("\n")
}

function renderItem(item: AnalyzerItem) {
  const version = [item.current, item.wanted, item.latest]
    .filter(Boolean)
    .join(" -> ")
  const size = item.sizeBytes ? ` ${formatBytes(item.sizeBytes)}` : ""
  const severity = item.severity ? ` ${item.severity}` : ""
  const detail = item.detail ? ` ${item.detail}` : ""
  return `${item.name}${version ? ` ${version}` : ""}${size}${severity}${detail}`
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
