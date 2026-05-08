#!/usr/bin/env node
import { intro, outro, spinner, log } from "@clack/prompts"
import { parseArgs, getHelpText } from "./args.js"
import { analyzeProject } from "./analyze.js"
import { resolveConfig } from "./config.js"
import { runFix } from "./fix.js"
import { renderJson, renderResult } from "./report.js"

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    process.stdout.write(`${getHelpText()}\n`)
    return
  }

  if (args.fix) {
    const config = await resolveConfig(args.cwd)
    intro("packdaddy --fix")
    await runFix(config)
    outro("Done. Re-run packdaddy to verify.")
    return
  }

  const config = await resolveConfig(args.cwd)

  if (args.json) {
    const report = await analyzeProject(config, args.scans)
    process.stdout.write(renderJson(report))
    return
  }

  intro("packdaddy")

  const pm = `${config.packageManager}${config.lockfile ? ` (${config.lockfile})` : ""}`
  const workspace = config.isWorkspace ? " · workspace" : ""
  log.info(`${config.packageJson.name ?? "project"}  ·  ${pm}${workspace}`)

  const s = spinner()
  s.start(`Running ${args.scans.join(", ")} …`)

  const t0 = Date.now()
  const report = await analyzeProject(config, args.scans)
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

  s.stop(`Done in ${elapsed}s`)

  for (const result of report.results) {
    renderResult(result)
  }

  const warn = report.results.filter((r) => r.status === "warning").length
  const err  = report.results.filter((r) => r.status === "error").length
  const skip = report.results.filter((r) => r.status === "skipped").length

  outro(
    `${warn} warning${warn !== 1 ? "s" : ""}  ·  ${err} error${err !== 1 ? "s" : ""}  ·  ${skip} skipped` +
    `\n  use --json for machine-readable output`
  )
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Something went wrong."}\n`
  )
  process.exit(1)
})
