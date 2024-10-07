import { redirect } from "next/navigation";

import { users } from "@/models/users";
import { metadata } from "@/models/metadata";

export default async function Home() {
  const rootUserExists = await users.rootUserExists();
  if (!rootUserExists) {
    return redirect("/setup/root-user");
  }
  const gameSettings = await metadata.getGameSettings();
  if (gameSettings === null) {
    return redirect("/setup/game-settings");
  }
  return null;
}
