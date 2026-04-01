"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Client, DeliverableGroup, Deliverable } from "@prisma/client";
import { createClient, updateClient, deleteClient } from "@/lib/actions";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { DeliverableManager } from "./DeliverableManager";

type EnrichedClient = Client & {
  deliverableGroups: (DeliverableGroup & { deliverables: Deliverable[] })[];
};

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const stageBadge: Record<string, string> = {
  LEAD: "bg-blue-500/20 text-blue-300",
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  CHURNED: "bg-red-500/20 text-red-400",
};

type Props = { clients: EnrichedClient[] };

export function ClientTable({ clients }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingClient, setEditingClient] = useState<EnrichedClient | null>(null);
  const [showDeliverables, setShowDeliverables] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="text-sm text-white/60">
            {clients.filter((c) => c.stage === "ACTIVE").length} active ·{" "}
            {clients.length} total
          </p>
        </div>
        <form
          ref={formRef}
          action={(fd) => {
            startTransition(async () => {
              await createClient(fd);
              formRef.current?.reset();
            });
          }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4 w-full"
        >
          <input name="companyName" placeholder="Company *" className="input" required />
          <input name="owner" placeholder="Owner *" className="input" required />
          <input name="email" placeholder="Email *" className="input" type="email" required />
          <input name="phone" placeholder="Phone" className="input" />
          <select name="tier" className="input">
            <option value="FULL_SYSTEM">Full System</option>
            <option value="AI_AGENT_AUTOMATIONS">AI Agent + Automations</option>
            <option value="AI_AGENT_ONLY">AI Agent Only</option>
            <option value="AUTOMATIONS_ONLY">Automations Only</option>
            <option value="AI_AD_CAMPAIGN">AI Ad Campaign Only</option>
          </select>
          <select name="stage" className="input">
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CHURNED">Churned</option>
          </select>
          <input
            name="monthlyRetainer"
            placeholder="Retainer amount"
            type="number"
            className="input"
          />
          <input
            name="termLength"
            placeholder="Term (months)"
            type="number"
            defaultValue="12"
            className="input"
          />
          <input name="frameioLink" placeholder="Frame.io link" className="input" />
          <input name="contractUrl" placeholder="Contract URL" className="input" />
          <input
            name="services"
            placeholder="Services *"
            className="input col-span-2 md:col-span-2"
            required
          />
          <input
            name="adAccountNumber"
            placeholder="Ad Account #"
            className="input"
          />
          <input
            name="adAccountLink"
            placeholder="Ad Account Link"
            className="input"
          />
          <textarea
            name="deliverablesNeeded"
            placeholder="Deliverables needed (description)"
            className="input col-span-2 md:col-span-4 resize-none h-16"
          />
          <button
            type="submit"
            disabled={isPending}
            className="col-span-2 md:col-span-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-40 active:scale-95 transition-transform"
          >
            {isPending ? "Adding..." : "Add Client"}
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-[0.2em] text-white/40">
              <th className="pb-3 pr-4">Company</th>
              <th className="pb-3 pr-4">Owner</th>
              <th className="pb-3 pr-4">Stage</th>
              <th className="pb-3 pr-4">Tier</th>
              <th className="pb-3 pr-4">Services</th>
              <th className="pb-3 pr-4">Retainer</th>
              <th className="pb-3 pr-4">Since</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="py-3 pr-4">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-white hover:text-accent transition-colors"
                  >
                    {client.companyName}
                  </Link>
                  <div className="text-xs text-white/40">{client.email}</div>
                  <div className="flex gap-2 mt-0.5">
                    {client.frameioLink && (
                      <a
                        href={client.frameioLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                      >
                        Frame.io <ExternalLink size={9} />
                      </a>
                    )}
                    {client.contractUrl && (
                      <a
                        href={client.contractUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-white/40 hover:text-white inline-flex items-center gap-1"
                      >
                        Contract <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-white/70">{client.owner}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      stageBadge[client.stage] ?? "bg-white/10 text-white/60"
                    }`}
                  >
                    {client.stage}
                  </span>
                </td>
                <td className="py-3 pr-4 text-white/60">{client.tier}</td>
                <td className="py-3 pr-4 text-white/60 max-w-[160px] truncate">
                  {client.services}
                </td>
                <td className="py-3 pr-4 text-white font-medium">
                  {client.monthlyRetainer
                    ? `$${client.monthlyRetainer.toLocaleString()}`
                    : "—"}
                </td>
                <td className="py-3 pr-4 text-white/40 text-xs whitespace-nowrap">
                  {fmtDate(client.startDate)}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setShowDeliverables(false);
                      }}
                      className="text-white/40 hover:text-white active:scale-95"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() =>
                        startTransition(() => deleteClient(client.id))
                      }
                      disabled={isPending}
                      className="text-white/40 hover:text-red-400 disabled:opacity-40 active:scale-95"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-white/30 text-sm"
                >
                  No clients yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit Client</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="text-white/40 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form
              action={(fd) => {
                startTransition(async () => {
                  await updateClient(editingClient.id, fd);
                  setEditingClient(null);
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="companyName"
                  defaultValue={editingClient.companyName}
                  placeholder="Company *"
                  className="input"
                  required
                />
                <input
                  name="owner"
                  defaultValue={editingClient.owner}
                  placeholder="Owner *"
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
                <select
                  name="tier"
                  defaultValue={editingClient.tier}
                  className="input"
                >
                  <option value="FULL_SYSTEM">Full System</option>
                  <option value="AI_AGENT_AUTOMATIONS">AI Agent + Automations</option>
                  <option value="AI_AGENT_ONLY">AI Agent Only</option>
                  <option value="AUTOMATIONS_ONLY">Automations Only</option>
                  <option value="AI_AD_CAMPAIGN">AI Ad Campaign Only</option>
                </select>
                <select
                  name="stage"
                  defaultValue={editingClient.stage}
                  className="input"
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="CHURNED">Churned</option>
                </select>
                <input
                  name="monthlyRetainer"
                  defaultValue={editingClient.monthlyRetainer ?? ""}
                  placeholder="Retainer amount"
                  type="number"
                  className="input"
                />
                <input
                  name="termLength"
                  defaultValue={editingClient.termLength ?? 12}
                  placeholder="Term (months)"
                  type="number"
                  className="input"
                />
                <input
                  name="frameioLink"
                  defaultValue={editingClient.frameioLink ?? ""}
                  placeholder="Frame.io link"
                  className="input"
                />
                <input
                  name="contractUrl"
                  defaultValue={editingClient.contractUrl ?? ""}
                  placeholder="Contract URL"
                  className="input"
                />
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-white/40">Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={toDateInput(editingClient.startDate)}
                    className="input date-input w-full"
                  />
                </div>
                <input
                  name="services"
                  defaultValue={editingClient.services}
                  placeholder="Services"
                  className="input col-span-2"
                />
                <input
                  name="adAccountNumber"
                  defaultValue={editingClient.adAccountNumber ?? ""}
                  placeholder="Ad Account #"
                  className="input"
                />
                <input
                  name="adAccountLink"
                  defaultValue={editingClient.adAccountLink ?? ""}
                  placeholder="Ad Account Link"
                  className="input"
                />
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-white/40">
                    Deliverables Needed
                  </label>
                  <textarea
                    name="deliverablesNeeded"
                    defaultValue={editingClient.deliverablesNeeded ?? ""}
                    placeholder="Description of outputs needed"
                    className="input w-full resize-none h-16"
                  />
                </div>
                <div className="col-span-2 border-t border-white/5 pt-3">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Technical Setup</p>
                </div>
                <select name="setupFeeStatus" defaultValue={(editingClient as any).setupFeeStatus ?? ""} className="input">
                  <option value="">Setup Fee Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                </select>
                <select name="retainerStatus" defaultValue={(editingClient as any).retainerStatus ?? ""} className="input">
                  <option value="">Retainer Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
                <select name="crmApiStatus" defaultValue={(editingClient as any).crmApiStatus ?? ""} className="input">
                  <option value="">CRM API Status</option>
                  <option value="NOT_SETUP">Not Setup</option>
                  <option value="ACTIVE">Active</option>
                </select>
                <input
                  name="twilioNumber"
                  defaultValue={(editingClient as any).twilioNumber ?? ""}
                  placeholder="Twilio Number"
                  className="input"
                />
                <input
                  name="elevenLabsVoiceId"
                  defaultValue={(editingClient as any).elevenLabsVoiceId ?? ""}
                  placeholder="ElevenLabs Voice ID"
                  className="input"
                />
                <input
                  name="n8nWorkflowId"
                  defaultValue={(editingClient as any).n8nWorkflowId ?? ""}
                  placeholder="N8N Workflow ID"
                  className="input"
                />
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-white/40">Go-Live Date</label>
                  <input
                    name="goLiveDate"
                    type="date"
                    defaultValue={(editingClient as any).goLiveDate ? toDateInput((editingClient as any).goLiveDate) : ""}
                    className="input date-input w-full"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-white/40">Results Notes</label>
                  <textarea
                    name="resultsNotes"
                    defaultValue={(editingClient as any).resultsNotes ?? ""}
                    placeholder="Campaign results, wins, notes..."
                    className="input w-full resize-none h-16"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-40 active:scale-95"
                >
                  {isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-1 rounded-full border border-white/20 py-2 text-sm hover:bg-white/5 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="border-t border-white/5 pt-4">
              <button
                onClick={() => setShowDeliverables((v) => !v)}
                className="text-sm text-white/60 hover:text-white flex items-center gap-2 active:scale-95"
              >
                <span>{showDeliverables ? "▾" : "▸"}</span>
                Deliverables ({editingClient.deliverableGroups.length} groups)
              </button>
              {showDeliverables && (
                <div className="mt-3">
                  <DeliverableManager
                    clientId={editingClient.id}
                    groups={editingClient.deliverableGroups}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
