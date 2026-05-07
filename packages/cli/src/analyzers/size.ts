import { readdir, stat } from "node:fs/promises"
import { resolve } from "node:path"
import type {
  AnalyzerResult,
  PackageJsonShape,
  ProjectConfig,
} from "../types.js"

export async function runSizeAnalyzer(
  config: ProjectConfig
): Promise<AnalyzerResult> {
  const deps = Object.keys(getDependencies(config.packageJson))

  if (deps.length === 0) {
    return {
      name: "size",
      status: "skipped",
      summary: "No dependencies found to size.",
      items: [],
      warnings: [],
    }
  }

  const items = (
    await Promise.all(
      deps.map(async (name) => {
        const directory = resolvePackageDirectory(config.root, name)
        const sizeBytes = await directorySize(directory).catch(() => 0)
        return { name, sizeBytes }
      })
    )
  )
    .filter((item) => item.sizeBytes > 0)
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 10)

  if (items.length === 0) {
    return {
      name: "size",
      status: "skipped",
      summary: "No installed packages found in node_modules.",
      items: [],
      warnings: ["Run install first if you want local size estimates."],
    }
  }

  return {
    name: "size",
    status: "ok",
    summary: `Mapped installed size for ${items.length} heaviest dependencies.`,
    items,
    warnings: ["Size is local install weight, not browser bundle impact."],
  }
}

function getDependencies(packageJson: PackageJsonShape) {
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies,
  }
}

function resolvePackageDirectory(root: string, name: string) {
  if (!name.startsWith("@")) {
    return resolve(root, "node_modules", name)
  }

  const [scope, packageName] = name.split("/")
  return resolve(root, "node_modules", scope ?? "", packageName ?? "")
}

async function directorySize(directory: string): Promise<number> {
  const entries = await readdir(directory, { withFileTypes: true })
  let total = 0

  for (const entry of entries) {
    const absolute = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      total += await directorySize(absolute)
      continue
    }

    const stats = await stat(absolute)
    total += stats.size
  }

  return total
}
