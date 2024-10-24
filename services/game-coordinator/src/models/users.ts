import { firestore } from "./db";

export interface User {
  id: string;
  role: "admin" | "user";
  username: string;
  passwordHash: string;
  teamId: number | null;
  apiKey: { signature: string; masked: string } | null;
}

export interface IUserModel {
  getById(id: string): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;

  rootUserExists(): Promise<boolean>;
  createRootUser(
    input: Omit<User, "id" | "role" | "teamId" | "apiKey">
  ): Promise<
    | { success: true; id: string }
    | { success: false; error: "root_user_already_exists" }
  >;

  register(
    input: Omit<User, "id" | "role" | "teamId" | "apiKey">
  ): Promise<
    { success: true } | { success: false; error: "username_already_taken" }
  >;

  edit(id: string, data: Partial<Omit<User, "id">>): Promise<void>;
}

class UserModel implements IUserModel {
  async getById(id: string): Promise<User | null> {
    const userDoc = await firestore.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data() as User;
  }
  async getByUsername(username: string): Promise<User | null> {
    const snapshot = await firestore
      .collection("users")
      .where("username", "==", username)
      .get();
    if (snapshot.empty) {
      return null;
    }
    const userDoc = snapshot.docs[0];
    return userDoc.data() as User;
  }

  async rootUserExists() {
    const snapshot = await firestore
      .collection("users")
      .where("role", "==", "admin")
      .get();
    return snapshot.size > 0;
  }

  async createRootUser(
    input: Omit<User, "id" | "role" | "teamId" | "apiKey">
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
        teamId: null,
        apiKey: null,
      } satisfies User);
      return { success: true, id: userRef.id };
    });
  }

  register(input: Omit<User, "id" | "role" | "teamId" | "apiKey">) {
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
        teamId: null,
        apiKey: null,
      } satisfies User);
      return { success: true } as const;
    });
  }

  async edit(id: string, data: Partial<Omit<User, "id">>): Promise<void> {
    const userRef = firestore.collection("users").doc(id);
    await userRef.update(data);
  }
}

export const users: IUserModel = new UserModel();
