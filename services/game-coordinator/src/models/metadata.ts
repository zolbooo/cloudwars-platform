import { GameStatus } from "@/api/game/status.schema";

import { firestore } from "./db";

export interface GameSettings {
  maxTeams: number;
  teamMaxSize: number;
  startDate: Date;
  endDate: Date;
  roundDurationMinutes: number;
  scoreWeights: {
    attack: number;
    defense: number;
    availability: number;
  };
  flagLifetimeRounds: number;
}

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
      return { status: "pending" };
    }
    return snapshot.data() as GameStatus;
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
