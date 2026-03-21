import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Equanima — Where ancient wisdom meets modern challenges";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1c1c1e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top gold bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
        }} />

        {/* Dot grid texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(201,168,76,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Sparkle */}
        <div style={{ fontSize: 56, color: "#c9a84c", marginBottom: 28, lineHeight: 1 }}>✦</div>

        {/* Title */}
        <div style={{
          fontSize: 90, fontWeight: 700, color: "#c9a84c",
          letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1,
        }}>
          Equanima
        </div>

        {/* Divider */}
        <div style={{
          width: 140, height: 1, background: "#c9a84c",
          opacity: 0.4, marginBottom: 28,
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: 26, color: "#c8bfaf", letterSpacing: "0.18em",
          textTransform: "uppercase", fontFamily: "Arial, sans-serif",
          fontWeight: 300, marginBottom: 56,
        }}>
          Where ancient wisdom meets modern challenges
        </div>

        {/* Tradition tags */}
        <div style={{ display: "flex", gap: 12 }}>
          {["Stoicism", "Buddhism", "Existentialism", "Taoism"].map((t) => (
            <div key={t} style={{
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 999, padding: "8px 20px",
              fontSize: 15, color: "#c9a84c",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.08em",
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* Bottom gold bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
        }} />
      </div>
    ),
    { ...size }
  );
}
