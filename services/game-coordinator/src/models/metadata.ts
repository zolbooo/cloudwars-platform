import { GameSettings } from "@/api/setup.schema";
import { GameStatus, gameStatusSchema } from "@/api/game/status.schema";

import { firestore } from "./db";

export interface IMetadataModel {
  getGameStatus(): Promise<GameStatus>;
  setGameStatus(status: Partial<GameStatus>): Promise<void>;

  getGameSettings(): Promise<GameSettings | null>;
  updateGameSettings(settings: Partial<GameSettings>): Promise<void>;
}

class MetadataModel implements IMetadataModel {
  async getGameStatus(): Promise<GameStatus> {
    const snapshot = await firestore
      .collection("metadata")
      .doc("gameStatus")
      .get();
    if (!snapshot.exists) {
      return { status: "pending", currentRound: 0, roundStartedAt: null };
    }
    return gameStatusSchema.parse(snapshot.data());
  }

  async setGameStatus(status: Partial<GameStatus>) {
    await firestore
      .collection("metadata")
      .doc("gameStatus")
      .set(status, { merge: true });
  }

  async getGameSettings() {
    const snapshot = await firestore.collection("metadata").doc("game").get();
    return (snapshot.data() as GameSettings | undefined) ?? null;
  }

  async updateGameSettings(settings: Partial<GameSettings>) {
    await firestore.collection("metadata").doc("game").update(settings);
  }
}

export const metadata: IMetadataModel = new MetadataModel();
