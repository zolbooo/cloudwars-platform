import assert from "assert/strict";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

const oauthClient = new OAuth2Client();
const backgroundTasksServiceAccountEmail =
  process.env.BACKGROUND_TASKS_SERVICE_ACCOUNT_EMAIL;

export const backgroundTaskRoute =
  <R>(handler: (req: NextRequest) => R) =>
  async (req: NextRequest) => {
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
    return await handler(req);
  };
