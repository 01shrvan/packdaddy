"use client"

import { useState } from "react"
import Link from "next/link"

const ANALYZERS = [
  { id: "01", symbol: "×", name: "unused",   desc: "Scans every import. Flags packages listed in package.json never referenced in source.", cmd: "packdaddy --unused",   flag: "--unused",   accent: "#ef4444", bg: "rgba(239,68,68,0.04)"  },
  { id: "02", symbol: "↑", name: "outdated", desc: "Queries npm registry directly. Reports every dep with a newer published version.",       cmd: "packdaddy --outdated", flag: "--outdated", accent: "#eab308", bg: "rgba(234,179,8,0.04)"  },
  { id: "03", symbol: "⚠", name: "audit",    desc: "Hits npm advisory API. Surfaces known CVEs without running npm audit.",                  cmd: "packdaddy --audit",    flag: "--audit",    accent: "#f97316", bg: "rgba(249,115,22,0.04)" },
  { id: "04", symbol: "≈", name: "size",     desc: "Walks node_modules recursively. Ranks your heaviest packages by disk footprint.",        cmd: "packdaddy --size",     flag: "--size",     accent: "#3b82f6", bg: "rgba(59,130,246,0.04)" },
] as const

function useCopy(text: string, delay = 1400) {
  const [done, setDone] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setDone(true)
    setTimeout(() => setDone(false), delay)
  }
  return { done, copy }
}

function CopyPill({ code, accent }: { code: string; accent?: string }) {
  const { done, copy } = useCopy(code)
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); copy() }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        border: `1px dashed ${done ? (accent ?? "rgba(255,255,255,0.4)") : "rgba(255,255,255,0.1)"}`,
        background: "transparent",
        padding: "5px 12px",
        cursor: "pointer",
        flexShrink: 0,
        transition: "border-color 0.2s",
      }}
    >
      <code style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(10px,1.1vw,12px)", color: "var(--foreground)", whiteSpace: "nowrap" }}>
        {code}
      </code>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: done ? (accent ?? "var(--foreground)") : "var(--muted-foreground)", transition: "color 0.2s", flexShrink: 0 }}>
        {done ? "✓" : "copy"}
      </span>
    </button>
  )
}

