"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

function safeNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

function safeDate(value: FormDataEntryValue | null): Date | undefined {
  if (!value) return undefined;
  const str = value.toString().trim();
  if (!str) return undefined;
  const d = new Date(str);
  return isNaN(d.getTime()) ? undefined : d;
}

// ─── CLIENT ACTIONS ──────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim();
  const pointPerson = formData.get("pointPerson")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const services = formData.get("services")?.toString().trim() || "";
  const tier = formData.get("tier")?.toString() || "STANDARD";
  const monthlyRetainer = safeNumber(formData.get("retainer"));
  const stage = formData.get("stage")?.toString() || "LEAD";
  const frameioLink = formData.get("frameioLink")?.toString().trim() || null;

  if (!companyName || !pointPerson || !email) {
    throw new Error("Missing required client fields");
  }

  await prisma.client.create({
    data: {
      companyName,
      pointPerson,
      email,
      phone: phone || null,
      services,
      tier,
      monthlyRetainer: monthlyRetainer ?? null,
      stage,
      frameioLink,
    },
  });

  revalidatePath("/");
}

export async function updateClient(id: string, formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim();
  const pointPerson = formData.get("pointPerson")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const services = formData.get("services")?.toString().trim() || "";
  const tier = formData.get("tier")?.toString() || "STANDARD";
  const monthlyRetainer = safeNumber(formData.get("retainer"));
  const stage = formData.get("stage")?.toString() || "LEAD";
  const frameioLink = formData.get("frameioLink")?.toString().trim() || null;

  if (!companyName || !pointPerson || !email) {
    throw new Error("Missing required client fields");
  }

  await prisma.client.update({
    where: { id },
    data: {
      companyName,
      pointPerson,
      email,
      phone: phone || null,
      services,
      tier,
      monthlyRetainer: monthlyRetainer ?? null,
      stage,
      frameioLink,
    },
  });

  revalidatePath("/");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/");
}

// ─── PROJECT ACTIONS ─────────────────────────────────────────────

export async function createProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const summary = formData.get("summary")?.toString().trim() || "";
  const clientId = formData.get("clientId")?.toString();
  const status = formData.get("status")?.toString() || "PLANNING";

  if (!name || !clientId) {
    throw new Error("Missing required project fields");
  }

  await prisma.project.create({
    data: { name, summary, clientId, status },
  });

  revalidatePath("/");
}

export async function updateProject(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const summary = formData.get("summary")?.toString().trim() || "";
  const clientId = formData.get("clientId")?.toString();
  const status = formData.get("status")?.toString() || "PLANNING";

  if (!name || !clientId) throw new Error("Missing required project fields");

  await prisma.project.update({
    where: { id },
    data: { name, summary, clientId, status },
  });

  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}

// ─── TASK ACTIONS ────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const assignee = formData.get("assignee")?.toString().trim() || "Unassigned";
  const projectId = formData.get("projectId")?.toString();
  const status = formData.get("status")?.toString() || "NOT_STARTED";
  const notes = formData.get("notes")?.toString().trim();
  const dueDate = safeDate(formData.get("dueDate"));

  if (!title || !projectId) {
    throw new Error("Missing required task fields");
  }

  await prisma.task.create({
    data: {
      title,
      assignee,
      projectId,
      status,
      notes: notes || null,
      dueDate: dueDate ?? null,
    },
  });

  revalidatePath("/");
}

export async function updateTask(id: string, formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const assignee = formData.get("assignee")?.toString().trim() || "Unassigned";
  const projectId = formData.get("projectId")?.toString();
  const status = formData.get("status")?.toString() || "NOT_STARTED";
  const notes = formData.get("notes")?.toString().trim();
  const dueDate = safeDate(formData.get("dueDate"));

  if (!title || !projectId) throw new Error("Missing required task fields");

  await prisma.task.update({
    where: { id },
    data: {
      title,
      assignee,
      projectId,
      status,
      notes: notes || null,
      dueDate: dueDate ?? null,
    },
  });

  revalidatePath("/");
}

export async function updateTaskStatus(taskId: string, status: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}
