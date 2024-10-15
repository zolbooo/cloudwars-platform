import assert from "assert";
import { CloudSchedulerClient } from "@google-cloud/scheduler";

const client = new CloudSchedulerClient();
const roundProgressJobName = process.env.ROUND_PROGRESS_JOB_NAME;

export async function startRounds() {
  assert(
    roundProgressJobName,
    "ROUND_PROGRESS_JOB_NAME environment variable is not set. Did you provide it in the Terraform configuration?"
  );
  await client.resumeJob({
    name: roundProgressJobName,
  });
}

export async function stopRounds() {
  assert(
    roundProgressJobName,
    "ROUND_PROGRESS_JOB_NAME environment variable is not set. Did you provide it in the Terraform configuration?"
  );
  await client.pauseJob({
    name: roundProgressJobName,
  });
}
