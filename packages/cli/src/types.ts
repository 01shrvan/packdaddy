export type PackageManager = "npm" | "pnpm" | "yarn" | "bun"

export type AnalyzerName = "unused" | "outdated" | "audit" | "size"

export type AnalyzerStatus = "ok" | "warning" | "error" | "skipped"

export interface CliArgs {
  cwd: string
  help: boolean
  json: boolean
  fix: boolean
  scans: AnalyzerName[]
}

export interface PackageJsonShape {
  name?: string
  packageManager?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  workspaces?: string[] | { packages?: string[] }
}

export interface ProjectConfig {
  root: string
  packageJsonPath: string
  packageJson: PackageJsonShape
  packageManager: PackageManager
  lockfile?: string
  isWorkspace: boolean
}

export interface AnalyzerItem {
  name: string
  current?: string
  wanted?: string
  latest?: string
  severity?: string
  sizeBytes?: number
  detail?: string
}

export interface AnalyzerResult {
  name: AnalyzerName
  status: AnalyzerStatus
  summary: string
  items: AnalyzerItem[]
  warnings: string[]
}

export interface ScanReport {
  project: {
    name: string
    root: string
    packageManager: PackageManager
    lockfile?: string
    isWorkspace: boolean
  }
  results: AnalyzerResult[]
}
