import Link from "next/link";
import { navigation } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="workspace-width site-footer__inner">
        <div>
          <p className="eyebrow">Threat-hunting field guide</p>
          <p>
            A practical reference for investigating infrastructure as a potential host, not just a source of
            telemetry.
          </p>
        </div>
        <div>
          <p className="eyebrow">Use responsibly</p>
          <p>Adapt detection logic, field names, and data models to your environment before acting.</p>
        </div>
        <nav aria-label="Footer">
          <ul>
            {navigation.slice(0, 4).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
