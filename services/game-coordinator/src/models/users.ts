import { firestore } from "./db";

export interface User {
  id: string;
  role: "admin" | "user";
  username: string;
  passwordHash: string;
  teamId: number | null;
}

export interface IUserModel {
  rootUserExists(): Promise<boolean>;
  createRootUser(
    input: Omit<User, "id" | "role" | "teamId">
  ): Promise<
    | { success: true; id: string }
    | { success: false; error: "root_user_already_exists" }
  >;

  register(
    input: Omit<User, "id" | "role" | "teamId">
  ): Promise<
    { success: true } | { success: false; error: "username_already_taken" }
  >;
  joinTeam(userId: string, teamId: number): Promise<void>;
}

class UserModel implements IUserModel {
  async rootUserExists() {
    const snapshot = await firestore
      .collection("users")
      .where("role", "==", "admin")
      .get();
    return snapshot.size > 0;
  }

  async createRootUser(
    input: Omit<User, "id" | "role" | "teamId">
  ): Promise<
    | { success: true; id: string }
    | { success: false; error: "root_user_already_exists" }
  > {
    return await firestore.runTransaction(async () => {
      const rootUserExists = await this.rootUserExists();
      if (rootUserExists) {
        return { success: false, error: "root_user_already_exists" };
      }

      const userRef = firestore.collection("users").doc();
      await userRef.set({
        ...input,
        id: userRef.id,
        role: "admin",
      });
      return { success: true, id: userRef.id };
    });
  }

  register(input: Omit<User, "id" | "role" | "teamId">) {
    return firestore.runTransaction(async (transaction) => {
      const usernameTakenSnapshot = await transaction.get(
        firestore.collection("users").where("username", "==", input.username)
      );
      if (!usernameTakenSnapshot.empty) {
        return { success: false, error: "username_already_taken" } as const;
      }

      const userRef = firestore.collection("users").doc();
      transaction.set(userRef, {
        ...input,
        id: userRef.id,
        role: "user",
      });
      return { success: true } as const;
    });
  }

  async joinTeam(userId: string, teamId: number) {
    await firestore.collection("users").doc(userId).update({ teamId });
  }
}

export const users: IUserModel = new UserModel();
