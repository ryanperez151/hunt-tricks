"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationLink({ href, children, onClick }: {
  href: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const pathname = (usePathname() ?? "/").replace(/\/$/, "") || "/";
  const destination = href.replace(/\/$/, "") || "/";
  const section = `/${destination.split("/")[1]}`;
  const current = pathname === destination
    ? "page"
    : pathname === section || pathname.startsWith(`${section}/`) ? "location" : undefined;

  return <Link aria-current={current} href={href} onClick={onClick}>{children}</Link>;
}
