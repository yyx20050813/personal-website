import type { Profile } from '../types'

/** 所有管理面板共用的入参 */
export interface PanelProps {
  profile: Profile
  /** 用不可变方式修改草稿，例如 update(p => ({ ...p, basic: { ...p.basic, name: 'x' } })) */
  update: (recipe: (profile: Profile) => Profile) => void
}
