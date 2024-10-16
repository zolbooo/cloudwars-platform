import assert from "assert/strict";
import { z } from "zod";

import { GameSettings } from "@/api/setup.schema";

import { firestore } from "./db";

import { metadata } from "./metadata";
import { Team, teams } from "./teams";

const attackHistoryEntry = z.object({
  type: z.literal("attack"),
  service: z.string(),
  team: z.number().int().positive(),
  target: z.number().int().positive(),
  round: z.number().int().positive(),
  points: z.number(),
  date: z.date(),
  idempotencyKey: z.string(),
});
const defenseHistoryEntry = z.object({
  type: z.literal("defense"),
  team: z.number().int().positive(),
  service: z.string(),
  round: z.number().int().positive(),
  points: z.number(),
  date: z.date(),
  idempotencyKey: z.string(),
});
const availabilityHistoryEntry = z.object({
  type: z.literal("availability"),
  team: z.number().int().positive(),
  service: z.string(),
  round: z.number().int().positive(),
  points: z.number(),
  date: z.date(),
  idempotencyKey: z.string(),
});
export const roundHistoryEntry = z.discriminatedUnion("type", [
  attackHistoryEntry,
  defenseHistoryEntry,
  availabilityHistoryEntry,
]);
export type RoundHistoryEntry = z.infer<typeof roundHistoryEntry>;

export interface IRoundHistoryModel {
  push(entry: Omit<RoundHistoryEntry, "idempotencyKey">): Promise<void>;
  list(page: number): Promise<RoundHistoryEntry[]>;
}

function computeIdempotencyKey(
  entry: Omit<RoundHistoryEntry, "idempotencyKey" | "points">
): string {
  if (entry.type === "attack") {
    const { service, team, target, round } = entry as z.infer<
      typeof attackHistoryEntry
    >;
    return `attack:${service}-${team}-${target}-${round}`;
  }
  const { type, team, service, round } = entry;
  return `${type}:${team}-${service}-${round}`;
}

function calculateTeamScoreDelta(
  entry: Omit<RoundHistoryEntry, "idempotencyKey" | "points">,
  gameSettings: GameSettings
): [delta: Team["score"], points: number] {
  if (entry.type === "attack") {
    return [
      {
        total: gameSettings.scoreWeights.attack,
        attack: gameSettings.scoreWeights.attack,
        defense: 0,
        availability: 0,
      },
      gameSettings.scoreWeights.attack,
    ];
  }
  if (entry.type === "defense") {
    return [
      {
        total: gameSettings.scoreWeights.defense,
        attack: 0,
        defense: gameSettings.scoreWeights.defense,
        availability: 0,
      },
      gameSettings.scoreWeights.defense,
    ];
  }
  assert(entry.type === "availability");
  return [
    {
      total: gameSettings.scoreWeights.availability,
      attack: 0,
      defense: 0,
      availability: gameSettings.scoreWeights.availability,
    },
    gameSettings.scoreWeights.availability,
  ];
}

class RoundHistoryModel implements IRoundHistoryModel {
  async push(entry: Omit<RoundHistoryEntry, "idempotencyKey" | "points">) {
    await firestore.runTransaction(async () => {
      const gameSettings = await metadata.getGameSettings();
      if (!gameSettings) {
        return { success: false, error: "game_not_started" };
      }

      const historyEntrySnapshot = await firestore
        .collection("roundHistory")
        .where("idempotencyKey", "==", computeIdempotencyKey(entry))
        .get();
      if (!historyEntrySnapshot.empty) {
        return { success: false, error: "idempotency_key_conflict" };
      }

      const team = await teams.getById(entry.team);
      if (!team) {
        return { success: false, error: "team_not_found" };
      }

      const [delta, points] = calculateTeamScoreDelta(entry, gameSettings);
      const roundHistoryEntry = {
        ...entry,
        idempotencyKey: computeIdempotencyKey(entry),
        points,
      } as RoundHistoryEntry;
      await firestore.collection("roundHistory").add(roundHistoryEntry);
      await teams.updateScore(team.id, delta);
    });
  }

  async list(page: number): Promise<RoundHistoryEntry[]> {
    const PAGE_SIZE = 50;
    const snapshot = await firestore
      .collection("roundHistory")
      .offset((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get();
    return roundHistoryEntry
      .array()
      .parse(snapshot.docs.map((doc) => doc.data()));
  }
}

export const roundHistory = new RoundHistoryModel();
