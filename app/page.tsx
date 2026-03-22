import { MetricCard } from "@/components/MetricCard";
import { ClientTable } from "@/components/ClientTable";
import { WorkBoard } from "@/components/WorkBoard";
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
      include: { project: { include: { client: true } } },
    }),
  ]);

  const totalRetainer = clients.reduce(
    (sum, client) => sum + (client.monthlyRetainer ?? 0),
    0
  );
  const activeClients = clients.filter((c) => c.stage === "ACTIVE").length;

  return (
    <main className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Monthly Retainer"
          value={`$${totalRetainer.toLocaleString()}`}
          sublabel="Across all clients"
        />
        <MetricCard
          label="Active Clients"
          value={activeClients}
          sublabel={`${clients.length} total`}
        />
      </section>

      <ClientTable clients={clients} />
      <WorkBoard tasks={tasks} projects={projects} clients={clients} />
    </main>
  );
}
