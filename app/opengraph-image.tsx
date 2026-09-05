import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/metadata";

export const alt = `${SITE_NAME} — ${SITE_DESCRIPTION}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#07111f",
          color: "#e7eef7",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 82px",
          width: "100%",
        }}
      >
        <div style={{ color: "#45d8d1", display: "flex", fontSize: 24, letterSpacing: 5, textTransform: "uppercase" }}>
          Threat-hunting field guide
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, fontWeight: 700, letterSpacing: -4, lineHeight: 1.02 }}>
            {SITE_NAME}
          </div>
          <div style={{ color: "#9caec3", display: "flex", fontSize: 36, marginTop: 28 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
          <div style={{ background: "#f4b95d", display: "flex", height: 5, width: 150 }} />
          <div style={{ color: "#9caec3", display: "flex", fontSize: 24 }}>
            Origin matters. Infrastructure is a host.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
