"use client";

import Link from "next/link";
import { Client, DeliverableGroup, Deliverable, Task } from "@prisma/client";
import { ExternalLink, ArrowLeft, Calendar, User } from "lucide-react";
import { DeliverableManager } from "./DeliverableManager";
import { useTransition } from "react";
import { updateTaskStatus } from "@/lib/actions";

type EnrichedClient = Client & {
  deliverableGroups: (DeliverableGroup & { deliverables: Deliverable[] })[];
  tasks: Task[];
};

const stageBadge: Record<string, string> = {
  LEAD: "bg-blue-500/20 text-blue-300",
  ACTIVE: "bg-green-500/20 text-green-400",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  CHURNED: "bg-red-500/20 text-red-400",
};

const taskStatusBadge: Record<string, string> = {
  NOT_STARTED: "bg-red-500/20 text-red-300 border border-red-500/30",
  ACTIVE: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  DONE: "bg-green-500/20 text-green-300 border border-green-500/30",
};

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/80 flex-1">{value}</span>
    </div>
  );
}

export function ClientDetailView({ client }: { client: EnrichedClient }) {
  const [isPending, startTransition] = useTransition();

  const termEnd = client.startDate
    ? (() => {
        const d = new Date(client.startDate);
        d.setMonth(d.getMonth() + (client.termLength ?? 12));
        return d;
      })()
    : null;

  return (
    <div className="space-y-6">
      {/* Back button + heading */}
      <div className="flex items-center gap-4">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Clients
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{client.companyName}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              stageBadge[client.stage] ?? "bg-white/10 text-white/60"
            }`}
          >
            {client.stage}
          </span>
        </div>
      </div>

      {/* Setup status pills */}
      {(client.setupFeeStatus || client.retainerStatus || client.crmApiStatus) && (
        <div className="flex flex-wrap gap-2">
          {client.setupFeeStatus && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium border ${
              client.setupFeeStatus === "PAID"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}>
              Setup Fee: {client.setupFeeStatus}
            </span>
          )}
          {client.retainerStatus && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium border ${
              client.retainerStatus === "ACTIVE"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : client.retainerStatus === "OVERDUE"
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}>
              Retainer: {client.retainerStatus}
            </span>
          )}
          {client.crmApiStatus && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium border ${
              client.crmApiStatus === "ACTIVE"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-white/10 text-white/50 border-white/10"
            }`}>
              CRM API: {client.crmApiStatus}
            </span>
          )}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT: Key Info */}
        <div className="rounded-3xl border border-white/5 bg-slate/60 p-5 space-y-0">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-3">
            Client Info
          </p>

          <InfoRow
            label="Retainer"
            value={
              client.monthlyRetainer
                ? `$${client.monthlyRetainer.toLocaleString()}/mo`
                : "—"
            }
          />
          <InfoRow label="Owner" value={client.owner} />
          <InfoRow label="Email" value={client.email} />
          {client.phone && <InfoRow label="Phone" value={client.phone} />}
          <InfoRow label="Services" value={client.services || "—"} />
          {client.deliverablesNeeded && (
            <InfoRow label="Deliverables Needed" value={client.deliverablesNeeded} />
          )}
          <InfoRow label="Start Date" value={fmtDate(client.startDate)} />
          <InfoRow
            label="Term"
            value={
              <span>
                {client.termLength ?? 12} months
                {termEnd && (
                  <span className="text-white/40 ml-1.5">
                    (ends {fmtDate(termEnd)})
                  </span>
                )}
              </span>
            }
          />
          <InfoRow
            label="Tier"
            value={client.tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          />
          {client.adAccountNumber && (
            <InfoRow label="Ad Account #" value={client.adAccountNumber} />
          )}
          {client.adAccountLink && (
            <InfoRow
              label="Ad Account"
              value={
                <a
                  href={client.adAccountLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Open <ExternalLink size={10} />
                </a>
              }
            />
          )}
          {client.frameioLink && (
            <InfoRow
              label="Frame.io"
              value={
                <a
                  href={client.frameioLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Open <ExternalLink size={10} />
                </a>
              }
            />
          )}
          {client.contractUrl && (
            <InfoRow
              label="Contract"
              value={
                <a
                  href={client.contractUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/60 hover:text-white hover:underline inline-flex items-center gap-1"
                >
                  View <ExternalLink size={10} />
                </a>
              }
            />
          )}
        </div>

        {/* RIGHT: Deliverables */}
        <div className="rounded-3xl border border-white/5 bg-slate/60 p-5">
          <DeliverableManager
            clientId={client.id}
            groups={client.deliverableGroups}
          />
        </div>
      </div>

      {/* Technical Setup */}
      {(client.twilioNumber || client.elevenLabsVoiceId || client.n8nWorkflowId || client.goLiveDate || client.resultsNotes) && (
        <div className="rounded-3xl border border-white/5 bg-slate/60 p-5 space-y-0">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-3">
            Technical Setup
          </p>
          {client.twilioNumber && <InfoRow label="Twilio Number" value={client.twilioNumber} />}
          {client.elevenLabsVoiceId && <InfoRow label="11Labs Voice ID" value={client.elevenLabsVoiceId} />}
          {client.n8nWorkflowId && <InfoRow label="N8N Workflow ID" value={client.n8nWorkflowId} />}
          {client.goLiveDate && <InfoRow label="Go-Live Date" value={fmtDate(client.goLiveDate)} />}
          {client.resultsNotes && <InfoRow label="Results Notes" value={client.resultsNotes} />}
        </div>
      )}

      {/* Tasks section */}
      {client.tasks.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-slate/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">
            Tasks ({client.tasks.length})
          </p>
          <div className="space-y-2">
            {client.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.status === "DONE"
                        ? "line-through text-white/30"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {fmtDate(task.dueDate)}
                    </p>
                  )}
                  {task.assignee && (
                    <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                      <User size={10} />
                      {task.assignee}
                    </p>
                  )}
                </div>
                <select
                  key={task.status}
                  defaultValue={task.status}
                  onChange={(e) =>
                    startTransition(() =>
                      updateTaskStatus(task.id, e.target.value)
                    )
                  }
                  disabled={isPending}
                  className={`input text-xs rounded-full px-3 py-1 border ${
                    taskStatusBadge[task.status] ?? "bg-white/10 text-white/60"
                  }`}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {client.tasks.length === 0 && (
        <div className="rounded-3xl border border-white/5 bg-slate/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-2">
            Tasks
          </p>
          <p className="text-sm text-white/30">
            No tasks for this client yet. Add tasks from the{" "}
            <Link href="/calendar" className="text-accent hover:underline">
              Calendar
            </Link>{" "}
            page.
          </p>
        </div>
      )}
    </div>
  );
}
