export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { LeadsBoard } from "@/components/LeadsBoard";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="pt-6 fade-up">
      <LeadsBoard leads={leads} />
    </main>
  );
}
