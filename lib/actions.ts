"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

function safeNumber(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function safeDate(value: FormDataEntryValue | null): Date | undefined {
  if (!value || typeof value !== "string" || value === "") return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ── CLIENTS ────────────────────────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const owner = formData.get("owner")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  if (!companyName || !owner || !email) return;

  await prisma.client.create({
    data: {
      companyName,
      owner,
      email,
      phone: formData.get("phone")?.toString().trim() || null,
      tier: formData.get("tier")?.toString() || "STANDARD",
      stage: formData.get("stage")?.toString() || "LEAD",
      monthlyRetainer: safeNumber(formData.get("monthlyRetainer")),
      frameioLink: formData.get("frameioLink")?.toString().trim() || null,
      contractUrl: formData.get("contractUrl")?.toString().trim() || null,
      services: formData.get("services")?.toString().trim() || "",
      startDate: safeDate(formData.get("startDate")) ?? new Date(),
    },
  });
  revalidatePath("/");
}

export async function updateClient(id: string, formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const owner = formData.get("owner")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  if (!companyName || !owner || !email) return;

  await prisma.client.update({
    where: { id },
    data: {
      companyName,
      owner,
      email,
      phone: formData.get("phone")?.toString().trim() || null,
      tier: formData.get("tier")?.toString() || "STANDARD",
      stage: formData.get("stage")?.toString() || "LEAD",
      monthlyRetainer: safeNumber(formData.get("monthlyRetainer")),
      frameioLink: formData.get("frameioLink")?.toString().trim() || null,
      contractUrl: formData.get("contractUrl")?.toString().trim() || null,
      services: formData.get("services")?.toString().trim() || "",
      startDate: safeDate(formData.get("startDate")) ?? undefined,
    },
  });
  revalidatePath("/");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/");
}

// ── PROJECTS ───────────────────────────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const clientId = formData.get("clientId")?.toString() ?? "";
  if (!name || !clientId) return;

  await prisma.project.create({
    data: {
      name,
      clientId,
      summary: formData.get("summary")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "PLANNING",
      kickoffDate: safeDate(formData.get("kickoffDate")),
      dueDate: safeDate(formData.get("dueDate")),
    },
  });
  revalidatePath("/");
}

export async function updateProject(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;

  await prisma.project.update({
    where: { id },
    data: {
      name,
      summary: formData.get("summary")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "PLANNING",
      dueDate: safeDate(formData.get("dueDate")),
    },
  });
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}

// ── TASKS ──────────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const projectId = formData.get("projectId")?.toString() ?? "";
  if (!title || !projectId) return;

  await prisma.task.create({
    data: {
      title,
      projectId,
      assignee: formData.get("assignee")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "NOT_STARTED",
      dueDate: safeDate(formData.get("dueDate")),
      notes: formData.get("notes")?.toString().trim() || null,
      link: formData.get("link")?.toString().trim() || null,
    },
  });
  revalidatePath("/");
}

export async function updateTask(id: string, formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  if (!title) return;

  await prisma.task.update({
    where: { id },
    data: {
      title,
      assignee: formData.get("assignee")?.toString().trim() || "",
      status: formData.get("status")?.toString() || "NOT_STARTED",
      dueDate: safeDate(formData.get("dueDate")),
      notes: formData.get("notes")?.toString().trim() || null,
      link: formData.get("link")?.toString().trim() || null,
    },
  });
  revalidatePath("/");
}

