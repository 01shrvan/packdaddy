"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const ANALYZERS = [
  { id: "01", symbol: "×", name: "unused",   desc: "Scans every import. Flags packages in package.json never referenced in source.", cmd: "packdaddy --unused",   accent: "#ef4444", bg: "rgba(239,68,68,0.06)" },
  { id: "02", symbol: "↑", name: "outdated", desc: "Queries npm registry directly. Reports every dep with a newer version available.",  cmd: "packdaddy --outdated", accent: "#eab308", bg: "rgba(234,179,8,0.06)"   },
  { id: "03", symbol: "⚠", name: "audit",    desc: "Hits npm advisory API. Surfaces known CVEs without running npm audit.",             cmd: "packdaddy --audit",    accent: "#f97316", bg: "rgba(249,115,22,0.06)" },
  { id: "04", symbol: "≈", name: "size",     desc: "Walks node_modules. Ranks your heaviest installed packages by disk footprint.",     cmd: "packdaddy --size",     accent: "#3b82f6", bg: "rgba(59,130,246,0.06)"  },
] as const

function CopyBtn({ code, accent, large }: { code: string; accent?: string; large?: boolean }) {
  const [done, setDone] = useState(false)
  const ac = accent ?? "var(--foreground)"
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(code); setDone(true); setTimeout(() => setDone(false), 1500) }}
      className="relative flex w-full shrink-0 items-center justify-between border border-dashed text-left active:scale-[0.99]"
      style={{ padding: large ? "9px 14px" : "6px 11px", borderColor: done ? ac : "var(--border)", background:"transparent", transition:"border-color 0.2s, transform 0.1s" }}
    >
      {(["tl","tr","bl","br"] as const).map((c) => (
        <span key={c} style={{
          position:"absolute",
          top: c.startsWith("t") ? 0 : undefined, bottom: c.startsWith("b") ? 0 : undefined,
          left: c.endsWith("l") ? 0 : undefined,   right: c.endsWith("r") ? 0 : undefined,
          width:6, height:6,
          borderTop:    c.startsWith("t") ? `1px solid ${done ? ac : "var(--border)"}` : undefined,
          borderBottom: c.startsWith("b") ? `1px solid ${done ? ac : "var(--border)"}` : undefined,
          borderLeft:   c.endsWith("l")   ? `1px solid ${done ? ac : "var(--border)"}` : undefined,
          borderRight:  c.endsWith("r")   ? `1px solid ${done ? ac : "var(--border)"}` : undefined,
          transition:"border-color 0.2s",
        }} />
      ))}
      <code style={{ fontFamily:"var(--font-mono)", fontSize: large ? "clamp(11px,1.4vw,13px)" : "clamp(10px,1.2vw,12px)", color:"var(--foreground)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {code}
      </code>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:"clamp(9px,1vw,11px)", letterSpacing:"0.1em", textTransform:"uppercase", color: done ? ac : "var(--muted-foreground)", marginLeft:12, flexShrink:0, transition:"color 0.2s" }}>
        {done ? "✓" : "copy"}
      </span>
    </button>
  )
}

