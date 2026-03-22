import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();

  const clients = await prisma.$transaction(
    [
      prisma.client.create({
        data: {
          companyName: "White Rhino Turf",
          pointPerson: "Jake Navarro",
          email: "jake@whiterhino.com",
          phone: "480-555-1822",
          tier: "PERFORMANCE",
          stage: "ACTIVE",
          services: "Meta lead gen + onsite creative",
          monthlyRetainer: 7500,
        },
      }),
      prisma.client.create({
        data: {
          companyName: "Desert Peak HVAC",
          pointPerson: "Lauren Riley",
          email: "lauren@desertpeak.com",
          phone: "602-555-9880",
          tier: "STANDARD",
          stage: "ACTIVE",
          services: "Meta + G Ads + Funnel",
          monthlyRetainer: 4800,
        },
      }),
      prisma.client.create({
        data: {
          companyName: "Soho Sculpt",
          pointPerson: "Cameron Yu",
          email: "cameron@sohosculpt.com",
          phone: "310-555-4411",
          tier: "ADVISORY",
          stage: "LEAD",
          services: "Offer architecture + CRO",
          monthlyRetainer: 6200,
        },
      }),
    ]
  );

  const [whiteRhino, desertPeak, sohoSculpt] = clients;

  const projects = await prisma.$transaction(
    [
      prisma.project.create({
        data: {
          name: "Spring Promo Rollout",
          summary: "Bundle turf install + financing hooks",
          status: "IN_PROGRESS",
          kickoffDate: new Date(),
          dueDate: addDays(new Date(), 21),
          clientId: whiteRhino.id,
        },
      }),
      prisma.project.create({
        data: {
          name: "HVAC Always-On",
          summary: "Rebuild lead routing + Zapier QA",
          status: "REVIEW",
          kickoffDate: addDays(new Date(), -10),
          dueDate: addDays(new Date(), 5),
          clientId: desertPeak.id,
        },
      }),
      prisma.project.create({
        data: {
          name: "Soho Product Ladder",
          summary: "Reposition low-ticket acquisition",
          status: "PLANNING",
          clientId: sohoSculpt.id,
        },
      }),
    ]
  );

  const [springPromo, hvac, soho] = projects;

  await prisma.$transaction([
    prisma.task.create({
      data: {
        title: "Shot list sign-off",
        assignee: "Alyssa",
        status: "ACTIVE",
        dueDate: addDays(new Date(), 2),
        notes: "Need Cam's approval on hooks",
        projectId: springPromo.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Zapier error logging",
        assignee: "Devin",
        status: "NOT_STARTED",
        dueDate: addDays(new Date(), 4),
        projectId: hvac.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Sculpt onboarding deck",
        assignee: "Rae",
        status: "DONE",
        dueDate: addDays(new Date(), -1),
        notes: "Ready for review",
        projectId: soho.id,
      },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
