import assert from "assert/strict";
import { getPublicKeys } from "jwt-gcp-kms";
import { KeyManagementServiceClient } from "@google-cloud/kms";

const client = new KeyManagementServiceClient();
export async function getFlagSigningPublicKeys() {
  const projectId = process.env.GCP_PROJECT_ID ?? (await client.getProjectId());
  const keyRing = process.env.GAME_KEY_RING_NAME;
  assert(keyRing, "GAME_KEY_RING_NAME environment variable must be set");
  const keyName = process.env.FLAG_KEY_NAME;
  assert(keyName, "GAME_KEY_NAME environment variable must be set");
  const region = process.env.FLAG_KEY_REGION;
  assert(region, "GAME_KEY_REGION environment variable must be set");
  return getPublicKeys(client, {
    projectId,
    keyRing,
    keyName,
    region,
  });
}
