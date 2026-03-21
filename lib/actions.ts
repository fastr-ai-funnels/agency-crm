"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

function safeNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

export async function createClient(formData: FormData) {
  const companyName = formData.get("companyName")?.toString().trim();
  const pointPerson = formData.get("pointPerson")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const services = formData.get("services")?.toString().trim() || "";
  const tier = formData.get("tier")?.toString() || "STANDARD";
  const monthlyRetainer = safeNumber(formData.get("retainer"));

  if (!companyName || !pointPerson || !email) {
    throw new Error("Missing required client fields");
  }

  await prisma.client.create({
    data: {
      companyName,
      pointPerson,
      email,
      phone,
      services,
      tier,
      monthlyRetainer: monthlyRetainer ?? undefined,
    },
  });

  revalidatePath("/");
}

export async function createProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const summary = formData.get("summary")?.toString().trim() || "";
  const clientId = formData.get("clientId")?.toString();
  const budget = safeNumber(formData.get("budget"));
  const status = formData.get("status")?.toString() || "PLANNING";

  if (!name || !clientId) {
    throw new Error("Missing required project fields");
  }

  await prisma.project.create({
    data: {
      name,
      summary,
      clientId,
      status,
      budget: budget ?? undefined,
    },
  });

  revalidatePath("/");
}

export async function createTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const owner = formData.get("owner")?.toString().trim() || "Unassigned";
  const projectId = formData.get("projectId")?.toString();
  const status = formData.get("status")?.toString() || "BACKLOG";
  const notes = formData.get("notes")?.toString().trim();

  if (!title || !projectId) {
    throw new Error("Missing required task fields");
  }

  await prisma.task.create({
    data: {
      title,
      owner,
      projectId,
      status,
      notes: notes || undefined,
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
