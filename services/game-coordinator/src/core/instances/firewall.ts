import compute from "@google-cloud/compute";

const firewallsClient = new compute.v1.FirewallsClient();

export async function setGameTrafficFlowStatus({
  enabled,
}: {
  enabled: boolean;
}) {
  await firewallsClient.patch({
    project: await firewallsClient.getProjectId(),
    firewall: "game-instances-allow-internal",
    firewallResource: {
      disabled: !enabled,
    },
  });
}
