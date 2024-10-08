import { redirect } from "next/navigation";

import { users } from "@/models/users";
import { metadata } from "@/models/metadata";

// Force Next.js to treat this route as server-side rendered
// Without this line, during the build process, Next.js will treat this route as static and build a static HTML file for it
export const dynamic = "force-dynamic";

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
