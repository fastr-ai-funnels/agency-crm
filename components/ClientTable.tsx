import { Client } from "@prisma/client";
import { createClient } from "@/lib/actions";

const tierLabels: Record<string, string> = {
  STANDARD: "Standard",
  PERFORMANCE: "Performance",
  ADVISORY: "Advisory",
};

type ClientTableProps = {
  clients: Client[];
};

export function ClientTable({ clients }: ClientTableProps) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="text-sm text-white/60">{clients.length} retained accounts</p>
        </div>
        <form action={createClient} className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <input name="companyName" placeholder="Company" className="input" required />
          <input name="pointPerson" placeholder="Point person" className="input" required />
          <input name="email" placeholder="Email" className="input" required />
          <input name="phone" placeholder="Phone" className="input" />
          <select name="tier" className="input">
            <option value="STANDARD">Standard</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="ADVISORY">Advisory</option>
          </select>
          <input name="retainer" placeholder="Retainer $" className="input" type="number" />
          <input name="services" placeholder="Services" className="input col-span-2 md:col-span-6" />
          <button type="submit" className="col-span-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white">
            Add Client
          </button>
        </form>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr className="border-b border-white/10">
              <th className="py-2">Company</th>
              <th>Point Person</th>
              <th>Tier</th>
              <th>Services</th>
              <th>Retainer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => (
              <tr key={client.id} className="text-white/80">
                <td className="py-3">
                  <div className="font-medium text-white">{client.companyName}</div>
                  <div className="text-xs text-white/50">{client.email}</div>
                </td>
                <td>{client.pointPerson}</td>
                <td>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                    {tierLabels[client.tier] || client.tier}
                  </span>
                </td>
                <td>{client.services}</td>
                <td>{client.monthlyRetainer ? `$${client.monthlyRetainer}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
