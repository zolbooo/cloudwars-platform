import { FieldValue } from "@google-cloud/firestore";
import { differenceInMinutes } from "date-fns";

import { metadata } from "@/models/metadata";
import { startCheckers } from "@/core/checkers/start";
import { backgroundTaskRoute } from "@/core/auth/tasks";

export const POST = backgroundTaskRoute(async () => {
  const gameStatus = await metadata.getGameStatus();
  if (gameStatus.status !== "running") {
    return new Response("Game is not running", { status: 208 });
  }

  const gameSettings = await metadata.getGameSettings();
  if (!gameSettings) {
    return new Response("Game settings not found", { status: 500 });
  }
  if (
    !gameStatus.lastCheckAt ||
    differenceInMinutes(new Date(), gameStatus.lastCheckAt) >=
      gameSettings.roundDurationMinutes
  ) {
    await metadata.setGameStatus({
      currentRound: FieldValue.increment(1),
      roundStartedAt: FieldValue.serverTimestamp(),
    });
    await startCheckers("push");
    return new Response("Checkers started pushing flags", { status: 201 });
  }
  if (
    !gameStatus.lastCheckAt ||
    differenceInMinutes(new Date(), gameStatus.lastCheckAt) >= 2
  ) {
    await startCheckers("pull");
    await metadata.setGameStatus({ lastCheckAt: FieldValue.serverTimestamp() });
    return new Response("Pull checkers started", { status: 202 });
  }

  return new Response("OK", { status: 200 });
});
