import { JsonWebKeySet } from "jwt-gcp-kms";
import { NextRequest, NextResponse } from "next/server";

import { getFlagSigningPublicKeys } from "@/core/flags/keys";

let jwks: JsonWebKeySet | null = null;
export async function GET(req: NextRequest) {
  if (!jwks || req.headers.has("x-revalidate")) {
    jwks = await getFlagSigningPublicKeys();
  }
  return NextResponse.json(jwks);
}
