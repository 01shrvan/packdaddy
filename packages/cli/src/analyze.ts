import { runAuditAnalyzer } from "./analyzers/audit.js"
import { runOutdatedAnalyzer } from "./analyzers/outdated.js"
import { runSizeAnalyzer } from "./analyzers/size.js"
import { runUnusedAnalyzer } from "./analyzers/unused.js"
import type {
  AnalyzerName,
  AnalyzerResult,
  ProjectConfig,
  ScanReport,
} from "./types.js"

export async function analyzeProject(
  config: ProjectConfig,
  scans: AnalyzerName[]
): Promise<ScanReport> {
  const results = await Promise.all(scans.map((scan) => runAnalyzer(scan, config)))

  return {
    project: {
      name: config.packageJson.name ?? "unnamed-project",
      root: config.root,
      packageManager: config.packageManager,
      lockfile: config.lockfile,
      isWorkspace: config.isWorkspace,
    },
    results,
  }
}

async function runAnalyzer(
  scan: AnalyzerName,
  config: ProjectConfig
): Promise<AnalyzerResult> {
  try {
    switch (scan) {
      case "unused":
        return await runUnusedAnalyzer(config)
      case "outdated":
        return await runOutdatedAnalyzer(config)
      case "audit":
        return await runAuditAnalyzer(config)
      case "size":
        return await runSizeAnalyzer(config)
    }
  } catch (error) {
    return {
      name: scan,
      status: "error",
      summary: "Analyzer failed.",
      items: [],
      warnings: [
        error instanceof Error ? error.message : "Unknown analyzer error.",
      ],
    }
  }
}
