import type { Document } from "@/types";

export const DOCUMENTS_COLLECTION = "documents";
export type DocumentModel = Document;

export interface DocumentQuery {
  userId: string;
  type?: string;
  status?: string;
  _id?: string;
}

export const documentCollectionIndexes = [
  { key: { userId: 1, createdAt: -1 } },
  { key: { userId: 1, type: 1 } },
  { key: { publicUrl: 1 }, unique: true, sparse: true },
  { key: { createdAt: -1 } },
];
