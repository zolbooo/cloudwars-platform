import { firestore } from "./db";

export interface GameSettings {
  teamMaxSize: number;
  startDate: Date;
  endDate: Date;
  roundDurationMinutes: number;
}

export interface IMetadataModel {
  getGameSettings(): Promise<GameSettings | null>;
  updateGameSettings(settings: Partial<GameSettings>): Promise<void>;
}

class MetadataModel implements IMetadataModel {
  async getGameSettings() {
    const snapshot = await firestore.collection("metadata").doc("game").get();
    return (snapshot.data() as GameSettings | undefined) ?? null;
  }

  async updateGameSettings(settings: Partial<GameSettings>) {
    await firestore.collection("metadata").doc("game").update(settings);
  }
}

export const metadata: IMetadataModel = new MetadataModel();
