"use client";

import { useState, useRef, useTransition } from "react";
import { Client } from "@prisma/client";
import { Pencil, Trash2, X } from "lucide-react";
import { createClient, updateClient, deleteClient } from "@/lib/actions";

const tierLabels: Record<string, string> = {
  STANDARD: "Standard",
  PERFORMANCE: "Performance",
  ADVISORY: "Advisory",
};

const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CHURNED: "Churned",
};

const stageBadgeColors: Record<string, string> = {
  LEAD: "bg-blue-500/20 text-blue-300",
  ACTIVE: "bg-green-500/20 text-green-300",
  PAUSED: "bg-yellow-500/20 text-yellow-300",
  CHURNED: "bg-red-500/20 text-red-300",
};

type ClientTableProps = {
  clients: Client[];
};

export function ClientTable({ clients }: ClientTableProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const activeClients = clients.filter((c) => c.stage === "ACTIVE").length;

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createClient(formData);
      formRef.current?.reset();
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editingClient) return;
    startTransition(async () => {
      await updateClient(editingClient.id, formData);
      setEditingClient(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this client and all their projects and tasks?")) return;
    startTransition(async () => {
      await deleteClient(id);
    });
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Clients</h2>
        <p className="text-sm text-white/60">
          {activeClients} active · {clients.length} total
        </p>
      </div>

      {/* Add Client Form */}
      <form
        ref={formRef}
        action={handleCreate}
        className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6"
      >
        <input name="companyName" placeholder="Company *" className="input" required />
        <input name="pointPerson" placeholder="Point person *" className="input" required />
        <input name="email" placeholder="Email *" className="input" type="email" required />
        <input name="phone" placeholder="Phone" className="input" />
        <select name="tier" className="input">
          <option value="STANDARD">Standard</option>
          <option value="PERFORMANCE">Performance</option>
          <option value="ADVISORY">Advisory</option>
        </select>
        <select name="stage" className="input">
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CHURNED">Churned</option>
        </select>
        <input
          name="retainer"
          placeholder="Retainer $"
          className="input"
          type="number"
          min="0"
        />
        <input name="frameioLink" placeholder="Frame.io link" className="input" />
        <input
          name="services"
          placeholder="Services"
          className="input col-span-2 md:col-span-4"
        />
        <button
          type="submit"
          disabled={isPending}
          className="col-span-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white active:scale-95 transition-transform disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Add Client"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-4">Company</th>
              <th className="pr-4">Contact</th>
              <th className="pr-4">Stage</th>
              <th className="pr-4">Tier</th>
              <th className="pr-4">Services</th>
              <th className="pr-4">Retainer</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-white/30 text-sm">
                  No clients yet — add your first one above
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="text-white/80">
                <td className="py-3 pr-4">
                  <div className="font-medium text-white">{client.companyName}</div>
                  <div className="text-xs text-white/50">{client.email}</div>
                  {client.frameioLink && (
                    <a
                      href={client.frameioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Frame.io ↗
                    </a>
                  )}
                </td>
                <td className="pr-4">{client.pointPerson}</td>
                <td className="pr-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      stageBadgeColors[client.stage] ?? "bg-white/10 text-white"
                    }`}
                  >
                    {stageLabels[client.stage] ?? client.stage}
                  </span>
                </td>
                <td className="pr-4">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                    {tierLabels[client.tier] ?? client.tier}
                  </span>
                </td>
                <td className="pr-4 max-w-[140px] truncate text-white/70">
                  {client.services || "—"}
                </td>
                <td className="pr-4 whitespace-nowrap">
                  {client.monthlyRetainer
                    ? `$${client.monthlyRetainer.toLocaleString()}`
                    : "—"}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingClient(client)}
                      className="rounded-full border border-white/10 p-1.5 hover:border-white/30 active:scale-95 transition-transform"
                      title="Edit client"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(client.id)}
                      disabled={isPending}
                      className="rounded-full border border-white/10 p-1.5 hover:border-red-500/40 hover:text-red-400 active:scale-95 transition-transform disabled:opacity-50"
                      title="Delete client"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Edit Client</h3>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form action={handleUpdate} className="grid grid-cols-2 gap-3">
              <input
                name="companyName"
                defaultValue={editingClient.companyName}
                placeholder="Company *"
                className="input"
                required
              />
              <input
                name="pointPerson"
                defaultValue={editingClient.pointPerson}
                placeholder="Point person *"
                className="input"
                required
              />
              <input
                name="email"
                defaultValue={editingClient.email}
                placeholder="Email *"
                className="input"
                type="email"
                required
              />
              <input
                name="phone"
                defaultValue={editingClient.phone ?? ""}
                placeholder="Phone"
                className="input"
              />
              <select name="tier" defaultValue={editingClient.tier} className="input">
                <option value="STANDARD">Standard</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="ADVISORY">Advisory</option>
              </select>
              <select name="stage" defaultValue={editingClient.stage} className="input">
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CHURNED">Churned</option>
              </select>
              <input
                name="retainer"
                defaultValue={editingClient.monthlyRetainer ?? ""}
                placeholder="Retainer $"
                className="input"
                type="number"
                min="0"
              />
              <input
                name="frameioLink"
                defaultValue={editingClient.frameioLink ?? ""}
                placeholder="Frame.io link"
                className="input"
              />
              <input
                name="services"
                defaultValue={editingClient.services}
                placeholder="Services"
                className="input col-span-2"
              />
              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-white/40 active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
