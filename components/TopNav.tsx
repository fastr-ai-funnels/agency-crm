"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/clients", label: "Clients" },
  { href: "/leads", label: "Leads" },
  { href: "/financials", label: "Financials" },
  { href: "/calendar", label: "Calendar" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image src="/ior-logo.png" alt="IOR Marketing" width={34} height={34} className="rounded-xl" />
          <div>
            <p className="text-sm font-bold text-white leading-none tracking-tight">IOR Marketing</p>
            <p className="text-[11px] text-white/35 leading-none mt-0.5 tracking-wide uppercase">Agency OS</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/clients"
                ? pathname === "/clients" || pathname.startsWith("/clients/")
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
