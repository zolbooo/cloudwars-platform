import assert from "assert";
import { JobsClient } from "@google-cloud/run";

import { teams } from "@/models/teams";
import { metadata } from "@/models/metadata";

const client = new JobsClient();

export async function startCheckers(mode: "push" | "pull") {
  const checkerDispatcherJobName = process.env.CHECKER_DISPATCHER_JOB_NAME;
  if (!checkerDispatcherJobName) {
    throw new Error(
      "CHECKER_DISPATCHER_JOB_NAME environment variable is not defined. Was it provided by the Terraform configuration?"
    );
  }

  const gameStatus = await metadata.getGameStatus();
  assert(gameStatus.status === "running", "Game is not running");
  const totalTeams = await teams.getTotalTeams();

  await client.runJob({
    name: checkerDispatcherJobName,
    overrides: {
      containerOverrides: [
        {
          args: [
            "--current-round",
            gameStatus.currentRound.toString(),
            "--total-teams",
            totalTeams.toString(),
            "--checker-mode",
            mode,
            "--metadata",
            // TODO: Add strict validation to the metadata
            JSON.stringify({
              checkerRound: gameStatus.currentRound,
              startedAt: Date.now(),
            }),
          ],
        },
      ],
    },
  });
}
