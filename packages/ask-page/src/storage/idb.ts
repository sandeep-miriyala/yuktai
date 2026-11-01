// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/storage/idb.ts
// A tiny IndexedDB key-value store (settings, pins, cache list, and vectors
// when OPFS is missing). Every call fails soft: no IndexedDB → null.
// ─────────────────────────────────────────────────────────────────────────────

const DB = "yuktai-ask"
const STORE = "kv"
let dbp: Promise<IDBDatabase | null> | null = null

function open(): Promise<IDBDatabase | null> {
  if (dbp) return dbp
  dbp = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null)
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbp
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | null> {
  return open().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null)
        try {
          const tx = db.transaction(STORE, mode)
          const req = fn(tx.objectStore(STORE))
          tx.oncomplete = () => resolve(req ? (req.result as T) : null)
          tx.onerror = () => resolve(null)
          tx.onabort = () => resolve(null)
        } catch {
          resolve(null)
        }
      }),
  )
}

export const idb = {
  async available(): Promise<boolean> {
    return (await open()) !== null
  },
  get<T = unknown>(key: string): Promise<T | null> {
    return run<T>("readonly", (s) => s.get(key) as IDBRequest<T>)
  },
  async set(key: string, value: unknown): Promise<boolean> {
    const r = await run("readwrite", (s) => s.put(value, key))
    return r !== null || (await open()) !== null
  },
  async del(key: string): Promise<void> {
    await run("readwrite", (s) => s.delete(key))
  },
  async keys(): Promise<string[]> {
    return ((await run<IDBValidKey[]>("readonly", (s) => s.getAllKeys())) ?? []).map(String)
  },
}
