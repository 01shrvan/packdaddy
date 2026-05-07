import { readdir, readFile } from "node:fs/promises"
import { extname, resolve } from "node:path"
import { IGNORED_SCAN_DIRS } from "../constants.js"
import type {
  AnalyzerResult,
  PackageJsonShape,
  ProjectConfig,
} from "../types.js"

const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
])

export async function runUnusedAnalyzer(
  config: ProjectConfig
): Promise<AnalyzerResult> {
  const deps = getDependencyEntries(config.packageJson)

  if (deps.length === 0) {
    return {
      name: "unused",
      status: "skipped",
      summary: "No dependencies found in package.json.",
      items: [],
      warnings: [],
    }
  }

  const files = await listSourceFiles(config.root)
  const contents = await Promise.all(
    files.map(async (file) => readFile(file, "utf8").catch(() => ""))
  )
  const haystack = contents.join("\n")
  const unused = deps.filter(
    ([name]) => !isDependencyReferenced(name, haystack)
  )

  return {
    name: "unused",
    status: unused.length > 0 ? "warning" : "ok",
    summary:
      unused.length > 0
        ? `${unused.length} dependencies look unused.`
        : "No unused dependencies found by the local scanner.",
    items: unused.map(([name, version]) => ({
      name,
      current: version,
      detail:
        "No import, require, or package-name reference found in source files.",
    })),
    warnings: [
      "Unused detection is a fast local heuristic. Run a full static analyzer before deleting critical packages.",
    ],
  }
}

function getDependencyEntries(packageJson: PackageJsonShape) {
  return Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies,
  }).sort(([a], [b]) => a.localeCompare(b))
}

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolute = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      if (!IGNORED_SCAN_DIRS.has(entry.name)) {
        files.push(...(await listSourceFiles(absolute)))
      }
      continue
    }

    if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
      files.push(absolute)
    }
  }

  return files
}

function isDependencyReferenced(name: string, contents: string) {
  const escaped = escapeRegExp(name)
  return new RegExp(`["'\`]${escaped}(?:[/:"'\`]|$)`).test(contents)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
