import { execSync } from "node:child_process"
import { confirm, isCancel, log, multiselect } from "@clack/prompts"
import { runUnusedAnalyzer } from "./analyzers/unused.js"
import type { PackageManager, ProjectConfig } from "./types.js"

function uninstallCmd(pm: PackageManager, packages: string[]): string {
  const pkgs = packages.join(" ")
  switch (pm) {
    case "pnpm":
      return `pnpm remove ${pkgs}`
    case "yarn":
      return `yarn remove ${pkgs}`
    case "bun":
      return `bun remove ${pkgs}`
    default:
      return `npm uninstall ${pkgs}`
  }
}

export async function runFix(config: ProjectConfig): Promise<void> {
  log.step("Scanning for unused dependencies…")

  const result = await runUnusedAnalyzer(config)

  if (result.items.length === 0) {
    log.success("No unused packages found — nothing to remove.")
    return
  }

  const names = result.items.map((item) => item.name)

  const selected = await multiselect({
    message: `${result.items.length} unused package${result.items.length !== 1 ? "s" : ""} found. Space to deselect, Enter to remove all:`,
    options: result.items.map((item) => ({
      value: item.name,
      label: item.name,
      hint: item.current,
    })),
    initialValues: names,
    required: false,
  })

  if (isCancel(selected) || !Array.isArray(selected) || selected.length === 0) {
    log.step("Nothing removed.")
    return
  }

  const pkgs = selected as unknown as string[]
  const cmd = uninstallCmd(config.packageManager, pkgs)

  const confirmed = await confirm({
    message: `Run: ${cmd}?`,
  })

  if (isCancel(confirmed) || !confirmed) {
    log.step("Nothing removed.")
    return
  }

  try {
    execSync(cmd, { cwd: config.root, stdio: "inherit" })
    log.success(
      `Removed ${pkgs.length} package${pkgs.length !== 1 ? "s" : ""}: ${pkgs.join(", ")}`
    )
  } catch {
    log.error(`Failed to run "${cmd}". Check your package manager is available.`)
  }
}
