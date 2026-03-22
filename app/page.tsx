export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FinancialSummary } from "@/components/FinancialSummary";
import { DashboardTabs } from "@/components/DashboardTabs";
import { WorkBoard } from "@/components/WorkBoard";

export default async function Page() {
  const [clients, projects, tasks, expenses, leads, revenues] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        deliverableGroups: { include: { deliverables: true } },
      },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, tasks: true },
    }),
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { include: { client: true } } },
    }),
    prisma.expense.findMany({ orderBy: { month: "desc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.monthlyRevenue.findMany({ orderBy: { month: "desc" } }),
  ]);

  return (
    <main className="space-y-8 pt-6">
      <FinancialSummary expenses={expenses} revenues={revenues} />
      <DashboardTabs clients={clients} leads={leads} />
      <WorkBoard tasks={tasks} projects={projects} clients={clients} />
    </main>
  );
}
