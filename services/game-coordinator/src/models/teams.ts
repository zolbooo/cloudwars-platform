import { z } from "zod";
import { FieldValue } from "@google-cloud/firestore";

import { firestore } from "./db";

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
  create(input: Omit<Team, "score" | "serviceStatus">): Promise<void>;

  getTeamById(id: number): Promise<Team | null>;
  listTeams(): Promise<Omit<Team, "teamPasswordHash">[]>;

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

  async create({ id, ...input }: Omit<Team, "score" | "serviceStatus">) {
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
        serviceStatus: {},
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
