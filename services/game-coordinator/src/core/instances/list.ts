import compute from "@google-cloud/compute";

const instancesClient = new compute.InstancesClient();

export interface GameInstance {
  name: string;
  zone: string;
  publicIP: string;
  internalIP: string;
  teamId: number;
}

export async function listGameInstances() {
  const projectId = await instancesClient.getProjectId();
  const instances: GameInstance[] = [];
  for await (const [zone, data] of instancesClient.aggregatedListAsync({
    project: projectId,
    filter: 'labels.purpose = "game-instance" AND labels.team_id:*',
  })) {
    if (!data.instances) {
      continue;
    }
    for (const instance of data.instances) {
      instances.push({
        name: instance.name!,
        zone: zone.split("/").pop()!,
        publicIP: instance.networkInterfaces![0].accessConfigs![0].natIP!,
        internalIP: instance.networkInterfaces![0].networkIP!,
        teamId: Number(instance.labels!.team_id!),
      });
    }
  }
  return instances;
}
