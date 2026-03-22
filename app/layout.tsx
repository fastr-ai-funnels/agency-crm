import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agency OS",
  description: "Client + project control center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <header className="flex items-center gap-3 py-5 mb-2 border-b border-white/5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent font-black text-black text-sm tracking-tight select-none">
              IOR
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">IOR Marketing</p>
              <p className="text-xs text-white/40 leading-none mt-0.5">Agency OS</p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
