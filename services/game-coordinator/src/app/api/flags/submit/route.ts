import assert from "assert/strict";
import { NextRequest, NextResponse } from "next/server";

import { metadata } from "@/models/metadata";
import { verifyFlag } from "@/core/flags/verify";
import { getApiKeyUser } from "@/core/auth/session";

/*
 * Flag submission endpoint (PUT /api/flags/submit)
 * Response codes:
 * - 401: Unauthorized, invalid or missing key
 * - 415: Unsupported content type, only text/plain requests are supported
 * - 202: Flag accepted and attack points awarded if this flag was not previously submitted
 * - 406: Invalid flag
 * - 498: Flag expired
 * - 410: Game is over
 * - 429: Rate limit exceeded
 */
export async function PUT(req: NextRequest) {
  const user = await getApiKeyUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO: Rate limit request by the team

  const gameStatus = await metadata.getGameStatus();
  if (gameStatus.status === "finished") {
    return NextResponse.json({ error: "game_over" }, { status: 410 });
  }

  if (req.headers.get("content-type") !== "text/plain") {
    return NextResponse.json(
      { error: "unsupported_content_type" },
      { status: 415 }
    );
  }
  const flag = await req.text();
  if (!flag.includes("{") || !flag.includes("}")) {
    return NextResponse.json({ error: "invalid_flag" }, { status: 406 });
  }
  const flagData = await verifyFlag(flag);
  if (!flagData) {
    return NextResponse.json({ error: "invalid_flag" }, { status: 406 });
  }

  const gameSettings = await metadata.getGameSettings();
  assert(gameSettings, "Game settings not found, but flag was submitted");
  if (
    flagData.round <
    gameStatus.currentRound - gameSettings.flagLifetimeRounds
  ) {
    return NextResponse.json({ error: "flag_expired" }, { status: 498 });
  }
  // TODO: Update score if flag was not previously submitted
  return NextResponse.json({ success: true }, { status: 202 });
}
