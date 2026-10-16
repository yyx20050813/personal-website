import { AUTH_KEY } from './profileStore'

/**
 * 管理后台口令。纯前端项目没有服务端，这里只是“防误入”的软门槛：
 * 口令经过一次哈希后存到 localStorage，不进代码仓库、也不随导出数据外泄。
 * 重要说明：任何访问者仍然可以直接读到本地数据与源码，请勿放置隐私敏感内容。
 */

export const DEFAULT_PASSWORD = 'admin123'

interface AuthRecord {
  hash: string
  updatedAt: string
  tip: string
}

/** 优先用 Web Crypto 的 SHA-256；file:// 等非安全上下文下退化为内置哈希 */
async function hash(text: string): Promise<string> {
  try {
    if (globalThis.crypto?.subtle) {
      const bytes = new TextEncoder().encode(text)
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      return `sha256:${Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`
    }
  } catch {
    /* 落到下面的降级实现 */
  }
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i)
    h1 = (h1 ^ code) * 0x01000193
    h2 = (h2 + code * (i + 1)) ^ (h2 << 5)
  }
  return `fnv:${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`
}

function readRecord(): AuthRecord | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthRecord) : null
  } catch {
    return null
  }
}

export function getAuthTip(): string {
  return readRecord()?.tip ?? '默认口令 admin123'
}

export function isPasswordSet(): boolean {
  return readRecord() !== null
}

export async function verifyPassword(input: string): Promise<boolean> {
  const record = readRecord()
  const inputHash = await hash(input)
  if (!record) return input === DEFAULT_PASSWORD
  return record.hash === inputHash
}

export async function setPassword(input: string, tip = ''): Promise<boolean> {
  try {
    const record: AuthRecord = { hash: await hash(input), updatedAt: new Date().toISOString(), tip }
    localStorage.setItem(AUTH_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

/** 忘记口令时：清掉本机口令记录，回到默认口令 admin123 */
export function resetPassword(): void {
  try {
    localStorage.removeItem(AUTH_KEY)
  } catch {
    /* 忽略 */
  }
}

const SESSION_KEY = 'showcase.session.v1'

export function markSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* 忽略 */
  }
}

export function hasSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* 忽略 */
  }
}
