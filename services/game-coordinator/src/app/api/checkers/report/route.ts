import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

import { metadata } from "@/models/metadata";

export const dynamic = "force-dynamic";

const checkerReportSchema = z.strictObject({
  service: z.string(),
  status: z.strictObject({
    push: z.enum(["UP", "MUMBLE", "CORRUPT", "DOWN"]),
    pull: z.enum(["UP", "MUMBLE", "CORRUPT", "DOWN"]),
  }),
  roundFlag: z.string(),
});

const oauthClient = new OAuth2Client();
export async function POST(req: NextRequest) {
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

    if (payload.email !== process.env.CHECKER_SERVICE_ACCOUNT_EMAIL) {
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

  const input = await req.json();
  const validationResult = checkerReportSchema.safeParse(input);
  if (!validationResult.success) {
    return NextResponse.json({
      success: false,
      error: "validation_error",
      details: {
        issues: validationResult.error.issues,
      },
    });
  }

  const gameSettings = await metadata.getGameSettings();
  if (!gameSettings) {
    return NextResponse.json(
      {
        success: false,
        error: "setup_not_finished",
      },
      { status: 500 }
    );
  }
  if (gameSettings.startDate.valueOf() > Date.now()) {
    return NextResponse.json(
      {
        success: false,
        error: "game_not_started",
      },
      { status: 403 }
    );
  }
  if (gameSettings.endDate.valueOf() < Date.now()) {
    return NextResponse.json(
      {
        success: false,
        error: "game_ended",
      },
      { status: 403 }
    );
  }

  // TODO: Verify round flag and update scoreboard accordingly
  return NextResponse.json({ success: true });
}
