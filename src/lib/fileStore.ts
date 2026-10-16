import type { FileKey } from '../types'

/**
 * 本机文件仓库：头像与简历原文件保存在浏览器 IndexedDB 中（避免 localStorage 5MB 限制），
 * 读取时生成 object URL 供页面预览 / 下载。若浏览器禁用 IndexedDB（例如直接双击 file:// 打开），
 * 自动退化为内存存储，本次会话内依然可用。
 */

const DB_NAME = 'showcase-files'
const STORE_NAME = 'profile-files'
const DB_VERSION = 1

export interface StoredFile {
  key: FileKey
  name: string
  type: string
  size: number
  blob: Blob
  /** 本机预览 / 下载用的 object URL */
  url: string
}

export interface FileState {
  ready: boolean
  avatar?: StoredFile
  resume?: StoredFile
}

type RawRecord = { key: FileKey; name: string; type: string; size: number; blob: Blob }

let state: FileState = { ready: false }
const listeners = new Set<() => void>()
const memory = new Map<FileKey, RawRecord>()
let dbPromise: Promise<IDBDatabase | null> | null = null
/** IndexedDB 不可用时置为 true，后续直接走内存 */
let idbBroken = false

function emit() {
  for (const listener of listeners) listener()
}

function setKey(key: FileKey, value: StoredFile | undefined) {
  state = key === 'avatar' ? { ...state, avatar: value } : { ...state, resume: value }
}

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null)
        return
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        idbBroken = true
        resolve(null)
      }
      request.onblocked = () => resolve(null)
    } catch {
      idbBroken = true
      resolve(null)
    }
  })
  return dbPromise
}

function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest,
): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          resolve(null)
          return
        }
        try {
          const transaction = db.transaction(STORE_NAME, mode)
          const request = action(transaction.objectStore(STORE_NAME))
          request.onsuccess = () => resolve(request.result as T)
          request.onerror = () => resolve(null)
          transaction.onerror = () => resolve(null)
          transaction.onabort = () => resolve(null)
        } catch {
          idbBroken = true
          resolve(null)
        }
      }),
  )
}

async function readRecord(key: FileKey): Promise<RawRecord | null> {
  if (!idbBroken) {
    const record = await run<RawRecord>('readonly', (store) => store.get(key))
    if (record && record.blob instanceof Blob) {
      memory.set(key, record)
      return record
    }
  }
  return memory.get(key) ?? null
}

async function writeRecord(record: RawRecord): Promise<void> {
  memory.set(record.key, record)
  if (!idbBroken) {
    await run('readwrite', (store) => store.put(record))
  }
}

async function deleteRecord(key: FileKey): Promise<void> {
  memory.delete(key)
  if (!idbBroken) {
    await run('readwrite', (store) => store.delete(key))
  }
}

async function loadInto(key: FileKey): Promise<void> {
  const record = await readRecord(key)
  const previous = key === 'avatar' ? state.avatar : state.resume
  if (!record) {
    if (previous) URL.revokeObjectURL(previous.url)
    setKey(key, undefined)
    return
  }
  if (previous) URL.revokeObjectURL(previous.url)
  setKey(key, {
    key,
    name: record.name,
    type: record.type,
    size: record.size,
    blob: record.blob,
    url: URL.createObjectURL(record.blob),
  })
}

/** 启动时调用一次，把本机已保存的头像 / 简历读进内存状态 */
export async function initFiles(): Promise<void> {
  await Promise.all([loadInto('avatar'), loadInto('resume')])
  state = { ...state, ready: true }
  emit()
}

export function subscribeFiles(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getFileState(): FileState {
  return state
}

export async function saveLocalFile(key: FileKey, file: File): Promise<StoredFile> {
  await writeRecord({ key, name: file.name, type: file.type, size: file.size, blob: file })
  await loadInto(key)
  emit()
  return getRecord(key) as StoredFile
}

export async function removeLocalFile(key: FileKey): Promise<void> {
  await deleteRecord(key)
  const previous = key === 'avatar' ? state.avatar : state.resume
  if (previous) URL.revokeObjectURL(previous.url)
  setKey(key, undefined)
  emit()
}

export function getRecord(key: FileKey): StoredFile | undefined {
  return key === 'avatar' ? state.avatar : state.resume
}
