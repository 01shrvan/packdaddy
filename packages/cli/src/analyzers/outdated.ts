import type { AnalyzerItem, AnalyzerResult, PackageJsonShape, ProjectConfig } from "../types.js"

export async function runOutdatedAnalyzer(
  config: ProjectConfig,
): Promise<AnalyzerResult> {
  const dependencies = getDependencies(config.packageJson)

  if (dependencies.length === 0) {
    return {
      name: "outdated",
      status: "skipped",
      summary: "No dependencies found to compare against the registry.",
      items: [],
      warnings: [],
    }
  }

  const settled = await Promise.allSettled(
    dependencies.map(async ([name, current]) => {
      const latest = await getLatestVersion(name)
      if (!latest || normalizeRange(current) === normalizeRange(latest)) {
        return null
      }

      return {
        name,
        current,
        wanted: latest,
        latest,
        detail: "registry",
      } satisfies AnalyzerItem
    }),
  )

  const networkErrors: string[] = []
  const items: AnalyzerItem[] = []

  for (const entry of settled) {
    if (entry.status === "rejected") {
      networkErrors.push(
        entry.reason instanceof Error
          ? entry.reason.message
          : String(entry.reason),
      )
      continue
    }

    if (entry.value) {
      items.push(entry.value)
    }
  }

  if (networkErrors.length > 0 && items.length === 0) {
    return {
      name: "outdated",
      status: "skipped",
      summary: "Could not reach the npm registry.",
      items: [],
      warnings: dedupe(networkErrors),
    }
  }

  return {
    name: "outdated",
    status: items.length > 0 ? "warning" : "ok",
    summary:
      items.length > 0
        ? `${items.length} dependencies have newer versions in the registry.`
        : "No outdated dependencies reported against the registry.",
    items,
    warnings: networkErrors.length > 0 ? dedupe(networkErrors) : [],
  }
}

function getDependencies(packageJson: PackageJsonShape) {
  return Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies,
  }).filter(([, current]) => !isLocalVersion(current))
}

async function getLatestVersion(name: string) {
  const response = await fetch(
    `https://registry.npmjs.org/${encodePackageName(name)}/latest`,
    {
      headers: {
        accept: "application/vnd.npm.install-v1+json",
      },
    },
  )

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }

    throw new Error(`Registry lookup failed for ${name} (${response.status}).`)
  }

  const body = (await response.json()) as { version?: string }
  return body.version ?? null
}

function encodePackageName(name: string) {
  return name.startsWith("@") ? name.replace("/", "%2F") : name
}

function isLocalVersion(value: string) {
  return (
    value.startsWith("workspace:") ||
    value.startsWith("file:") ||
    value.startsWith("link:") ||
    value.startsWith("patch:")
  )
}

function normalizeRange(value: string) {
  return value.replace(/^[~^]/, "").trim()
}

function dedupe(values: string[]) {
  return [...new Set(values)]
}
