import { getRecord } from './fileStore'
import { normalizeProfile } from './normalize'
import type { Profile } from '../types'
import { blobToDataUrl, download } from './utils'

/**
 * 导出 / 导入。
 * 导出时会把本机上传的头像与简历转成 base64 一起写进 JSON，
 * 因此导出的 profile.json 是自包含的：直接放到 public/data/ 即可发布。
 */

export interface ExportResult {
  profile: Profile
  json: string
  size: number
  embeddedAvatar: boolean
  embeddedResume: boolean
}

export async function buildExport(profile: Profile): Promise<ExportResult> {
  const next = normalizeProfile(profile)
  let embeddedAvatar = false
  let embeddedResume = false

  const avatar = getRecord('avatar')
  if (avatar) {
    next.basic.avatarDataUrl = await blobToDataUrl(avatar.blob)
    embeddedAvatar = true
  }

  const resume = getRecord('resume')
  if (resume) {
    next.resume = {
      fileName: resume.name,
      mimeType: resume.type || 'application/pdf',
      url: await blobToDataUrl(resume.blob),
      size: resume.size,
    }
    embeddedResume = true
  }

  next.updatedAt = new Date().toISOString()
  const json = `${JSON.stringify(next, null, 2)}\n`
  return {
    profile: next,
    json,
    size: new Blob([json]).size,
    embeddedAvatar,
    embeddedResume,
  }
}

export async function exportProfileFile(
  profile: Profile,
  filename = 'profile.json',
): Promise<ExportResult> {
  const result = await buildExport(profile)
  download(filename, result.json)
  return result
}

export function parseImported(text: string): Profile {
  return normalizeProfile(JSON.parse(text))
}

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
