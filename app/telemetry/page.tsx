import { TelemetryMatrix } from "@/components/telemetry/TelemetryMatrix";
import { telemetrySources } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Independent Telemetry Coverage",
  description: "Compare eight independent telemetry sources across command-and-control, lateral movement, discovery, and traffic manipulation investigations.",
  path: "/telemetry/",
});

export default function TelemetryPage() {
  return (
    <div className="telemetry-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Evidence outside the appliance</p>
        <h1>Independent telemetry coverage</h1>
        <p>Use this matrix to choose corroborating sources the investigated appliance does not control. Coverage describes investigative contribution, not guaranteed detection; expand any source for collection guidance and limitations.</p>
      </header>
      <TelemetryMatrix sources={telemetrySources} />
    </div>
  );
}
