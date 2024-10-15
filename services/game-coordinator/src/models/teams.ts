import { z } from "zod";
import { FieldValue } from "@google-cloud/firestore";

import { firestore } from "./db";
import { metadata } from "./metadata";
import { users } from "./users";

export const serviceStatusSchema = z.enum(["UP", "MUMBLE", "CORRUPT", "DOWN"]);
export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type ServiceStatusDetails = { push: ServiceStatus; pull: ServiceStatus };

export interface Team {
  id: number;
  name: string;
  index: number;
  score: {
    total: number;
    attack: number;
    defense: number;
    availability: number;
  };
  serviceStatus: Record<string, ServiceStatusDetails>;
  teamPasswordHash: string;
}

export interface ITeamsModel {
  getTeamById(id: number): Promise<Team | null>;
  listTeams(): Promise<Omit<Team, "teamPasswordHash">[]>;
  createTeam(
    userId: string,
    input: Omit<Team, "id" | "index" | "score">
  ): Promise<
    | { success: true; teamId: number }
    | {
        success: false;
        error:
          | "team_name_already_taken"
          | "max_teams_reached"
          | "setup_not_finished";
      }
  >;

  updateScore(teamId: number, scores: Team["score"]): Promise<void>;
  updateServiceStatus(
    teamId: number,
    serviceName: string,
    serviceStatusDetails: ServiceStatusDetails
  ): Promise<void>;
}

class TeamsModel implements ITeamsModel {
  async getTeamById(id: number) {
    const snapshot = await firestore
      .collection("teams")
      .doc(id.toString())
      .get();
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

      const id = totalTeams + 1;
      await firestore
        .collection("teams")
        .doc(id.toString())
        .create({
          ...input,
          id,
          score: {
            total: 0,
            attack: 0,
            defense: 0,
            availability: 0,
          },
        });

      await users.edit(userId, { teamId: id });
      return { success: true, teamId: id } as const;
    });
  }

  async updateScore(teamId: number, scores: Team["score"]): Promise<void> {
    await firestore
      .collection("teams")
      .doc(teamId.toString())
      .update({
        "score.total": FieldValue.increment(scores.total),
        "score.attack": FieldValue.increment(scores.attack),
        "score.defense": FieldValue.increment(scores.defense),
        "score.availability": FieldValue.increment(scores.availability),
      });
  }

  async updateServiceStatus(
    teamId: number,
    serviceName: string,
    serviceStatusDetails: ServiceStatusDetails
  ): Promise<void> {
    await firestore
      .collection("teams")
      .doc(teamId.toString())
      .update({
        [`serviceStatus.${serviceName}`]: serviceStatusDetails,
      });
  }
}

export const teams: ITeamsModel = new TeamsModel();
