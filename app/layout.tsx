import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Agency OS",
  description: "Client + project control center",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
