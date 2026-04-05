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
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0c10]/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image src="/ior-logo.png" alt="IOR Marketing" width={36} height={36} className="rounded-xl" />
          <div>
            <p className="text-sm font-semibold text-white leading-none">IOR Marketing</p>
            <p className="text-xs text-white/40 leading-none mt-0.5">Agency OS</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/clients"
                ? pathname === "/clients" || pathname.startsWith("/clients/")
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
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
