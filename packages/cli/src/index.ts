#!/usr/bin/env node
import { parseArgs, getHelpText } from "./args.js"
import { analyzeProject } from "./analyze.js"
import { resolveConfig } from "./config.js"
import { renderJson, renderReport } from "./report.js"

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    process.stdout.write(`${getHelpText()}\n`)
    return
  }

  if (args.fix) {
    throw new Error(
      "--fix is reserved until dependency removal is interactive."
    )
  }

  const config = await resolveConfig(args.cwd)
  const report = await analyzeProject(config, args.scans)

  process.stdout.write(args.json ? renderJson(report) : renderReport(report))
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Something went wrong."}\n`
  )
  process.exit(1)
})
