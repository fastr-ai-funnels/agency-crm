import { MetricCard } from "@/components/MetricCard";
import { ClientTable } from "@/components/ClientTable";
import { ProjectPipeline } from "@/components/ProjectPipeline";
import { TaskBoard } from "@/components/TaskBoard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [clients, projects, tasks] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, tasks: true },
    }),
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: true },
    }),
  ]);

  const totalRetainer = clients.reduce((sum, client) => sum + (client.monthlyRetainer ?? 0), 0);
  const activeProjects = projects.filter((project) => project.status !== "COMPLETE").length;
  const activeTasks = tasks.filter((task) => task.status === "ACTIVE").length;

  return (
    <main className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Monthly Retainer" value={`$${totalRetainer.toLocaleString()}`} sublabel="Across all clients" />
        <MetricCard label="Active Clients" value={clients.length} sublabel="Retained" />
        <MetricCard label="Active Projects" value={activeProjects} sublabel="In motion" />
        <MetricCard label="Tasks In Flight" value={activeTasks} sublabel="Owner assigned" />
      </section>

      <ClientTable clients={clients} />
      <ProjectPipeline projects={projects} clients={clients} />
      <TaskBoard tasks={tasks} projects={projects} />
    </main>
  );
}
