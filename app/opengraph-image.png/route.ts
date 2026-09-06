import { createElement } from "react";
import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/metadata";

const size = { width: 1200, height: 630 };

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
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
        },
      },
      createElement(
        "div",
        { style: { color: "#45d8d1", display: "flex", fontSize: 24, letterSpacing: 5, textTransform: "uppercase" } },
        "Threat-hunting field guide",
      ),
      createElement(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        createElement(
          "div",
          { style: { display: "flex", fontSize: 82, fontWeight: 700, letterSpacing: -4, lineHeight: 1.02 } },
          SITE_NAME,
        ),
        createElement(
          "div",
          { style: { color: "#9caec3", display: "flex", fontSize: 36, marginTop: 28 } },
          SITE_DESCRIPTION,
        ),
      ),
      createElement(
        "div",
        { style: { alignItems: "center", display: "flex", gap: 18 } },
        createElement("div", { style: { background: "#f4b95d", display: "flex", height: 5, width: 150 } }),
        createElement(
          "div",
          { style: { color: "#9caec3", display: "flex", fontSize: 24 } },
          "Behavior. Timing. Evidence.",
        ),
      ),
    ),
    size,
  );
}