export default function Page() {
  const [hovered, setHovered] = useState<number | null>(null)
  const { done: ctaDone, copy: ctaCopy } = useCopy("npx packdaddy --all")

  return (
    <div
      style={{ fontFamily: "var(--font-mono)", maxWidth: 960 }}
      className="mx-auto flex h-dvh w-full flex-col overflow-hidden border-x border-border"
    >

      {/* NAV */}
      <nav className="relative flex shrink-0 items-center justify-between" style={{ padding: "clamp(10px,1.8vh,18px) clamp(16px,2.5vw,28px)" }}>
        <Link href="/" className="transition-opacity hover:opacity-40"
          style={{ fontSize: "clamp(11px,1.3vw,13px)", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--foreground)" }}>
          packdaddy
        </Link>
        <div className="absolute bottom-0 left-1/2 w-screen -translate-x-1/2 border-b border-border" />
        <div className="absolute bottom-0 left-0  z-10 size-2 -translate-x-1/2  translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute bottom-0 right-0 z-10 size-2  translate-x-1/2  translate-y-1/2 rounded-full border border-border bg-background" />
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(20px,2.5vw,32px)" }}>
          {[["github", "https://github.com/01shrvan/packdaddy"], ["npm", "https://www.npmjs.com/package/packdaddy"]].map(([l, h]) => (
            <a key={l} href={h} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontSize: "clamp(11px,1.2vw,13px)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {l}
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div className="shrink-0" style={{ padding: "clamp(16px,2.5vh,28px) clamp(16px,2.5vw,28px) clamp(12px,2vh,22px)" }}>
        <p style={{ fontSize: "clamp(9px,0.95vw,11px)", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted-foreground)", opacity: 0.55, marginBottom: "clamp(6px,1vh,10px)" }}>
          package.json intelligence
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem,3.8vw,3rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--foreground)", margin: 0 }}>
          Know your deps.{" "}
          <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>Ship clean.</span>
        </h1>
      </div>

      {/* ANALYZER ROWS */}
      <div className="flex min-h-0 flex-1 flex-col" style={{ borderTop: "1px solid var(--border)" }}>
        {ANALYZERS.map((a, i) => {
          const on = hovered === i
          return (
            <div
              key={a.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex min-h-0 flex-1 items-center transition-all duration-200"
              style={{
                padding: "0 clamp(16px,2.5vw,28px)",
                backgroundColor: on ? a.bg : "transparent",
                borderBottom: "1px solid var(--border)",
                gap: "clamp(12px,2vw,24px)",
              }}
            >
              {/* left accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0, width: 2,
                background: a.accent,
                opacity: on ? 1 : 0,
                transition: "opacity 0.2s",
              }} />

              {/* index */}
              <span style={{
                fontSize: "clamp(9px,0.85vw,11px)",
                color: on ? a.accent : "var(--muted-foreground)",
                opacity: on ? 0.8 : 0.3,
                flexShrink: 0,
                transition: "color 0.2s, opacity 0.2s",
                width: "1.8em",
              }}>
                {a.id}
              </span>

              {/* symbol */}
              <span style={{
                fontSize: "clamp(1.4rem,2.5vw,2rem)",
                lineHeight: 1,
                color: on ? a.accent : "var(--muted-foreground)",
                opacity: on ? 1 : 0.3,
                flexShrink: 0,
                transition: "color 0.2s, opacity 0.2s",
                width: "1.6em",
              }}>
                {a.symbol}
              </span>

              {/* name */}
              <span style={{
                fontSize: "clamp(11px,1.3vw,14px)",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: on ? a.accent : "var(--foreground)",
                flexShrink: 0,
                transition: "color 0.2s",
                width: "clamp(70px,9vw,110px)",
              }}>
                {a.name}
              </span>

              {/* desc */}
              <span className="hidden sm:block" style={{
                fontSize: "clamp(10px,1.05vw,12px)",
                color: "var(--muted-foreground)",
                opacity: on ? 0.75 : 0.45,
                flex: 1,
                lineHeight: 1.6,
                transition: "opacity 0.2s",
              }}>
                {a.desc}
              </span>

              {/* copy pill */}
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <CopyPill code={a.cmd} accent={a.accent} />
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="shrink-0" style={{ padding: "clamp(12px,2vh,20px) clamp(16px,2.5vw,28px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,2vw,24px)", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={ctaCopy}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              border: `1px dashed ${ctaDone ? "var(--foreground)" : "var(--border)"}`,
              background: "transparent",
              padding: "clamp(8px,1.2vh,12px) clamp(14px,2vw,20px)",
              cursor: "pointer",
              transition: "border-color 0.2s",
              position: "relative",
            }}
          >
            {/* corner brackets on CTA */}
            {(["tl","tr","bl","br"] as const).map((c) => (
              <span key={c} style={{
                position: "absolute",
                top: c.startsWith("t") ? 0 : undefined, bottom: c.startsWith("b") ? 0 : undefined,
                left: c.endsWith("l") ? 0 : undefined, right: c.endsWith("r") ? 0 : undefined,
                width: 7, height: 7,
                borderTop:    c.startsWith("t") ? `1px solid ${ctaDone ? "var(--foreground)" : "var(--border)"}` : undefined,
                borderBottom: c.startsWith("b") ? `1px solid ${ctaDone ? "var(--foreground)" : "var(--border)"}` : undefined,
                borderLeft:   c.endsWith("l")   ? `1px solid ${ctaDone ? "var(--foreground)" : "var(--border)"}` : undefined,
                borderRight:  c.endsWith("r")   ? `1px solid ${ctaDone ? "var(--foreground)" : "var(--border)"}` : undefined,
                transition: "border-color 0.2s",
              }} />
            ))}
            <code style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(12px,1.4vw,15px)", color: "var(--foreground)" }}>
              npx packdaddy --all
            </code>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: ctaDone ? "var(--foreground)" : "var(--muted-foreground)", transition: "color 0.2s" }}>
              {ctaDone ? "✓ copied" : "copy"}
            </span>
          </button>
          <span style={{ fontSize: "clamp(9px,1vw,11px)", color: "var(--muted-foreground)", opacity: 0.4 }}>
            also: pnpm dlx packdaddy · bunx packdaddy
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative flex shrink-0 items-center justify-between" style={{ padding: "clamp(10px,1.8vh,16px) clamp(16px,2.5vw,28px)" }}>
        <div className="absolute top-0 left-1/2 w-screen -translate-x-1/2 border-t border-border" />
        <div className="absolute top-0 left-0  z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute top-0 right-0 z-10 size-2  translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <span style={{ fontSize: "clamp(10px,1.1vw,12px)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)", opacity: 0.45 }}>
          zero deps · works anywhere
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,24px)" }}>
          {[["github", "https://github.com/01shrvan/packdaddy"], ["npm", "https://www.npmjs.com/package/packdaddy"]].map(([l, h]) => (
            <a key={l} href={h} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontSize: "clamp(10px,1.1vw,12px)", opacity: 0.45 }}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
