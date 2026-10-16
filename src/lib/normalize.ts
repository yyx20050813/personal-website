import defaultJson from '../data/profile.default.json'
import type {
  Advantage,
  Award,
  BasicInfo,
  CampusExperience,
  Contact,
  Education,
  Profile,
  ProfileMeta,
  Project,
  ResumeFile,
  SkillGroup,
  SkillItem,
} from '../types'
import { clamp, uid } from './utils'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : typeof v === 'number' ? String(v) : fallback

const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

const strList = (v: unknown): string[] =>
  list(v)
    .map((item) => str(item).trim())
    .filter(Boolean)

const objects = (v: unknown): Record<string, unknown>[] => list(v).filter(isObject)

const itemId = (raw: Record<string, unknown>, prefix: string) => str(raw.id).trim() || uid(prefix)

/** 结构完整但内容为空的数据骨架，用作兜底，保证任何残缺 JSON 都不会让页面崩掉 */
export const emptyProfile: Profile = {
  version: 1,
  updatedAt: '',
  meta: { siteTitle: '个人主页', navBrand: '', tagline: '', footer: '' },
  basic: {
    name: '',
    headline: '',
    avatarDataUrl: '',
    gender: '',
    birth: '',
    school: '',
    major: '',
    degree: '',
    grade: '',
    email: '',
    phone: '',
    political: '',
    hometown: '',
    jobTarget: '',
    summary: '',
  },
  education: [],
  skills: [],
  projects: [],
  awards: [],
  campus: [],
  advantages: [],
  contacts: [],
  resume: null,
}

function normalizeBasic(raw: unknown, fallback: BasicInfo): BasicInfo {
  if (!isObject(raw)) return { ...fallback }
  const out = { ...fallback }
  for (const key of Object.keys(fallback) as (keyof BasicInfo)[]) {
    if (key in raw) out[key] = str(raw[key])
  }
  return out
}

function normalizeMeta(raw: unknown, fallback: ProfileMeta): ProfileMeta {
  if (!isObject(raw)) return { ...fallback }
  const out = { ...fallback }
  for (const key of Object.keys(fallback) as (keyof ProfileMeta)[]) {
    if (key in raw) out[key] = str(raw[key])
  }
  return out
}

function normalizeEducation(raw: Record<string, unknown>): Education {
  return {
    id: itemId(raw, 'edu'),
    school: str(raw.school),
    major: str(raw.major),
    degree: str(raw.degree),
    start: str(raw.start),
    end: str(raw.end),
    gpa: str(raw.gpa),
    rank: str(raw.rank),
    english: str(raw.english),
    courses: strList(raw.courses),
    honors: strList(raw.honors),
  }
}

function normalizeSkillItem(raw: Record<string, unknown>): SkillItem {
  return {
    id: itemId(raw, 'skill'),
    name: str(raw.name),
    level: clamp(Math.round(num(raw.level, 60)), 0, 100),
    note: str(raw.note),
  }
}

function normalizeSkillGroup(raw: Record<string, unknown>): SkillGroup {
  return {
    id: itemId(raw, 'group'),
    category: str(raw.category),
    icon: str(raw.icon, 'code'),
    items: objects(raw.items).map(normalizeSkillItem),
  }
}

function normalizeProject(raw: Record<string, unknown>): Project {
  return {
    id: itemId(raw, 'prj'),
    name: str(raw.name),
    subtitle: str(raw.subtitle),
    period: str(raw.period),
    tech: strList(raw.tech),
    link: str(raw.link),
    highlights: objects(raw.highlights).map((h) => ({
      id: itemId(h, 'hl'),
      title: str(h.title),
      detail: str(h.detail),
    })),
  }
}

function normalizeAward(raw: Record<string, unknown>): Award {
  return {
    id: itemId(raw, 'aw'),
    year: str(raw.year),
    name: str(raw.name),
    track: str(raw.track),
    level: str(raw.level, '其他'),
    rank: str(raw.rank),
    description: str(raw.description),
  }
}

function normalizeCampus(raw: Record<string, unknown>): CampusExperience {
  return {
    id: itemId(raw, 'cp'),
    org: str(raw.org),
    role: str(raw.role),
    start: str(raw.start),
    end: str(raw.end),
    points: strList(raw.points),
  }
}

function normalizeAdvantage(raw: Record<string, unknown>): Advantage {
  return {
    id: itemId(raw, 'ad'),
    title: str(raw.title),
    detail: str(raw.detail),
  }
}

function normalizeContact(raw: Record<string, unknown>): Contact {
  return {
    id: itemId(raw, 'ct'),
    type: str(raw.type, 'other'),
    label: str(raw.label),
    value: str(raw.value),
    href: str(raw.href),
  }
}

function normalizeResume(raw: unknown): ResumeFile | null {
  if (!isObject(raw)) return null
  const url = str(raw.url)
  if (!url) return null
  return {
    fileName: str(raw.fileName, 'resume.pdf'),
    mimeType: str(raw.mimeType, 'application/pdf'),
    url,
    size: num(raw.size, 0),
  }
}

/**
 * 把任意（可能残缺、可能来自旧版本）的数据整理成完整可用的 Profile。
 * fallback 用于：某一节整体缺失时回退到默认数据，而不是清空。
 */
export function normalizeProfile(raw: unknown, fallback: Profile = emptyProfile): Profile {
  if (!isObject(raw)) return fallback
  const pick = <K extends keyof Profile>(key: K, build: (value: unknown) => Profile[K]): Profile[K] =>
    key in raw ? build(raw[key]) : fallback[key]

  return {
    version: num(raw.version, 1),
    updatedAt: str(raw.updatedAt),
    meta: pick('meta', (v) => normalizeMeta(v, fallback.meta)),
    basic: pick('basic', (v) => normalizeBasic(v, fallback.basic)),
    education: pick('education', (v) => objects(v).map(normalizeEducation)),
    skills: pick('skills', (v) => objects(v).map(normalizeSkillGroup)),
    projects: pick('projects', (v) => objects(v).map(normalizeProject)),
    awards: pick('awards', (v) => objects(v).map(normalizeAward)),
    campus: pick('campus', (v) => objects(v).map(normalizeCampus)),
    advantages: pick('advantages', (v) => objects(v).map(normalizeAdvantage)),
    contacts: pick('contacts', (v) => objects(v).map(normalizeContact)),
    resume: 'resume' in raw ? normalizeResume(raw.resume) : fallback.resume,
  }
}

/** 打包进前端的静态默认数据（来自 src/data/profile.default.json） */
export const builtinProfile: Profile = normalizeProfile(defaultJson)

/** 深拷贝，避免管理后台的草稿编辑污染已保存的数据 */
export function cloneProfile(profile: Profile): Profile {
  return JSON.parse(JSON.stringify(profile)) as Profile
}
