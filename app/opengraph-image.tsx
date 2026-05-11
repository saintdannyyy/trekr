import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Trekr — Track every application. Land what's next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e2d4a 60%, #1a3a6e 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 48px, #ffffff 48px, #ffffff 49px), repeating-linear-gradient(90deg, transparent, transparent 48px, #ffffff 48px, #ffffff 49px)",
        }}
      />

      {/* Glow orb top right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Glow orb bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          zIndex: 1,
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* T icon simplified */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: 42,
                fontWeight: 900,
                fontFamily: "sans-serif",
                lineHeight: 1,
              }}
            >
              T
            </div>
            {/* Sun dot */}
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 12px rgba(245,158,11,0.8)",
              }}
            />
          </div>

          {/* Wordmark */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              fontFamily: "sans-serif",
              letterSpacing: -2,
            }}
          >
            TREKR
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "sans-serif",
            fontWeight: 400,
            textAlign: "center",
            letterSpacing: 0.3,
          }}
        >
          Track every application. Land what&apos;s next.
        </div>

        {/* Pill tags */}
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {["Applications", "Interviews", "Offers", "Analytics"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 16,
                  fontFamily: "sans-serif",
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Bottom URL strip */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#6366f1",
          }}
        />
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
            fontFamily: "sans-serif",
          }}
        >
          trekr.vercel.app
        </span>
      </div>
    </div>,
    { ...size },
  );
}
