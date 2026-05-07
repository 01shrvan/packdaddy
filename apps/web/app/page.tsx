"use client"

import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import type { ReactNode, Ref, RefObject } from "react"
import { useEffect, useRef, useState } from "react"

function CodeBlock({ code, ref }: { code: string; ref?: Ref<HTMLDivElement> }) {
  const [flash, setFlash] = useState(false)

  return (
    <div
      ref={ref}
      className={`flex items-center justify-between gap-2 border border-dashed bg-muted px-3 py-2 font-mono text-xs transition-colors hover:border-foreground/30 ${flash ? "border-foreground/50" : "border-border"}`}
    >
      <code className="truncate text-foreground">{code}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(code)
          setFlash(true)
          setTimeout(() => setFlash(false), 300)
        }}
        className="cursor-pointer text-[9px] text-muted-foreground uppercase transition-all hover:scale-105 hover:text-foreground active:scale-95"
      >
        {flash ? "done" : "copy"}
      </button>
    </div>
  )
}

function CornerBrackets() {
  return (
    <>
      <span className="absolute right-0 bottom-0 h-2.5 w-2.5 border-r border-b border-foreground/30 transition-colors duration-300 group-hover:border-foreground" />
      <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-foreground/30 transition-colors duration-300 group-hover:border-foreground" />
      <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-foreground/30 transition-colors duration-300 group-hover:border-foreground" />
      <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-foreground/30 transition-colors duration-300 group-hover:border-foreground" />
    </>
  )
}

function StepCard({
  index,
  label,
  title,
  children,
  centered,
  bottomExtra,
}: {
  index: number
  label: string
  title: string
  children: ReactNode
  centered?: boolean
  bottomExtra?: ReactNode
}) {
  return (
    <div className="group relative flex min-h-52 flex-col overflow-hidden bg-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_8px_rgba(255,255,255,0.02)]">
      <div className="absolute top-2 right-2 z-10 flex size-5 items-center justify-center rounded-full border border-border bg-background font-mono text-[8px]">
        {index + 1}
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-[1] px-4 pt-0.5">
        <span className="font-mono text-[8px] text-muted-foreground">
          Step {index + 1} - {label}
        </span>
        <h2 className="font-pixel-square -mt-0.5 mb-0 text-sm tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div
        className={
          centered
            ? "mt-2 grid flex-1 grid-rows-[1fr_auto_1fr] p-4 pt-10"
            : "flex flex-1 flex-col p-4 pt-10"
        }
      >
        <div
          className={
            centered
              ? "flex flex-col justify-center gap-2"
              : "flex flex-1 flex-col justify-center gap-2"
          }
        >
          {children}
        </div>
        {bottomExtra && <div className="mt-2 self-start">{bottomExtra}</div>}
      </div>
      <CornerBrackets />
    </div>
  )
}

type Rect = {
  left: number
  right: number
  cx: number
  cy: number
}

function getRect(el: HTMLElement, container: HTMLElement): Rect {
  const er = el.getBoundingClientRect()
  const cr = container.getBoundingClientRect()
  const left = er.left - cr.left
  const right = left + er.width
  const top = er.top - cr.top
  const bottom = top + er.height

  return {
    left,
    right,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
  }
}

function GridConnectors({
  containerRef,
  refs,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  refs: readonly [
    RefObject<HTMLDivElement | null>,
    RefObject<HTMLDivElement | null>,
  ]
}) {
  const [line, setLine] = useState<{
    x1: number
    y1: number
    x2: number
    y2: number
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const update = () => {
      const [leftEl, rightEl] = refs.map((r) => r.current)
      if (!leftEl || !rightEl) {
        return
      }

      const left = getRect(leftEl, container)
      const right = getRect(rightEl, container)
      setLine({
        x1: left.right,
        y1: left.cy,
        x2: right.left,
        y2: right.cy,
      })
    }

    requestAnimationFrame(update)

    const ro = new ResizeObserver(update)
    ro.observe(container)
    refs.forEach((nodeRef) => {
      if (nodeRef.current) {
        ro.observe(nodeRef.current)
      }
    })
    window.addEventListener("resize", update)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [refs, containerRef])

  if (!line) {
    return null
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 hidden overflow-visible md:block"
      width="100%"
      height="100%"
    >
      <title>packdaddy scan connector</title>
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke="var(--border)"
        strokeDasharray="4 3"
        strokeWidth={1}
      />
      <circle
        cx={line.x1}
        cy={line.y1}
        r={4}
        fill="var(--background)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <circle
        cx={line.x2}
        cy={line.y2}
        r={4}
        fill="var(--background)"
        stroke="var(--border)"
        strokeWidth={1}
      />
    </svg>
  )
}

