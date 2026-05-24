import type { User } from "@/types";

export const USERS_COLLECTION = "users";
export type UserModel = User;

export const userCollectionIndexes = [
  { key: { email: 1 }, unique: true },
  { key: { username: 1 }, unique: true, sparse: true },
  { key: { createdAt: -1 } },
];
