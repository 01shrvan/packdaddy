"use client"

import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  CopyCheckIcon,
  GithubIcon,
  NpmIcon,
  PackageRemoveIcon,
  PackageSearchIcon,
  SecurityWarningIcon,
  TerminalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { useState } from "react"

type Hugeicon = Parameters<typeof HugeiconsIcon>[0]["icon"]

const signals: { label: string; value: string; icon: Hugeicon }[] = [
  { label: "unused", value: "find dead packages", icon: PackageRemoveIcon },
  { label: "audit", value: "surface risk", icon: SecurityWarningIcon },
  { label: "json", value: "ship to CI", icon: CheckmarkCircle02Icon },
]

function Icon({
  icon,
  size = 16,
  className,
}: {
  icon: Hugeicon
  size?: number
  className?: string
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={1.7}
      className={className}
    />
  )
}

function CopyCommand({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 500)
      }}
      className="group flex w-full items-center justify-between gap-4 border border-dashed bg-muted/70 px-3 py-2.5 font-mono text-xs transition hover:border-foreground/40"
    >
      <code className="truncate">{code}</code>
      <span className="text-muted-foreground transition group-hover:text-foreground">
        <Icon icon={copied ? CopyCheckIcon : Copy01Icon} size={15} />
      </span>
    </button>
  )
}

function CornerDots() {
  return (
    <>
      <span className="absolute top-0 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
      <span className="absolute top-0 right-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
      <span className="absolute bottom-0 left-0 size-2 -translate-x-1/2 translate-y-1/2 rounded-full border border-border bg-background" />
      <span className="absolute right-0 bottom-0 size-2 translate-x-1/2 translate-y-1/2 rounded-full border border-border bg-background" />
    </>
  )
}

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col border-x bg-background">
      <nav className="font-pixel-square relative flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Icon icon={PackageSearchIcon} size={17} />
          packdaddy
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground">
          <a
            href="https://github.com/01shrvan/packdaddy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid size-8 place-items-center border border-border transition hover:text-foreground"
          >
            <Icon icon={GithubIcon} size={16} />
          </a>
          <a
            href="https://www.npmjs.com/package/packdaddy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="npm"
            className="grid size-8 place-items-center border border-border transition hover:text-foreground"
          >
            <Icon icon={NpmIcon} size={16} />
          </a>
        </div>
        <div className="absolute bottom-0 left-1/2 w-screen -translate-x-1/2 border-b" />
      </nav>

      <section className="grid flex-1 place-items-center px-5 py-14">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              package.json intelligence
            </span>
            <h1 className="font-pixel-square mt-3 text-4xl leading-tight sm:text-6xl">
              packdaddy
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              A small CLI for unused deps, outdated versions, audit warnings,
              and size signals.
            </p>
          </div>

          <div className="relative border border-border bg-border">
            <CornerDots />
            <div className="grid gap-px md:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-background p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] text-muted-foreground uppercase">
                      run
                    </span>
                    <h2 className="font-pixel-square text-lg">scan a repo</h2>
                  </div>
                  <Icon icon={TerminalIcon} size={22} />
                </div>
                <div className="grid gap-2">
                  <CopyCommand code="pnpm dlx packdaddy@latest" />
                  <CopyCommand code="packdaddy --cwd ../my-app --json" />
                </div>
              </div>

              <div className="grid gap-px bg-border">
                {signals.map((signal) => (
                  <div
                    className="flex items-center justify-between gap-4 bg-background p-4"
                    key={signal.label}
                  >
                    <div>
                      <span className="font-mono text-[9px] text-muted-foreground uppercase">
                        {signal.label}
                      </span>
                      <p className="mt-1 text-sm">{signal.value}</p>
                    </div>
                    <span className="text-muted-foreground">
                      <Icon icon={signal.icon} size={19} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
            <span>built for pnpm, npm, yarn, and bun projects</span>
            <Button
              asChild
              variant="outline"
              className="h-8 rounded-none border-dashed"
            >
              <a href="https://github.com/01shrvan/packdaddy">
                source
                <Icon icon={ArrowRight02Icon} size={14} />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
