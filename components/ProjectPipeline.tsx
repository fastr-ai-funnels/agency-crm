import { Project, Client } from "@prisma/client";
import { createProject } from "@/lib/actions";

const statusLabels: Record<string, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  COMPLETE: "Complete",
  BLOCKED: "Blocked",
};

type ProjectPipelineProps = {
  projects: (Project & { client: Client; tasks: { id: string }[] })[];
  clients: Client[];
};

export function ProjectPipeline({ projects, clients }: ProjectPipelineProps) {
  const grouped = projects.reduce<Record<string, typeof projects>>(
    (acc, project) => {
      const key = project.status || "PLANNING";
      acc[key] = acc[key] || [];
      acc[key].push(project);
      return acc;
    },
    {
      PLANNING: [],
      IN_PROGRESS: [],
      REVIEW: [],
      COMPLETE: [],
      BLOCKED: [],
    }
  );

  return (
    <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-white/60">Pipeline overview</p>
        </div>
        <form action={createProject} className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <input name="name" placeholder="Project name" className="input" required />
          <select name="clientId" className="input" required>
            <option value="">Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
          <select name="status" className="input">
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input name="budget" placeholder="Budget" type="number" className="input" />
          <input name="summary" placeholder="Summary" className="input col-span-2 md:col-span-5" />
          <button type="submit" className="col-span-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
            Add Project
          </button>
        </form>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Object.entries(grouped).map(([status, cards]) => (
          <div key={status} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{statusLabels[status] || status}</p>
            <div className="mt-3 space-y-3">
              {cards.length === 0 && <p className="text-sm text-white/40">No projects</p>}
              {cards.map((project) => (
                <div key={project.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">{project.name}</p>
                  <p className="text-xs text-white/60">{project.client.companyName}</p>
                  <div className="mt-2 text-xs text-white/50">
                    {project.tasks.length} tasks
                  </div>
                  <p className="mt-1 text-sm text-white/70">{project.summary || "No summary provided"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
