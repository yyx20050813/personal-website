import { useFiles } from '../lib/hooks'
import type { Profile } from '../types'

const DEFAULT_AVATAR = `${import.meta.env.BASE_URL}assets/avatar-default.svg`

export interface ResolvedAvatar {
  url: string
  /** true 表示来自本机上传（IndexedDB），false 表示来自数据里的 base64 或内置默认头像 */
  isLocal: boolean
}

export interface ResolvedResume {
  url: string
  fileName: string
  size: number
  isLocal: boolean
}

/** 头像优先级：本机上传 → 数据内嵌 base64 → 内置默认头像 */
export function useAvatar(profile: Profile): ResolvedAvatar {
  const files = useFiles()
  if (files.avatar?.url) return { url: files.avatar.url, isLocal: true }
  if (profile.basic.avatarDataUrl) return { url: profile.basic.avatarDataUrl, isLocal: false }
  return { url: DEFAULT_AVATAR, isLocal: false }
}

/** 简历优先级：本机上传 → 数据内嵌（base64 或静态文件路径） */
export function useResume(profile: Profile): ResolvedResume | null {
  const files = useFiles()
  if (files.resume) {
    return {
      url: files.resume.url,
      fileName: files.resume.name,
      size: files.resume.size,
      isLocal: true,
    }
  }
  if (profile.resume?.url) {
    return {
      url: profile.resume.url,
      fileName: profile.resume.fileName || 'resume.pdf',
      size: profile.resume.size || 0,
      isLocal: false,
    }
  }
  return null
}

export { DEFAULT_AVATAR }
