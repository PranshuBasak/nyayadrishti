import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface StoredDocument {
  id: string;
  title: string;
  type: string;
  rawText: string;
  clauses: any[];
  parsedAt: number;
}

export interface StoredMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: {
    clauseId?: string;
    clauseNumber?: string;
    actName?: string;
    section?: string;
  }[];
  timestamp: number;
  language?: string;
}

export interface StoredTranscript {
  id: string;
  sessionId: string;
  speaker: "user" | "nyaya";
  originalText: string;
  translatedText?: string;
  timestamp: number;
}

export interface StoredRedline {
  id: string;
  documentId: string;
  clauseNumber: string;
  originalClause: string;
  suggestedClause: string;
  reasoning: string;
  status: "draft" | "accepted" | "rejected";
}

export interface StoredTimelineItem {
  id: string;
  sessionId: string;
  date: string;
  event: string;
  parties: string;
  evidence: string;
}

export interface StoredResearchItem {
  id: string;
  query: string;
  sourceUrl: string;
  sourceName: string;
  title: string;
  snippet: string;
  fetchedAt: number;
}

interface NyayaDBSchema extends DBSchema {
  workspace: { key: string; value: { id: string; value: unknown } };
  documents: {
    key: string;
    value: StoredDocument;
  };
  messages: {
    key: string;
    value: StoredMessage;
    indexes: { "by-session": string };
  };
  transcripts: {
    key: string;
    value: StoredTranscript;
    indexes: { "by-session": string };
  };
  redlines: {
    key: string;
    value: StoredRedline;
    indexes: { "by-doc": string };
  };
  caseTimeline: {
    key: string;
    value: StoredTimelineItem;
    indexes: { "by-session": string };
  };
  researchCache: {
    key: string;
    value: StoredResearchItem;
    indexes: { "by-query": string };
  };
}

const DB_NAME = "NyayaDrishtiDB";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<NyayaDBSchema>> | null = null;

export function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<NyayaDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("workspace"))
          db.createObjectStore("workspace", { keyPath: "id" });
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("messages")) {
          const msgStore = db.createObjectStore("messages", { keyPath: "id" });
          msgStore.createIndex("by-session", "sessionId");
        }
        if (!db.objectStoreNames.contains("transcripts")) {
          const tStore = db.createObjectStore("transcripts", { keyPath: "id" });
          tStore.createIndex("by-session", "sessionId");
        }
        if (!db.objectStoreNames.contains("redlines")) {
          const rStore = db.createObjectStore("redlines", { keyPath: "id" });
          rStore.createIndex("by-doc", "documentId");
        }
        if (!db.objectStoreNames.contains("caseTimeline")) {
          const timeStore = db.createObjectStore("caseTimeline", {
            keyPath: "id",
          });
          timeStore.createIndex("by-session", "sessionId");
        }
        if (!db.objectStoreNames.contains("researchCache")) {
          const resStore = db.createObjectStore("researchCache", {
            keyPath: "id",
          });
          resStore.createIndex("by-query", "query");
        }
      },
    });
  }
  return dbPromise;
}

// Document operations
export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await getDB();
  if (db) await db.put("documents", doc);
}

export async function getDocument(
  id: string,
): Promise<StoredDocument | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return db.get("documents", id);
}

export async function getAllDocuments(): Promise<StoredDocument[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll("documents");
}

// Chat Messages operations
export async function saveMessage(msg: StoredMessage): Promise<void> {
  const db = await getDB();
  if (db) await db.put("messages", msg);
}

export async function getSessionMessages(
  sessionId: string,
): Promise<StoredMessage[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex("messages", "by-session", sessionId);
}

// Transcripts
export async function saveTranscript(t: StoredTranscript): Promise<void> {
  const db = await getDB();
  if (db) await db.put("transcripts", t);
}

export async function getSessionTranscripts(
  sessionId: string,
): Promise<StoredTranscript[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex("transcripts", "by-session", sessionId);
}

// Timeline operations
export async function saveTimelineItem(
  item: StoredTimelineItem,
): Promise<void> {
  const db = await getDB();
  if (db) await db.put("caseTimeline", item);
}

export async function getSessionTimeline(
  sessionId: string,
): Promise<StoredTimelineItem[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex("caseTimeline", "by-session", sessionId);
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.clear("documents");
  await db.clear("messages");
  await db.clear("transcripts");
  await db.clear("redlines");
  await db.clear("caseTimeline");
  await db.clear("researchCache");
  await db.clear("workspace");
}

export async function readWorkspace<T>(id: string): Promise<T | undefined> {
  const db = await getDB();
  return (await db?.get("workspace", id))?.value as T | undefined;
}
export async function writeWorkspace(id: string, value: unknown) {
  const db = await getDB();
  if (!db) throw Error("Storage unavailable");
  await db.put("workspace", { id, value });
}
