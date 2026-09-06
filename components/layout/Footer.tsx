import Link from "next/link";
import { methodologyEntries } from "@/data/methodology";
import { navigation } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="workspace-width site-footer__inner">
        <div>
          <p className="eyebrow">Threat-hunting field guide</p>
          <p>
            hunt-tricks connects suspicious behavior across identities, systems, and AI to testable hypotheses and cited evidence.
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
        <nav aria-label="Methods"><ul>{methodologyEntries.map((entry) => <li key={entry.id}><Link href={`${entry.route}/`}>{entry.title}</Link></li>)}</ul></nav>
      </div>
    </footer>
  );
}
