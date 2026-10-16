/**
 * 全站数据模型。
 * 所有内容都来自一个 Profile 对象：既可打包进前端（静态默认数据），
 * 也可由管理后台改写后保存到浏览器本地存储 / 导出为 profile.json 静态文件。
 */

export interface BasicInfo {
  name: string
  /** 一句话身份标签，显示在姓名下方 */
  headline: string
  /** 头像（base64 data URL）。为空时使用内置默认头像 */
  avatarDataUrl: string
  gender: string
  birth: string
  school: string
  major: string
  degree: string
  grade: string
  email: string
  phone: string
  political: string
  hometown: string
  jobTarget: string
  /** 个人简介段落 */
  summary: string
}

export interface Education {
  id: string
  school: string
  major: string
  degree: string
  start: string
  end: string
  gpa: string
  rank: string
  english: string
  courses: string[]
  honors: string[]
}

export interface SkillItem {
  id: string
  name: string
  /** 掌握程度 0-100，用于进度条展示 */
  level: number
  note: string
}

export interface SkillGroup {
  id: string
  category: string
  /** code | chip | palette | globe | tool */
  icon: string
  items: SkillItem[]
}

export interface ProjectHighlight {
  id: string
  title: string
  detail: string
}

export interface Project {
  id: string
  name: string
  /** 副标题，例如“计算机组成原理课程实践” */
  subtitle: string
  period: string
  tech: string[]
  link: string
  highlights: ProjectHighlight[]
}

export interface Award {
  id: string
  year: string
  name: string
  track: string
  /** 国家级 / 省级 / 校级 / 其他 */
  level: string
  /** 一等奖 / 二等奖 / 三等奖 / 其他 */
  rank: string
  description: string
}

export interface CampusExperience {
  id: string
  org: string
  role: string
  start: string
  end: string
  points: string[]
}

export interface Advantage {
  id: string
  title: string
  detail: string
}

export interface Contact {
  id: string
  /** email | phone | school | github | link | other */
  type: string
  label: string
  value: string
  href: string
}

/** 简历文件。url 可以是 base64 data URL，也可以是 ./assets/resume.pdf 这类静态文件路径 */
export interface ResumeFile {
  fileName: string
  mimeType: string
  url: string
  size: number
}

export interface ProfileMeta {
  siteTitle: string
  navBrand: string
  tagline: string
  footer: string
}

export interface Profile {
  version: number
  updatedAt: string
  meta: ProfileMeta
  basic: BasicInfo
  education: Education[]
  skills: SkillGroup[]
  projects: Project[]
  awards: Award[]
  campus: CampusExperience[]
  advantages: Advantage[]
  contacts: Contact[]
  resume: ResumeFile | null
}

/** 静态数据来源：优先级 本地修改 > 已发布的 profile.json > 打包内置数据 */
export type ProfileSource = 'local' | 'static' | 'builtin'

/** 可上传的文件：头像图片与简历文件 */
export type FileKey = 'avatar' | 'resume'

