import { firestore } from "./db";
import { metadata } from "./metadata";
import { users } from "./users";

export interface Team {
  id: string;
  name: string;
  index: number;
  score: {
    total: number;
    attack: number;
    defense: number;
    availability: number;
  };
  teamPasswordHash: string;
}

export interface ITeamsModel {
  getTeamById(id: string): Promise<Team | null>;
  listTeams(): Promise<Omit<Team, "teamPasswordHash">[]>;
  createTeam(
    userId: string,
    input: Omit<Team, "id" | "index" | "score">
  ): Promise<
    | { success: true; teamId: string }
    | {
        success: false;
        error:
          | "team_name_already_taken"
          | "max_teams_reached"
          | "setup_not_finished";
      }
  >;
}

class TeamsModel implements ITeamsModel {
  async getTeamById(id: string) {
    const snapshot = await firestore.collection("teams").doc(id).get();
    if (!snapshot.exists) {
      return null;
    }
    return snapshot.data() as Team;
  }

  async listTeams() {
    const snapshot = await firestore
      .collection("teams")
      .orderBy("score.total", "desc")
      .get();
    return snapshot.docs.map((doc) => {
      const { teamPasswordHash: _, ...data } = doc.data() as Team;
      return data;
    });
  }

  async createTeam(
    userId: string,
    input: Omit<Team, "id" | "index" | "score">
  ) {
    return await firestore.runTransaction(async () => {
      const config = await metadata.getGameSettings();
      if (!config) {
        return { success: false, error: "setup_not_finished" } as const;
      }
      const totalTeams = await firestore
        .collection("teams")
        .get()
        .then((snapshot) => snapshot.size);
      if (totalTeams >= config.maxTeams) {
        return { success: false, error: "max_teams_reached" } as const;
      }

      const snapshot = await firestore
        .collection("teams")
        .where("name", "==", input.name)
        .get();
      if (!snapshot.empty) {
        return { success: false, error: "team_name_already_taken" } as const;
      }

      const teamRef = firestore.collection("teams").doc();
      await teamRef.set({
        ...input,
        id: teamRef.id,
        index: totalTeams,
        score: {
          total: 0,
          attack: 0,
          defense: 0,
          availability: 0,
        },
      } satisfies Team);

      await users.joinTeam(userId, teamRef.id);
      return { success: true, teamId: teamRef.id } as const;
    });
  }
}

export const teams: ITeamsModel = new TeamsModel();
