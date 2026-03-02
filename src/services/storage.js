import { openDB } from 'idb';

const DB_NAME = 'CallSummaryDB';
const STORE_NAME = 'calls';
const DB_VERSION = 1;

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('customerName', 'customerName', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('tags', 'tags', { multiEntry: true });
      }
    },
  });
}

export async function addCall(callData) {
  const db = await getDB();
  const record = {
    ...callData,
    id: callData.id || crypto.randomUUID(),
    date: callData.date || new Date().toISOString(),
  };
  await db.put(STORE_NAME, record);
  return record;
}

export async function getCall(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function getAllCalls() {
  const db = await getDB();
  const calls = await db.getAll(STORE_NAME);
  return calls.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function deleteCall(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function searchCalls(keyword) {
  if (!keyword || !keyword.trim()) {
    return getAllCalls();
  }

  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  const lower = keyword.toLowerCase().trim();

  const filtered = all.filter((call) => {
    if (call.customerName?.toLowerCase().includes(lower)) return true;
    if (call.caseReference?.toLowerCase().includes(lower)) return true;
    if (call.tags?.some((tag) => tag.toLowerCase().includes(lower))) return true;
    if (call.summary?.overview?.toLowerCase().includes(lower)) return true;
    return false;
  });

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}