export default function Page() {
  const gridRef = useRef<HTMLDivElement>(null)
  const ref0 = useRef<HTMLDivElement>(null)
  const ref1 = useRef<HTMLDivElement>(null)
  const nodeRefs = [ref0, ref1] as const

  return (
    <div className="mx-auto flex h-screen w-full max-w-7xl flex-col overflow-hidden border-x">
      <nav className="font-pixel-square relative flex items-center justify-between px-4 py-4">
        <Link href="/" className="transition-opacity hover:opacity-80">
          packdaddy
        </Link>
        <div className="absolute bottom-0 left-0 z-10 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute right-0 bottom-0 z-10 size-2.5 translate-x-1/2 translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute bottom-0 left-1/2 w-screen -translate-x-1/2 border-b" />
      </nav>

      <main className="flex flex-1 items-center justify-center overflow-hidden px-6">
        <div className="w-full max-w-5xl">
          <div className="mb-8 text-center">
            <span className="text-[8px] tracking-[0.2em] text-muted-foreground uppercase">
              package.json intelligence
            </span>
            <h1 className="font-pixel-square mt-1 text-2xl">
              Audit dependencies without opening five tabs
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Find unused packages, outdated versions, audit warnings, and size
              signals from one focused CLI flow built for messy JavaScript
              projects.
            </p>
          </div>

          <div
            ref={gridRef}
            className="relative grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2"
          >
            <StepCard
              index={0}
              label="Inspect"
              title="Scan the current project"
              centered
            >
              <CodeBlock ref={ref0} code="pnpm dlx packdaddy@latest" />
              <CodeBlock code="packdaddy --unused --outdated" />
            </StepCard>

            <StepCard
              index={1}
              label="Decide"
              title="Review dependency findings"
              centered
              bottomExtra={
                <a
                  href="https://github.com/01shrvan/packdaddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/cta relative inline-block w-fit"
                >
                  <Button
                    variant="outline"
                    className="relative h-8 cursor-pointer overflow-hidden rounded-none border-dashed px-3 py-1 focus-visible:ring-0"
                  >
                    <span className="shine pointer-events-none absolute -top-1/2 -left-full z-20 h-[200%] w-3/4 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/40 to-transparent" />
                    <span className="flex items-center gap-1.5 text-[9px] font-medium text-foreground transition-all duration-300 group-hover/cta:gap-2.5">
                      View on GitHub
                      <span className="text-[11px]">-&gt;</span>
                    </span>
                  </Button>
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 border-r border-b border-foreground/30 transition-colors duration-300 group-hover/cta:border-foreground" />
                  <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-foreground/30 transition-colors duration-300 group-hover/cta:border-foreground" />
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-foreground/30 transition-colors duration-300 group-hover/cta:border-foreground" />
                  <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-foreground/30 transition-colors duration-300 group-hover/cta:border-foreground" />
                </a>
              }
            >
              <CodeBlock ref={ref1} code="packdaddy --json --audit" />
            </StepCard>

            <GridConnectors containerRef={gridRef} refs={nodeRefs} />
          </div>
        </div>
      </main>

      <footer className="font-pixel-square relative px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            dependency cleanup for modern JS repos
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a
              href="https://github.com/01shrvan/packdaddy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              github
            </a>
            <span className="text-3xl leading-none">&middot;</span>
            <a
              href="https://www.npmjs.com/package/packdaddy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              npm
            </a>
          </div>
        </div>
        <div className="absolute top-0 left-0 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute top-0 right-0 z-10 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute top-0 left-1/2 w-screen -translate-x-1/2 border-t" />
      </footer>
    </div>
  )
}
