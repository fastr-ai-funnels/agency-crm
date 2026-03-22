"use client";

import { useState } from "react";
import { Client, DeliverableGroup, Deliverable, Lead } from "@prisma/client";
import { ClientTable } from "./ClientTable";
import { LeadsBoard } from "./LeadsBoard";

type EnrichedClient = Client & {
  deliverableGroups: (DeliverableGroup & { deliverables: Deliverable[] })[];
};

type Props = {
  clients: EnrichedClient[];
  leads: Lead[];
};

export function DashboardTabs({ clients, leads }: Props) {
  const [tab, setTab] = useState<"clients" | "leads">("clients");

  return (
    <div>
      <div className="flex gap-1 mb-4 rounded-full bg-white/5 p-1 w-fit">
        {(["clients", "leads"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors active:scale-95 ${
              tab === t ? "bg-accent text-black" : "text-white/50 hover:text-white"
            }`}
          >
            {t === "clients" ? `Clients (${clients.length})` : `Leads (${leads.length})`}
          </button>
        ))}
      </div>
      {tab === "clients" ? <ClientTable clients={clients} /> : <LeadsBoard leads={leads} />}
    </div>
  );
}
