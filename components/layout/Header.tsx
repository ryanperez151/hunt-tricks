import Link from "next/link";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { navigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="site-header__inner workspace-width">
        <Link aria-label="Hunt the Infrastructure home" className="brand" href="/">
          <span>Hunt the Infrastructure</span>
          <small>Threat Hunting Beyond the Endpoint</small>
        </Link>
        <nav aria-label="Primary" className="desktop-navigation">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNavigation />
      </div>
    </header>
  );
}