export async function updateTaskStatus(taskId: string, status: string) {
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

// ── EXPENSES ───────────────────────────────────────────────────────────────────

export async function createExpense(formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const amount = safeNumber(formData.get("amount"));
  const month = formData.get("month")?.toString().trim() ?? currentMonth();
  if (!title || amount === null) return;

  await prisma.expense.create({
    data: { title, amount, purpose: formData.get("purpose")?.toString().trim() || null, month },
  });
  revalidatePath("/");
}

export async function updateExpense(id: string, formData: FormData) {
  const title = formData.get("title")?.toString().trim() ?? "";
  const amount = safeNumber(formData.get("amount"));
  if (!title || amount === null) return;

  await prisma.expense.update({
    where: { id },
    data: {
      title,
      amount,
      purpose: formData.get("purpose")?.toString().trim() || null,
      month: formData.get("month")?.toString().trim() ?? currentMonth(),
    },
  });
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
}

// ── LEADS ──────────────────────────────────────────────────────────────────────

export async function createLead(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;

  const readyRaw = formData.get("readyToInvest")?.toString();
  const startRaw = formData.get("willingToStart")?.toString();

  await prisma.lead.create({
    data: {
      name,
      phone: formData.get("phone")?.toString().trim() || null,
      companyName: formData.get("companyName")?.toString().trim() || null,
      readyToInvest: readyRaw === "true" ? true : readyRaw === "false" ? false : null,
      willingToStart: startRaw === "true" ? true : startRaw === "false" ? false : null,
      stage: formData.get("stage")?.toString() || "NEW",
      notes: formData.get("notes")?.toString().trim() || null,
      source: formData.get("source")?.toString().trim() || null,
    },
  });
  revalidatePath("/");
}

export async function updateLead(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) return;

  const readyRaw = formData.get("readyToInvest")?.toString();
  const startRaw = formData.get("willingToStart")?.toString();

  await prisma.lead.update({
    where: { id },
    data: {
      name,
      phone: formData.get("phone")?.toString().trim() || null,
      companyName: formData.get("companyName")?.toString().trim() || null,
      readyToInvest: readyRaw === "true" ? true : readyRaw === "false" ? false : null,
      willingToStart: startRaw === "true" ? true : startRaw === "false" ? false : null,
      stage: formData.get("stage")?.toString() || "NEW",
      notes: formData.get("notes")?.toString().trim() || null,
      source: formData.get("source")?.toString().trim() || null,
    },
  });
  revalidatePath("/");
}

export async function updateLeadStage(id: string, stage: string) {
  await prisma.lead.update({ where: { id }, data: { stage } });
  revalidatePath("/");
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/");
}

// ── DELIVERABLE GROUPS ────────────────────────────────────────────────────────

export async function createDeliverableGroup(clientId: string, name: string, type: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return;

  const project = await prisma.project.create({
    data: {
      name: `${client.companyName} — ${name}`,
      clientId,
      summary: `Deliverables: ${name}`,
      status: "IN_PROGRESS",
    },
  });

  await prisma.deliverableGroup.create({
    data: { name, type, clientId, projectId: project.id },
  });
  revalidatePath("/");
}

export async function deleteDeliverableGroup(id: string) {
  await prisma.deliverableGroup.delete({ where: { id } });
  revalidatePath("/");
}

// ── DELIVERABLES ───────────────────────────────────────────────────────────────

export async function createDeliverable(groupId: string, title: string) {
  const group = await prisma.deliverableGroup.findUnique({ where: { id: groupId } });
  if (!group) return;

  let taskId: string | null = null;
  if (group.projectId) {
    const task = await prisma.task.create({
      data: { title, projectId: group.projectId, status: "NOT_STARTED" },
    });
    taskId = task.id;
  }

  await prisma.deliverable.create({
    data: { title, groupId, taskId },
  });
  revalidatePath("/");
}

export async function updateDeliverable(
  id: string,
  data: { title?: string; link?: string | null; completed?: boolean }
) {
  await prisma.deliverable.update({ where: { id }, data });

  if (data.completed !== undefined) {
    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (deliverable?.taskId) {
      await prisma.task.update({
        where: { id: deliverable.taskId },
        data: { status: data.completed ? "DONE" : "NOT_STARTED" },
      });
    }
  }
  revalidatePath("/");
}

export async function deleteDeliverable(id: string) {
  await prisma.deliverable.delete({ where: { id } });
  revalidatePath("/");
}

// ── MONTHLY REVENUE ────────────────────────────────────────────────────────────

export async function upsertMonthlyRevenue(month: string, revenue: number) {
  await prisma.monthlyRevenue.upsert({
    where: { month },
    update: { revenue },
    create: { month, revenue },
  });
  revalidatePath("/");
}
