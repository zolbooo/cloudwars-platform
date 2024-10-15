import assert from "assert/strict";
import { CloudTasksClient } from "@google-cloud/tasks";

export const client = new CloudTasksClient();
const taskQueueName = process.env.GAME_BACKGROUND_TASKS_QUEUE_NAME;

async function createStartGameTask(startDate: Date) {
  const appOrigin = process.env.APP_ORIGIN;
  assert(
    appOrigin,
    "APP_ORIGIN environment variable is not set. Did you provide it in the Terraform configuration?"
  );
  const backgroundTasksServiceAccountEmail =
    process.env.BACKGROUND_TASKS_SERVICE_ACCOUNT_EMAIL;
  assert(
    backgroundTasksServiceAccountEmail,
    "BACKGROUND_TASKS_SERVICE_ACCOUNT_EMAIL environment variable is not set. Did you provide it in the Terraform configuration?"
  );
  await client.createTask({
    parent: taskQueueName,
    task: {
      scheduleTime: {
        seconds: startDate.getTime() / 1000,
      },
      httpRequest: {
        url: `${appOrigin}/api/tasks/start-game`,
        oidcToken: {
          serviceAccountEmail: backgroundTasksServiceAccountEmail,
        },
      },
    },
  });
}

export async function scheduleGameStartAt(startDate: Date) {
  for await (const task of client.listTasksAsync({
    parent: process.env.GAME_BACKGROUND_TASKS_QUEUE_NAME,
  })) {
    await client.deleteTask({
      name: task.name,
    });
  }
  await createStartGameTask(startDate);
}
