import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "packdaddy — audit your deps, no bloat"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const ANALYZERS = [
  { symbol: "×", name: "unused", color: "#ef4444" },
  { symbol: "↑", name: "outdated", color: "#eab308" },
  { symbol: "⚠", name: "audit", color: "#f97316" },
  { symbol: "≈", name: "size", color: "#3b82f6" },
]

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 72px",
        fontFamily: "monospace",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 20,
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          pointerEvents: "none",
        }}
      />

      {[
        {
          top: 20,
          left: 20,
          borderTop: "1px solid rgba(255,255,255,0.25)",
          borderLeft: "1px solid rgba(255,255,255,0.25)",
        },
        {
          top: 20,
          right: 20,
          borderTop: "1px solid rgba(255,255,255,0.25)",
          borderRight: "1px solid rgba(255,255,255,0.25)",
        },
        {
          bottom: 20,
          left: 20,
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          borderLeft: "1px solid rgba(255,255,255,0.25)",
        },
        {
          bottom: 20,
          right: 20,
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          borderRight: "1px solid rgba(255,255,255,0.25)",
        },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            ...s,
            display: "flex",
          }}
        />
      ))}

      <div style={{ display: "flex", marginBottom: 32 }}>
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
          }}
        >
          dependency intelligence · cli
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 48,
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          packdaddy
        </span>
        <span
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.4,
          }}
        >
          Audit your deps. No bloat.
        </span>
      </div>

      <div style={{ display: "flex", gap: 48, marginBottom: "auto" }}>
        {ANALYZERS.map((a) => (
          <div
            key={a.name}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span style={{ fontSize: 22, color: a.color, lineHeight: 1 }}>
              {a.symbol}
            </span>
            <span
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {a.name}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            border: "1px dashed rgba(255,255,255,0.18)",
            padding: "14px 22px",
            display: "flex",
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.02em",
            }}
          >
            npx packdaddy --all
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          npm · pnpm · yarn · bun
        </span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.15)" }}>
          packdaddy.vercel.app
        </span>
      </div>
    </div>,
    { ...size }
  )
}
