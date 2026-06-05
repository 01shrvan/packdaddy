import { readdir, readFile } from "node:fs/promises"
import { extname, resolve } from "node:path"
import { IGNORED_SCAN_DIRS, KNOWN_TOOLING } from "../constants.js"
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

  const scriptTokens = getScriptTokens(config.packageJson)
  const binNamesByDep = new Map(
    await Promise.all(
      deps.map(
        async ([name]) =>
          [name, await getBinNames(config.root, name)] as const
      )
    )
  )

  const unused = deps.filter(([name]) => {
    if (isTypesPackage(name)) return false
    if (KNOWN_TOOLING.has(name)) return false
    if (isDependencyReferenced(name, haystack)) return false
    if (isReferencedInScripts(name, binNamesByDep.get(name) ?? [], scriptTokens))
      return false
    return true
  })

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
        "No import, require, script, or package-name reference found.",
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
  })
    .filter(([, version]) => !isLocalVersion(version))
    .sort(([a], [b]) => a.localeCompare(b))
}

function isLocalVersion(value: string) {
  return (
    value.startsWith("workspace:") ||
    value.startsWith("file:") ||
    value.startsWith("link:") ||
    value.startsWith("patch:")
  )
}

function isTypesPackage(name: string) {
  return name.startsWith("@types/")
}

function getScriptTokens(packageJson: PackageJsonShape): Set<string> {
  const text = Object.values(packageJson.scripts ?? {}).join(" \n ")
  return new Set(text.split(/[^a-zA-Z0-9@/_-]+/).filter(Boolean))
}

function isReferencedInScripts(
  name: string,
  binNames: string[],
  scriptTokens: Set<string>
) {
  if (scriptTokens.has(name)) return true
  return binNames.some((bin) => scriptTokens.has(bin))
}

async function getBinNames(root: string, name: string): Promise<string[]> {
  try {
    const manifestPath = resolve(
      packageDirectory(root, name),
      "package.json"
    )
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      bin?: string | Record<string, string>
    }

    if (typeof manifest.bin === "string") {
      return [unscopedName(name)]
    }

    if (manifest.bin && typeof manifest.bin === "object") {
      return Object.keys(manifest.bin)
    }

    return []
  } catch {
    return []
  }
}

function packageDirectory(root: string, name: string) {
  if (!name.startsWith("@")) {
    return resolve(root, "node_modules", name)
  }

  const [scope, packageName] = name.split("/")
  return resolve(root, "node_modules", scope ?? "", packageName ?? "")
}

function unscopedName(name: string) {
  return name.startsWith("@") ? (name.split("/")[1] ?? name) : name
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
