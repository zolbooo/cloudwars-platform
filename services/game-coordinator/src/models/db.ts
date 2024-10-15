import { Firestore } from "@google-cloud/firestore";

export const firestore = new Firestore();

export async function runTransaction<T>(transaction: () => Promise<T>) {
  return await firestore.runTransaction(transaction);
}
