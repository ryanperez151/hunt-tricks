import Link from "next/link";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { navigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="site-header__inner workspace-width">
        <Link aria-label="hunt-tricks home" className="brand" href="/">
          <span>hunt-tricks</span>
          <small>Behavior / Timing / Evidence</small>
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
        <SearchTrigger />
        <MobileNavigation />
      </div>
    </header>
  );
}
