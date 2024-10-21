import { NextRequest, NextResponse } from "next/server";

import { getApiKeyUser } from "@/core/auth/session";

/*
 * Flag submission endpoint (PUT /api/flags/submit)
 * Response codes:
 * - 401: Unauthorized, invalid or missing key
 * - 415: Unsupported content type, only text/plain requests are supported
 * - 202: Flag accepted and attack points awarded
 * - 406: Invalid flag
 * - 409: Flag was already submitted
 */
export async function PUT(req: NextRequest) {
  const user = await getApiKeyUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (req.headers.get("content-type") !== "text/plain") {
    return NextResponse.json(
      { error: "unsupported_content_type" },
      { status: 415 }
    );
  }
  const flag = await req.text();
  // TODO: Handle flag submission
  return NextResponse.json({ success: true }, { status: 202 });
}
