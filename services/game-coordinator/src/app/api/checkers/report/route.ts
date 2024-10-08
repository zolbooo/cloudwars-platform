import assert from "assert/strict";
import { z } from "zod";
import { verifyJWT } from "jwt-gcp-kms";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

import { getFlagSigningPublicKeys } from "@/core/flags/keys";

import { metadata } from "@/models/metadata";
import { serviceStatusSchema, teams } from "@/models/teams";

export const dynamic = "force-dynamic";

const checkerReportSchema = z.strictObject({
  service: z.string(),
  status: z.strictObject({
    push: serviceStatusSchema,
    pull: serviceStatusSchema,
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

  const { data } = validationResult;
  let flagData: { round: number; team_id: number; service_name: string };
  try {
    const flagToken = data.roundFlag.split("{")[1].split("}")[0];
    flagData = await verifyJWT(flagToken, await getFlagSigningPublicKeys());
    assert(flagData.service_name === data.service);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "invalid_flag",
      },
      { status: 400 }
    );
  }

  await teams.updateServiceStatus(flagData.team_id, data.service, data.status);
  return NextResponse.json({ success: true });
}
