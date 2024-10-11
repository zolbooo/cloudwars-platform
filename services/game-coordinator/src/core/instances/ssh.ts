import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const secretsManagerClient = new SecretManagerServiceClient();
export async function getTeamInstanceSSHKey(teamId: number) {
  const projectId = await secretsManagerClient.getProjectId();
  const [version] = await secretsManagerClient.accessSecretVersion({
    name: secretsManagerClient.secretVersionPath(
      projectId,
      `team-${teamId}-ssh-key`,
      "latest"
    ),
  });
  if (!version.payload) {
    return { error: "instance_not_ready" } as const; // We assume that instance sends SSH key to Secrets Manager as soon as it's initialized
  }
  return { sshKey: version.payload!.data!.toString() };
}
