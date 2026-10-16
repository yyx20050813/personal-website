import type { Profile, ProfileSource } from '../types'
import { builtinProfile, cloneProfile, normalizeProfile } from './normalize'

export const PROFILE_KEY = 'showcase.profile.v1'
export const THEME_KEY = 'showcase.theme.v1'
export const AUTH_KEY = 'showcase.auth.v1'

export function staticProfileUrl(): string {
  return `${import.meta.env.BASE_URL}data/profile.json`
}

/** 读取放在 public/data/profile.json 的“已发布静态数据”；本地直接双击打开时会被浏览器拦截，静默忽略 */
async function fetchPublishedProfile(): Promise<Profile | null> {
  try {
    const res = await fetch(staticProfileUrl(), { cache: 'no-cache' })
    if (!res.ok) return null
    return normalizeProfile(await res.json(), builtinProfile)
  } catch {
    return null
  }
}

export function readLocalRaw(): unknown | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocalRaw(profile: Profile): boolean {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    return true
  } catch {
    return false
  }
}

/**
 * 全站数据源。优先级：本机修改（localStorage） > public/data/profile.json > 打包内置数据。
 * 用 useSyncExternalStore 订阅，管理后台保存后页面立即同步。
 */
class ProfileStore {
  private snapshot: Profile = builtinProfile
  private published: Profile = builtinProfile
  private hasPublished = false
  private source: ProfileSource = 'builtin'
  private ready = false
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): Profile => this.snapshot

  getSource = (): ProfileSource => this.source

  isReady = (): boolean => this.ready

  /** 已发布基线：清除本机修改后回到这里 */
  getPublished = (): Profile => this.published

  async init(): Promise<void> {
    const published = await fetchPublishedProfile()
    this.published = published ?? builtinProfile
    this.hasPublished = published !== null
    this.source = this.hasPublished ? 'static' : 'builtin'

    const local = readLocalRaw()
    if (local && typeof local === 'object') {
      this.snapshot = normalizeProfile(local, this.published)
      this.source = 'local'
    } else {
      this.snapshot = this.published
    }

    this.ready = true
    this.emit()
  }

  /** 保存管理后台的修改到浏览器本地 */
  save(profile: Profile): { profile: Profile; persisted: boolean } {
    const next = normalizeProfile({ ...profile, updatedAt: new Date().toISOString() }, this.published)
    const persisted = writeLocalRaw(next)
    if (persisted) {
      this.source = 'local'
    }
    this.snapshot = next
    this.emit()
    return { profile: next, persisted }
  }

  /** 预览：只更新内存，不写入 localStorage */
  preview(profile: Profile): void {
    this.snapshot = profile
    this.emit()
  }

  /** 丢弃本机修改，回到已发布的静态数据 */
  clearLocal(): Profile {
    try {
      localStorage.removeItem(PROFILE_KEY)
    } catch {
      /* 忽略隐私模式下的写入失败 */
    }
    this.snapshot = this.published
    this.source = this.hasPublished ? 'static' : 'builtin'
    this.emit()
    return this.snapshot
  }

  /** 从导入的 JSON 覆盖数据（是否落盘交给调用方决定） */
  adopt(raw: unknown): Profile {
    const next = normalizeProfile(raw, this.published)
    this.snapshot = next
    this.emit()
    return next
  }

  draft(): Profile {
    return cloneProfile(this.snapshot)
  }

  private emit() {
    for (const listener of this.listeners) listener()
  }
}

export const profileStore = new ProfileStore()
