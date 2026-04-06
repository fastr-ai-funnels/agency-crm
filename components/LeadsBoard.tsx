"use client";

import { useRef, useState, useTransition } from "react";
import { Lead } from "@prisma/client";
import { createLead, updateLead, updateLeadStage, deleteLead } from "@/lib/actions";
import { Pencil, Trash2, Phone } from "lucide-react";

const STAGES = [
  { key: "NEW", label: "New Lead" },
  { key: "CALL_SCHEDULED", label: "Call Scheduled" },
  { key: "NO_SHOW", label: "No Show" },
  { key: "FOLLOW_UP", label: "Follow Up" },
  { key: "CLOSED", label: "Closed" },
  { key: "NOT_QUALIFIED", label: "Not Qualified" },
];

type Props = { leads: Lead[] };

export function LeadsBoard({ leads }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isPending, startTransition] = useTransition();

  const convertedCount = leads.filter((l) => l.stage === "CLOSED").length;
  const estCPL = leads.length > 0 ? (1410 / leads.length).toFixed(0) : "—";

  return (
    <div className="glass p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Leads</h2>
          <p className="text-sm text-white/40 mt-0.5">{convertedCount} converted · {leads.length} total</p>
        </div>
      </div>

      {/* Add lead form */}
      <form
        ref={formRef}
        action={(fd) => {
          startTransition(async () => {
            await createLead(fd);
            formRef.current?.reset();
          });
        }}
        className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-4"
      >
        <input name="name" placeholder="Name *" className="input" required />
        <input name="companyName" placeholder="Company" className="input" />
        <input name="phone" placeholder="Phone" className="input" />
        <select name="source" className="input">
          <option value="">Source</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="referral">Referral</option>
          <option value="organic">Organic</option>
        </select>
        <select name="readyToInvest" className="input">
          <option value="">Ready to invest?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <select name="willingToStart" className="input">
          <option value="">Willing to start?</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <input name="notes" placeholder="Notes" className="input col-span-2" />
        <button type="submit" disabled={isPending} className="col-span-2 md:col-span-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-40 active:scale-95 transition-transform">
          {isPending ? "Adding..." : "Add Lead"}
        </button>
      </form>

      {/* Ad spend metrics */}
      <div className="mb-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-2 flex flex-wrap items-center gap-4 text-xs text-white/50">
        <span>Daily spend: <strong className="text-white/70 mono-data">$47</strong></span>
        <span>Monthly: <strong className="text-white/70 mono-data">~$1,410</strong></span>
        <span>Est. CPL: <strong className="text-accent mono-data">${estCPL}</strong></span>
        <span>Converted: <strong className="text-accent mono-data">{convertedCount}</strong></span>
      </div>

      {/* Kanban */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map(({ key, label }) => {
          const stageLeads = leads.filter((l) => l.stage === key);
          return (
            <div key={key} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3" style={{backdropFilter:"blur(8px)"}}>
              <div className="flex items-center gap-2 mb-3">
                <p className="heading-xs">{label}</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50 tabular-nums">{stageLeads.length}</span>
              </div>
              {stageLeads.length === 0 && <p className="text-sm text-white/30">No leads</p>}
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={() => setEditingLead(lead)}
                    onDelete={() => startTransition(() => deleteLead(lead.id))}
                    onStageChange={(stage) => startTransition(() => updateLeadStage(lead.id, stage))}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="glass-modal w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold tracking-tight">Edit Lead</h3>
              <button onClick={() => setEditingLead(null)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
            </div>
            <form
              action={(fd) => {
                startTransition(async () => {
                  await updateLead(editingLead.id, fd);
                  setEditingLead(null);
                });
              }}
              className="space-y-3"
            >
              <input name="name" defaultValue={editingLead.name} placeholder="Name *" className="input w-full" required />
              <input name="companyName" defaultValue={editingLead.companyName ?? ""} placeholder="Company" className="input w-full" />
              <input name="phone" defaultValue={editingLead.phone ?? ""} placeholder="Phone" className="input w-full" />
              <select name="stage" defaultValue={editingLead.stage} className="input w-full">
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <select name="readyToInvest" defaultValue={editingLead.readyToInvest === true ? "true" : editingLead.readyToInvest === false ? "false" : ""} className="input w-full">
                <option value="">Ready to invest?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <select name="willingToStart" defaultValue={editingLead.willingToStart === true ? "true" : editingLead.willingToStart === false ? "false" : ""} className="input w-full">
                <option value="">Willing to start?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <select name="source" defaultValue={editingLead.source ?? ""} className="input w-full">
                <option value="">Source</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Referral</option>
                <option value="organic">Organic</option>
              </select>
              <input name="conditionalLogicTag" defaultValue={(editingLead as any).conditionalLogicTag ?? ""} placeholder="Conditional Logic Tag (e.g. HVAC)" className="input w-full" />
              <div className="space-y-1">
                <label className="text-xs text-white/40">Sales Call Date</label>
                <input name="salesCallDate" type="date" defaultValue={(editingLead as any).salesCallDate ? new Date((editingLead as any).salesCallDate).toISOString().split("T")[0] : ""} className="input w-full" />
              </div>
              <select name="outcome" defaultValue={(editingLead as any).outcome ?? ""} className="input w-full">
                <option value="">Outcome</option>
                <option value="CLOSED_FULL_SYSTEM">Closed — Full System</option>
                <option value="CLOSED_AI_AGENT_AUTOMATIONS">Closed — AI Agent + Auto</option>
                <option value="CLOSED_AI_AGENT_ONLY">Closed — AI Agent Only</option>
                <option value="CLOSED_AUTOMATIONS_ONLY">Closed — Automations Only</option>
                <option value="CLOSED_AI_AD_CAMPAIGN">Closed — AI Ad Campaign</option>
                <option value="LOST">Lost</option>
                <option value="NO_SHOW">No Show</option>
              </select>
              <select name="downsellPathTaken" defaultValue={(editingLead as any).downsellPathTaken ?? ""} className="input w-full">
                <option value="">Downsell Path</option>
                <option value="NONE">None (accepted full offer)</option>
                <option value="TESTIMONIAL">Testimonial exchange</option>
                <option value="REFERRAL">Referral exchange</option>
                <option value="CASE_STUDY">Case study exchange</option>
              </select>
              <input name="revenueOnClose" type="number" defaultValue={(editingLead as any).revenueOnClose ?? ""} placeholder="Revenue on close ($)" className="input w-full" />
              <textarea name="notes" defaultValue={editingLead.notes ?? ""} placeholder="Notes" className="input w-full h-20 resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-40 active:scale-95">Save</button>
                <button type="button" onClick={() => setEditingLead(null)} className="flex-1 rounded-full border border-white/20 py-2 text-sm hover:bg-white/5 active:scale-95">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead, onEdit, onDelete, onStageChange, isPending,
}: {
  lead: Lead;
  onEdit: () => void;
  onDelete: () => void;
  onStageChange: (stage: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3 text-sm space-y-2 hover:border-white/[0.12] hover:bg-white/[0.07] transition-all duration-200" style={{backdropFilter:"blur(8px)"}}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{lead.name}</p>
          {lead.companyName && <p className="text-xs text-white/50">{lead.companyName}</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onEdit} className="text-white/30 hover:text-white active:scale-95"><Pencil size={12} /></button>
          <button onClick={onDelete} disabled={isPending} className="text-white/30 hover:text-red-400 disabled:opacity-40 active:scale-95"><Trash2 size={12} /></button>
        </div>
      </div>
      {lead.phone && (
        <div className="flex items-center gap-1 text-xs text-white/50">
          <Phone size={10} />
          <span>{lead.phone}</span>
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {lead.readyToInvest !== null && lead.readyToInvest !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${lead.readyToInvest ? "bg-accent/20 text-accent" : "bg-white/10 text-white/40"}`}>
            {lead.readyToInvest ? "Ready" : "Not ready"}
          </span>
        )}
        {lead.willingToStart !== null && lead.willingToStart !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${lead.willingToStart ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
            {lead.willingToStart ? "Start now" : "Not yet"}
          </span>
        )}
        {lead.source && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">{lead.source}</span>}
      </div>
      {(lead as any).outcome && (
        <span className="rounded-full bg-accent/20 text-accent px-2 py-0.5 text-xs">
          {(lead as any).outcome.replace(/_/g, " ").replace(/\bCLOSED\b/, "✓")}
        </span>
      )}
      {(lead as any).revenueOnClose && (
        <p className="text-xs text-green-400 font-medium mono-data">${((lead as any).revenueOnClose as number).toLocaleString()}</p>
      )}
      {lead.notes && <p className="text-xs text-white/40 line-clamp-2">{lead.notes}</p>}
      <select value={lead.stage} onChange={(e) => onStageChange(e.target.value)} className="input text-xs w-full mt-1">
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
    </div>
  );
}
