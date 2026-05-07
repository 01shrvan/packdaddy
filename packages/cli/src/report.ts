import { log, note } from "@clack/prompts"
import type { AnalyzerItem, AnalyzerResult, ScanReport } from "./types.js"

export function renderJson(report: ScanReport): string {
  return `${JSON.stringify({ ...report, generatedAt: new Date().toISOString() }, null, 2)}\n`
}

export function renderResult(result: AnalyzerResult): void {
  const name = result.name

  if (result.status === "ok") {
    if (result.items.length > 0) {
      const lines: string[] = [dim(result.summary), ""]
      lines.push(...buildTable(result.items, result.name))
      if (result.warnings.length > 0) {
        lines.push("")
        for (const w of result.warnings) lines.push(dim(`  ↳ ${w}`))
      }
      note(lines.join("\n"), name)
    } else {
      log.success(`${b(name)}  ${dim(result.summary)}`)
    }
    return
  }

  if (result.status === "skipped") {
    log.step(`${b(name)}  ${dim(result.summary)}`)
    return
  }

  if (result.status === "error") {
    log.error(`${b(name)}  ${result.summary}`)
    for (const w of result.warnings) log.message(`  ${dim(w)}`)
    return
  }

  // warning — render items in a note box
  const lines: string[] = [dim(result.summary)]

  if (result.items.length > 0) {
    lines.push("")
    lines.push(...buildTable(result.items, result.name))
    if (result.items.length > 15) {
      lines.push("")
      lines.push(dim(`  … ${result.items.length - 15} more not shown`))
    }
  }

  if (result.warnings.length > 0) {
    lines.push("")
    for (const w of result.warnings) {
      lines.push(dim(`  ↳ ${w}`))
    }
  }

  note(lines.join("\n"), name)
}

/* ── table builder ── */

function buildTable(items: AnalyzerItem[], analyzer: string): string[] {
  const MAX = 15
  const raw = items.slice(0, MAX).map((item) => rawCells(item, analyzer))
  const widths = colWidths(raw)

  return raw.map((cells) =>
    "  " +
    cells
      .map((cell, i) => {
        const padded = cell.padEnd(widths[i] ?? 0)
        const trimmed = padded.trimEnd()
        const trail = padded.slice(trimmed.length)
        return colorCell(trimmed, i, analyzer) + trail
      })
      .join("  ")
      .trimEnd()
  )
}

function rawCells(item: AnalyzerItem, analyzer: string): string[] {
  switch (analyzer) {
    case "size":
      return [item.name, item.sizeBytes ? formatBytes(item.sizeBytes) : ""]
    case "outdated":
      return [item.name, item.current ?? "", "→", item.latest ?? ""]
    case "audit":
      return [
        item.name,
        item.current ?? "",
        item.severity ?? "",
        (item.detail ?? "").split(" · ")[0] ?? "",
      ]
    default: // unused
      return [item.name, item.current ?? ""]
  }
}

function colWidths(rows: string[][]): number[] {
  if (rows.length === 0 || !rows[0]) return []
  return rows[0].map((_, i) => Math.max(...rows.map((r) => (r[i] ?? "").length)))
}

function colorCell(text: string, col: number, analyzer: string): string {
  if (!text) return text
  if (col === 0) return b(text)

  switch (analyzer) {
    case "size":
      return col === 1 ? green(text) : dim(text)
    case "outdated":
      if (col === 1) return dim(text)
      if (col === 2) return dim(text)
      if (col === 3) return green(text)
      return dim(text)
    case "audit":
      if (col === 2) return severityColor(text)
      return dim(text)
    default:
      return dim(text)
  }
}

/* ── formatting helpers ── */

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let v = bytes
  let u = 0
  while (v >= 1024 && u < units.length - 1) { v /= 1024; u++ }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[u]}`
}

function severityColor(s: string): string {
  switch (s.toLowerCase()) {
    case "critical": return red(s)
    case "high":     return red(s)
    case "moderate": return yellow(s)
    case "low":      return dim(s)
    default:         return yellow(s)
  }
}

/* ── minimal ANSI ── */

const R = "\x1b[0m"

function b(s: string)      { return `\x1b[1m${s}${R}` }
function dim(s: string)    { return `\x1b[2m${s}${R}` }
function green(s: string)  { return `\x1b[32m${s}${R}` }
function yellow(s: string) { return `\x1b[33m${s}${R}` }
function red(s: string)    { return `\x1b[31m${s}${R}` }
