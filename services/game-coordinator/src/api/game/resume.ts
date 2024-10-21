"use server";
import { getSession } from "@/core/auth/session";

import { metadata } from "@/models/metadata";
import { startRounds } from "@/core/tasks/round";
import { setGameTrafficFlowStatus } from "@/core/instances/firewall";

export async function resumeGameAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }
  if (session.role !== "admin") {
    return { success: false, error: "forbidden" } as const;
  }

  await setGameTrafficFlowStatus({ enabled: true });
  await startRounds();
  await metadata.setGameStatus({ status: "running" });
  return { success: true } as const;
}
