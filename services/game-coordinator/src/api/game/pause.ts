"use server";
import { getSession } from "@/core/auth/session";

import { metadata } from "@/models/metadata";
import { stopRounds } from "@/core/tasks/round";
import { setGameTrafficFlowStatus } from "@/core/instances/firewall";

export async function pauseGameAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }
  if (session.role !== "admin") {
    return { success: false, error: "forbidden" } as const;
  }

  await setGameTrafficFlowStatus({ enabled: false });
  await stopRounds();
  await metadata.setGameStatus({ status: "paused" });
  return { success: true } as const;
}
