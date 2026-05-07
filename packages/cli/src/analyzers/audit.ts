import type { AnalyzerItem, AnalyzerResult, PackageJsonShape, ProjectConfig } from "../types.js"

type AuditAdvisory = {
  id?: number
  title?: string
  severity?: string
  url?: string
  vulnerable_versions?: string
}

export async function runAuditAnalyzer(
  config: ProjectConfig,
): Promise<AnalyzerResult> {
  const dependencies = getDependencies(config.packageJson)

  if (dependencies.length === 0) {
    return {
      name: "audit",
      status: "skipped",
      summary: "No dependencies found to audit.",
      items: [],
      warnings: [],
    }
  }

  let response: Response

  try {
    response = await fetch(
      "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(buildPayload(dependencies)),
      },
    )
  } catch (error) {
    return {
      name: "audit",
      status: "skipped",
      summary: "Could not reach the npm audit registry endpoint.",
      items: [],
      warnings: [
        error instanceof Error ? error.message : "Unknown registry failure.",
      ],
    }
  }

  if (!response.ok) {
    return {
      name: "audit",
      status: "skipped",
      summary: "Could not reach the npm audit registry endpoint.",
      items: [],
      warnings: [`Registry request failed with status ${response.status}.`],
    }
  }

  const body = (await response.json()) as Record<string, AuditAdvisory[]>
  const items = Object.entries(body).flatMap(([name, advisories]) =>
    advisories.map((advisory) => {
      const current = dependencies.find(([dependencyName]) => dependencyName === name)?.[1]

      return {
        name,
        current,
        severity: advisory.severity,
        detail: [advisory.title, advisory.vulnerable_versions]
          .filter(Boolean)
          .join(" · "),
      } satisfies AnalyzerItem
    }),
  )

  if (items.length === 0) {
    return {
      name: "audit",
      status: "ok",
      summary: "No vulnerabilities reported.",
      items: [],
      warnings: [],
    }
  }

  return {
    name: "audit",
    status: "warning",
    summary: `${items.length} vulnerable package advisories reported.`,
    items,
    warnings: [
      "Audit only reflects packages available in the public npm advisory registry.",
    ],
  }
}

function getDependencies(packageJson: PackageJsonShape) {
  return Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies,
  }).filter(([, current]) => !isLocalVersion(current))
}

function buildPayload(dependencies: [string, string][]) {
  const payload: Record<string, string[]> = {}

  for (const [name, version] of dependencies) {
    payload[name] = unique([...(payload[name] ?? []), normalizeRange(version)])
  }

  return payload
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

function unique(values: string[]) {
  return [...new Set(values)]
}