export default function Page() {
  const [hovered, setHovered]   = useState<number | null>(null)
  const [scanY, setScanY]       = useState(-2)
  const [scanning, setScanning] = useState(false)
  const gridRef  = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const go = () => {
      const h = gridRef.current?.getBoundingClientRect().height ?? 320
      const dur = 2000, t0 = performance.now()
      setScanY(-2); setScanning(true)
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1)
        setScanY(-2 + (h + 4) * (1 - (1 - p) * (1 - p)))
        if (p < 1) { rafRef.current = requestAnimationFrame(tick) }
        else { setScanning(false); timerRef.current = setTimeout(go, 5500) }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    timerRef.current = setTimeout(go, 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current) }
  }, [])

  const ha = hovered !== null ? ANALYZERS[hovered] : null

  return (
    <div
      className="mx-auto flex h-dvh w-full flex-col overflow-hidden border-x border-border"
      style={{ maxWidth: 940, fontFamily:"var(--font-mono)" }}
    >
      {/* NAV */}
      <nav className="relative flex shrink-0 items-center justify-between" style={{ padding:"clamp(10px,2vh,16px) clamp(14px,2.5vw,24px)" }}>
        <Link href="/" className="transition-opacity hover:opacity-30"
          style={{ fontSize:"clamp(11px,1.4vw,13px)", letterSpacing:"0.2em", textTransform:"uppercase", opacity:.8 }}>
          packdaddy
        </Link>
        <div className="absolute bottom-0 left-1/2 w-screen -translate-x-1/2 border-b border-border" />
        <div className="absolute bottom-0 left-0  z-10 size-2 -translate-x-1/2  translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute bottom-0 right-0 z-10 size-2  translate-x-1/2  translate-y-1/2 rounded-full border border-border bg-background" />
        <div style={{ display:"flex", alignItems:"center", gap:"clamp(16px,2.5vw,28px)" }}>
          {[["github","https://github.com/01shrvan/packdaddy"],["npm","https://www.npmjs.com/package/packdaddy"]].map(([l,h]) => (
            <a key={l} href={h} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontSize:"clamp(11px,1.3vw,13px)", letterSpacing:"0.12em", textTransform:"uppercase" }}>
              {l}
            </a>
          ))}
        </div>
      </nav>

      {/* MAIN */}
      <main
        className="flex flex-1 flex-col items-center justify-center overflow-hidden"
        style={{ padding:"clamp(10px,1.5vh,20px) clamp(14px,2.5vw,24px)" }}
      >
        <div className="flex w-full min-h-0 flex-1 flex-col" style={{ maxWidth:820, gap:"clamp(8px,1.5vh,16px)" }}>

          {/* Hero */}
          <div className="flex shrink-0 items-end justify-between gap-4">
            <div>
              <p style={{ fontSize:"clamp(9px,1vw,11px)", letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--muted-foreground)", opacity:.6, marginBottom:"clamp(4px,0.8vh,8px)" }}>
                package.json intelligence
              </p>
              <h1 style={{ fontSize:"clamp(1.3rem,3.5vw,2.5rem)", fontWeight:600, lineHeight:1.08, letterSpacing:"-0.02em" }}>
                Audit your deps.{" "}
                <span style={{ color:"var(--muted-foreground)", fontWeight:400 }}>No bloat.</span>
              </h1>
            </div>
            <p className="hidden shrink-0 text-right sm:block"
              style={{ fontSize:"clamp(10px,1.1vw,12px)", color:"var(--muted-foreground)", opacity:.55, lineHeight:1.9 }}>
              npm · pnpm<br />yarn · bun
            </p>
          </div>

          {/* Grid — flex-1 fills remaining space between hero and CTA */}
          <div className="relative min-h-0 flex-1" style={{ background:"var(--border)" }}>
            <div
              ref={gridRef}
              className="h-full"
              style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:"1px" }}
            >
              {/* scan line */}
              {scanning && (
                <div className="pointer-events-none absolute inset-x-0 z-30" style={{
                  top:scanY, height:1,
                  background:`linear-gradient(90deg,transparent 0%,${ha?.accent ?? "var(--foreground)"} 20%,${ha?.accent ?? "var(--foreground)"} 80%,transparent 100%)`,
                  opacity:.18,
                  boxShadow:`0 0 12px 4px ${ha?.accent ?? "var(--foreground)"}30`,
                }} />
              )}

              {ANALYZERS.map((a, i) => {
                const on = hovered === i
                return (
                  <div key={a.name} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                    className="relative flex min-h-0 flex-col overflow-hidden bg-background"
                    style={{
                      padding:"clamp(12px,1.8vh,20px) clamp(14px,2vw,22px)",
                      backgroundColor: on ? a.bg : undefined,
                      transition:"background-color 0.25s",
                    }}
                  >
                    {/* accent top bar */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:a.accent, opacity: on ? 1 : 0, transform: on ? "scaleX(1)" : "scaleX(0.4)", transformOrigin:"left", transition:"opacity 0.25s, transform 0.3s" }} />

                    {/* corner brackets */}
                    {(["tl","tr","bl","br"] as const).map((c) => (
                      <span key={c} style={{
                        position:"absolute",
                        top: c.startsWith("t") ? 0 : undefined, bottom: c.startsWith("b") ? 0 : undefined,
                        left: c.endsWith("l") ? 0 : undefined,   right: c.endsWith("r") ? 0 : undefined,
                        width:9, height:9,
                        borderTop:    c.startsWith("t") ? `1px solid ${on ? a.accent : "var(--border)"}` : undefined,
                        borderBottom: c.startsWith("b") ? `1px solid ${on ? a.accent : "var(--border)"}` : undefined,
                        borderLeft:   c.endsWith("l")   ? `1px solid ${on ? a.accent : "var(--border)"}` : undefined,
                        borderRight:  c.endsWith("r")   ? `1px solid ${on ? a.accent : "var(--border)"}` : undefined,
                        transition:"border-color 0.25s",
                      }} />
                    ))}

                    {/* index */}
                    <span style={{ fontSize:"clamp(9px,0.9vw,11px)", color: on ? a.accent : "var(--muted-foreground)", opacity: on ? .8 : .35, marginBottom:"clamp(6px,1vh,12px)", flexShrink:0, transition:"color .25s,opacity .25s" }}>
                      {a.id}
                    </span>

                    {/* symbol + name */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"clamp(6px,1vh,12px)", flexShrink:0 }}>
                      <span style={{ fontSize:"clamp(1.4rem,2.8vw,2.2rem)", lineHeight:1, color: on ? a.accent : "var(--muted-foreground)", opacity: on ? 1 : .35, transition:"color .25s, opacity .25s" }}>
                        {a.symbol}
                      </span>
                      <span style={{ fontSize:"clamp(11px,1.3vw,13px)", fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color: on ? a.accent : "var(--foreground)", transition:"color .25s" }}>
                        {a.name}
                      </span>
                    </div>

                    {/* desc */}
                    <p style={{ fontSize:"clamp(10px,1.1vw,12px)", lineHeight:1.7, color:"var(--muted-foreground)", opacity: on ? .8 : .6, flex:1, marginBottom:"clamp(8px,1.2vh,14px)", overflow:"hidden", transition:"opacity .25s" }}>
                      {a.desc}
                    </p>

                    {/* cmd */}
                    <CopyBtn code={a.cmd} accent={a.accent} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="flex shrink-0 flex-col items-center" style={{ gap:"clamp(4px,0.8vh,8px)" }}>
            <CopyBtn code="npx packdaddy --all" large />
            <p style={{ fontSize:"clamp(10px,1.1vw,12px)", color:"var(--muted-foreground)", opacity:.5, letterSpacing:"0.04em" }}>
              also: pnpm dlx packdaddy · bunx packdaddy · yarn dlx packdaddy
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative flex shrink-0 items-center justify-between" style={{ padding:"clamp(10px,2vh,16px) clamp(14px,2.5vw,24px)" }}>
        <div className="absolute top-0 left-1/2 w-screen -translate-x-1/2 border-t border-border" />
        <div className="absolute top-0 left-0  z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute top-0 right-0 z-10 size-2  translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
        <span style={{ fontSize:"clamp(10px,1.1vw,12px)", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)", opacity:.55 }}>
          zero deps · works anywhere
        </span>
        <span style={{ fontSize:"clamp(10px,1.1vw,12px)", color:"var(--muted-foreground)", opacity:.45 }}>
          open source
        </span>
      </footer>
    </div>
  )
}
