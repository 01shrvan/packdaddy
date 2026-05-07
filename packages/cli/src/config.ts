import { access, readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { LOCKFILES } from "./constants.js"
import type {
  PackageJsonShape,
  PackageManager,
  ProjectConfig,
} from "./types.js"

export async function resolveConfig(cwd: string): Promise<ProjectConfig> {
  const root = await findProjectRoot(resolve(cwd))
  const packageJsonPath = resolve(root, "package.json")
  const packageJson = JSON.parse(
    await readFile(packageJsonPath, "utf8")
  ) as PackageJsonShape
  const detected = await detectPackageManager(root, packageJson)

  return {
    root,
    packageJsonPath,
    packageJson,
    packageManager: detected.packageManager,
    lockfile: detected.lockfile,
    isWorkspace:
      Boolean(packageJson.workspaces) ||
      (await fileExists(resolve(root, "pnpm-workspace.yaml"))),
  }
}

async function findProjectRoot(start: string): Promise<string> {
  let current = start

  while (true) {
    try {
      await access(resolve(current, "package.json"))
      return current
    } catch {
      const parent = dirname(current)
      if (parent === current) {
        throw new Error(`No package.json found from ${start}.`)
      }
      current = parent
    }
  }
}

async function detectPackageManager(
  root: string,
  packageJson: PackageJsonShape
): Promise<{ packageManager: PackageManager; lockfile?: string }> {
  for (const [lockfile, packageManager] of Object.entries(LOCKFILES)) {
    try {
      await access(resolve(root, lockfile))
      return { packageManager, lockfile }
    } catch {
      // Try the next lockfile.
    }
  }

  const declared = packageJson.packageManager?.split("@")[0]
  if (isPackageManager(declared)) {
    return { packageManager: declared }
  }

  return { packageManager: "npm" }
}

function isPackageManager(value: string | undefined): value is PackageManager {
  return (
    value === "npm" || value === "pnpm" || value === "yarn" || value === "bun"
  )
}

async function fileExists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
