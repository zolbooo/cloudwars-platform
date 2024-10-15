import assert from "assert";
import { addMinutes } from "date-fns";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

import { metadata } from "@/models/metadata";
import { startRounds } from "@/core/tasks/round";
import { scheduleGameEndAt } from "@/core/tasks/end-game";

const oauthClient = new OAuth2Client();
const backgroundTasksServiceAccountEmail =
  process.env.BACKGROUND_TASKS_SERVICE_ACCOUNT_EMAIL;

export async function POST(req: NextRequest) {
  assert(
    backgroundTasksServiceAccountEmail,
    "BACKGROUND_TASKS_SERVICE_ACCOUNT_EMAIL environment variable is not set."
  );

  const bearerToken = req.headers.get("Authorization")?.split(" ")[1];
  if (!bearerToken) {
    return NextResponse.json(
      {
        success: false,
        error: "unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const tokenClaims = await oauthClient.verifyIdToken({
      idToken: bearerToken,
    });

    const payload = tokenClaims.getPayload();
    if (!payload) {
      throw new Error("Missing payload in authentication token");
    }

    if (payload.email !== backgroundTasksServiceAccountEmail) {
      throw new Error(
        `Invalid email in authentication token: ${payload.email}`
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "forbidden" },
      { status: 403 }
    );
  }

  await metadata.setGameStatus({ status: "running" });
  await startRounds();
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
}
