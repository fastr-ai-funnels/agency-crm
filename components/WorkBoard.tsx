"use client";

import { useState, useRef, useTransition } from "react";
import { Client, Project, Task } from "@prisma/client";
import { Pencil, Trash2, X, Calendar, User } from "lucide-react";
import {
  createProject,
  deleteProject,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "@/lib/actions";

type EnrichedTask = Task & { project: Project & { client: Client } };
type EnrichedProject = Project & { client: Client; tasks: Task[] };

type WorkBoardProps = {
  tasks: EnrichedTask[];
  projects: EnrichedProject[];
  clients: Client[];
};

const taskStatusCols: { key: string; label: string }[] = [
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "ACTIVE", label: "Active" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "DONE", label: "Done" },
];

const projectStatusOptions = [
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETE", label: "Complete" },
  { value: "BLOCKED", label: "Blocked" },
];

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(d)
  );
}

function isOverdue(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  return new Date(d) < new Date();
}

export function WorkBoard({ tasks, projects, clients }: WorkBoardProps) {
  const [editingTask, setEditingTask] = useState<EnrichedTask | null>(null);
  const [isPending, startTransition] = useTransition();
  const taskFormRef = useRef<HTMLFormElement>(null);
  const projectFormRef = useRef<HTMLFormElement>(null);

  function handleAddProject(formData: FormData) {
    startTransition(async () => {
      await createProject(formData);
      projectFormRef.current?.reset();
    });
  }

  function handleDeleteProject(id: string) {
    if (!confirm("Delete this project? All its tasks will also be removed.")) return;
    startTransition(async () => {
      await deleteProject(id);
    });
  }

  function handleAddTask(formData: FormData) {
    startTransition(async () => {
      await createTask(formData);
      taskFormRef.current?.reset();
    });
  }

  function handleUpdateTask(formData: FormData) {
    if (!editingTask) return;
    startTransition(async () => {
      await updateTask(editingTask.id, formData);
      setEditingTask(null);
    });
  }

  function handleStatusUpdate(taskId: string, status: string) {
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
    });
  }

  function handleDeleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      await deleteTask(id);
    });
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-slate/60 p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Work</h2>
        <p className="text-sm text-white/60">Projects &amp; tasks</p>
      </div>

      {/* Projects strip */}
      <div className="mb-5">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/40">Projects</p>
        <div className="flex flex-wrap items-center gap-2 mb-3 min-h-[28px]">
          {projects.length === 0 && (
            <span className="text-sm text-white/30">No projects — add one below</span>
          )}
          {projects.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
            >
              {p.name}
              <span className="text-white/40">· {p.client.companyName}</span>
              <button
                type="button"
                onClick={() => handleDeleteProject(p.id)}
                disabled={isPending}
                className="ml-1 text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Delete project"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <form
          ref={projectFormRef}
          action={handleAddProject}
          className="flex flex-wrap gap-2"
        >
          <input
            name="name"
            placeholder="Project name *"
            className="input flex-1 min-w-[140px]"
            required
          />
          <select name="clientId" className="input" required>
            <option value="">Client *</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
          <select name="status" className="input">
            {projectStatusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input name="summary" placeholder="Summary" className="input flex-1 min-w-[140px]" />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium hover:bg-white/20 active:scale-95 transition-transform disabled:opacity-50"
          >
            + Project
          </button>
        </form>
      </div>

      <div className="border-t border-white/5 my-5" />

      {/* Add Task Form */}
      <div className="mb-6">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/40">Add Task</p>
        <form
          ref={taskFormRef}
          action={handleAddTask}
          className="grid grid-cols-2 gap-3 md:grid-cols-5"
        >
          <input name="title" placeholder="Task *" className="input" required />
          <input name="assignee" placeholder="Assignee" className="input" />
          <select name="projectId" className="input" required>
            <option value="">Project *</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select name="status" className="input">
            {taskStatusCols.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input name="dueDate" type="date" className="input date-input" />
          <input
            name="notes"
            placeholder="Notes"
            className="input col-span-2 md:col-span-5"
          />
          <button
            type="submit"
            disabled={isPending}
            className="col-span-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-white active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Add Task"}
          </button>
        </form>
      </div>

      {/* Kanban */}
      <div className="grid gap-4 md:grid-cols-4">
        {taskStatusCols.map(({ key, label }) => {
          const colTasks = tasks.filter((t) => t.status === key);
          return (
            <div key={key} className="rounded-2xl border border-white/5 bg-black/30 p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{label}</p>
                <span className="text-xs text-white/30">{colTasks.length}</span>
              </div>
              <div className="space-y-3">
                {colTasks.length === 0 && (
                  <p className="text-sm text-white/30">No tasks</p>
                )}
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projects}
                    isPending={isPending}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Edit Task</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form action={handleUpdateTask} className="grid grid-cols-2 gap-3">
              <input
                name="title"
                defaultValue={editingTask.title}
                placeholder="Task *"
                className="input col-span-2"
                required
              />
              <input
                name="assignee"
                defaultValue={editingTask.assignee}
                placeholder="Assignee"
                className="input"
              />
              <input
                name="dueDate"
                type="date"
                defaultValue={toDateInput(editingTask.dueDate)}
                className="input date-input"
              />
              <select
                name="projectId"
                defaultValue={editingTask.projectId}
                className="input"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                name="status"
                defaultValue={editingTask.status}
                className="input"
              >
                {taskStatusCols.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                name="notes"
                defaultValue={editingTask.notes ?? ""}
                placeholder="Notes"
                className="input col-span-2"
              />
              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
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

function TaskCard({
  task,
  projects,
  isPending,
  onEdit,
  onDelete,
  onStatusUpdate,
}: {
  task: EnrichedTask;
  projects: EnrichedProject[];
  isPending: boolean;
  onEdit: (task: EnrichedTask) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const overdue =
    task.dueDate && task.status !== "DONE" && isOverdue(task.dueDate);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-sm">
      <p className="font-semibold text-white leading-snug">{task.title}</p>
      <p className="text-xs text-white/50 mt-0.5">
        {task.project.name} · {task.project.client.companyName}
      </p>
      {task.assignee && task.assignee !== "Unassigned" && (
        <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
          <User size={10} />
          {task.assignee}
        </p>
      )}
      {task.dueDate && (
        <p
          className={`text-xs mt-1 flex items-center gap-1 ${
            overdue ? "text-red-400" : "text-white/40"
          }`}
        >
          <Calendar size={10} />
          {fmtDate(task.dueDate)}
          {overdue ? " — overdue" : ""}
        </p>
      )}
      {task.notes && (
        <p className="text-xs text-white/50 mt-1 line-clamp-2">{task.notes}</p>
      )}
      <div className="mt-3 flex items-center gap-1.5">
        <select
          key={task.status}
          defaultValue={task.status}
          onChange={(e) => onStatusUpdate(task.id, e.target.value)}
          className="input text-xs flex-1"
          disabled={isPending}
        >
          {taskStatusCols.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-full border border-white/10 p-1.5 hover:border-white/30 active:scale-95 transition-transform shrink-0"
          title="Edit task"
        >
          <Pencil size={11} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          disabled={isPending}
          className="rounded-full border border-white/10 p-1.5 hover:border-red-500/40 hover:text-red-400 active:scale-95 transition-transform disabled:opacity-50 shrink-0"
          title="Delete task"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
