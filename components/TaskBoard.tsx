import { Project, Task } from "@prisma/client";
import { createTask, updateTaskStatus } from "@/lib/actions";

const statusColumns: { key: string; label: string }[] = [
  { key: "BACKLOG", label: "Backlog" },
  { key: "ACTIVE", label: "In Flight" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "DONE", label: "Done" },
];

type TaskBoardProps = {
  tasks: (Task & { project: Project })[];
  projects: Project[];
};

export function TaskBoard({ tasks, projects }: TaskBoardProps) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-white/60">Operator view</p>
        </div>
        <form action={createTask} className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <input name="title" placeholder="Task" className="input" required />
          <input name="owner" placeholder="Owner" className="input" />
          <select name="projectId" className="input" required>
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select name="status" className="input">
            {statusColumns.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notes" className="input col-span-2 md:col-span-5" />
          <button type="submit" className="col-span-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white">
            Add Task
          </button>
        </form>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {statusColumns.map(({ key, label }) => (
          <div key={key} className="rounded-2xl border border-white/5 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{label}</p>
            <div className="mt-3 space-y-3">
              {tasks.filter((task) => task.status === key).length === 0 && (
                <p className="text-sm text-white/40">No tasks</p>
              )}
              {tasks
                .filter((task) => task.status === key)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task & { project: Project } }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-sm text-white/80">
      <p className="font-semibold text-white">{task.title}</p>
      <p className="text-xs text-white/60">{task.project.name}</p>
      <p className="text-xs text-white/40">Owner: {task.owner}</p>
      <p className="text-xs text-white/50">{task.notes}</p>
      <form
        action={async (formData) => {
          "use server";
          const status = formData.get("nextStatus")?.toString() || "BACKLOG";
          await updateTaskStatus(task.id, status);
        }}
        className="mt-3 flex gap-2"
      >
        <select name="nextStatus" defaultValue={task.status} className="input text-xs">
          {statusColumns.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full border border-white/20 px-3 py-1 text-xs">
          Update
        </button>
      </form>
    </div>
  );
}
