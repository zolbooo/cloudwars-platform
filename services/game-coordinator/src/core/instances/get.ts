import compute from "@google-cloud/compute";

import { GameInstance } from "./list";

const instancesClient = new compute.InstancesClient();

export async function getGameInstance(
  teamId: number
): Promise<GameInstance | null> {
  const projectId = await instancesClient.getProjectId();
  for await (const [zone, data] of instancesClient.aggregatedListAsync({
    project: projectId,
    filter: `labels.purpose = "game-instance" AND labels.team_id: = ${teamId}`,
    maxResults: 2,
  })) {
    if (!data.instances) {
      continue;
    }
    for (const instance of data.instances) {
      return {
        name: instance.name!,
        zone: zone.split("/").pop()!,
        publicIP: instance.networkInterfaces![0].accessConfigs![0].natIP!,
        internalIP: instance.networkInterfaces![0].networkIP!,
        teamId: Number(instance.labels!.team_id!),
      };
    }
  }
  return null;
}
