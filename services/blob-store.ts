/**
 * Client-side encrypted-blob store (IndexedDB).
 *
 * Holds vault ciphertext in the browser. This is the honest stand-in for real
 * remote object storage, which lands in Step 3 — the interface (put/get/delete
 * by vault id) stays identical, so swapping the backend won't touch callers.
 *
 * NOTE: ciphertext only. The content key never touches this store.
 */

const DB_NAME = "vaultdrop";
const STORE = "blobs";
const VERSION = 1;

export interface StoredBlob {
  id: string;
  ciphertext: ArrayBuffer;
  ivB64: string;
  name: string;
  type: string;
  size: number;
}

function hasIndexedDb(): boolean {
  return typeof globalThis !== "undefined" && "indexedDB" in globalThis;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(
        new Error("IndexedDB unavailable (server or unsupported browser)"),
      );
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export function putBlob(blob: StoredBlob): Promise<void> {
  return tx("readwrite", (store) => store.put(blob)).then(() => undefined);
}

export async function getBlob(id: string): Promise<StoredBlob | null> {
  try {
    const result = await tx<StoredBlob | undefined>("readonly", (store) =>
      store.get(id),
    );
    return result ?? null;
  } catch {
    return null;
  }
}

export function deleteBlob(id: string): Promise<void> {
  return tx("readwrite", (store) => store.delete(id)).then(() => undefined);
}
