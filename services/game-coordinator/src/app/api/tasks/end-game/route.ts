import { NextResponse } from "next/server";

import { backgroundTaskRoute } from "@/core/auth/tasks";

import { metadata } from "@/models/metadata";
import { stopRounds } from "@/core/tasks/round";
import { setGameTrafficFlowStatus } from "@/core/instances/firewall";

export const POST = backgroundTaskRoute(async () => {
  await setGameTrafficFlowStatus({ enabled: false });
  await stopRounds();
  await metadata.setGameStatus({ status: "finished" });
  return NextResponse.json({ success: true });
});
