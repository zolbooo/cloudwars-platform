import assert from "assert";
import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";

import { backgroundTaskRoute } from "@/core/auth/tasks";

import { metadata } from "@/models/metadata";
import { startRounds } from "@/core/tasks/round";
import { scheduleGameEndAt } from "@/core/tasks/end-game";
import { setGameTrafficFlowStatus } from "@/core/instances/firewall";

export const dynamic = "force-dynamic";

export const POST = backgroundTaskRoute(async () => {
  const settings = await metadata.getGameSettings();
  assert(
    settings,
    "Game settings are not set. Was the setup performed correctly?"
  );
  await scheduleGameEndAt(
    addMinutes(
      settings.startDate,
      settings.gameDurationRounds * settings.roundDurationMinutes
    )
  );
  await setGameTrafficFlowStatus({ enabled: true });
  await startRounds();
  await metadata.setGameStatus({ status: "running" });
  return NextResponse.json({ success: true });
});
