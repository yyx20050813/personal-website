import type { BasicInfo, ProfileMeta } from '../../types'
import { Panel, TextAreaField, TextField } from '../fields'
import type { PanelProps } from '../panelTypes'

export function BasicPanel({ profile, update }: PanelProps) {
  const basic = profile.basic
  const set = (patch: Partial<BasicInfo>) =>
    update((current) => ({ ...current, basic: { ...current.basic, ...patch } }))

  return (
    <>
      <Panel
        title="身份信息"
        desc="这些内容会出现在首屏大标题、个人信息卡片以及页脚。带 * 的建议填写完整。"
      >
        <div className="grid-2">
          <TextField label="姓名" required value={basic.name} onChange={(v) => set({ name: v })} />
          <TextField
            label="一句话身份标签"
            required
            value={basic.headline}
            placeholder="例如：计算机科学与技术专业本科生 · 软硬件全流程实践者"
            onChange={(v) => set({ headline: v })}
          />
          <TextField
            label="就读院校"
            value={basic.school}
            onChange={(v) => set({ school: v })}
          />
          <TextField label="专业" value={basic.major} onChange={(v) => set({ major: v })} />
          <TextField
            label="学历"
            value={basic.degree}
            placeholder="本科"
            onChange={(v) => set({ degree: v })}
          />
          <TextField
            label="年级"
            value={basic.grade}
            placeholder="2023 级 · 2027 届"
            onChange={(v) => set({ grade: v })}
          />
          <TextField
            label="出生年月"
            value={basic.birth}
            placeholder="2005 年 8 月"
            onChange={(v) => set({ birth: v })}
          />
          <TextField label="性别" value={basic.gender} onChange={(v) => set({ gender: v })} />
          <TextField
            label="政治面貌"
            value={basic.political}
            placeholder="中共预备党员"
            onChange={(v) => set({ political: v })}
          />
          <TextField
            label="籍贯"
            value={basic.hometown}
            placeholder="江西省宜春市"
            onChange={(v) => set({ hometown: v })}
          />
        </div>

        <div className="grid-2" style={{ marginTop: 14 }}>
          <TextField
            label="邮箱"
            type="email"
            value={basic.email}
            onChange={(v) => set({ email: v })}
            hint="首屏与联系方式区会以此生成 mailto 链接"
          />
          <TextField
            label="手机号"
            value={basic.phone}
            onChange={(v) => set({ phone: v })}
            hint="会生成 tel 链接，移动端点击可直接拨号"
          />
        </div>

        <div className="grid-1" style={{ marginTop: 14 }}>
          <TextField
            label="求职意向"
            value={basic.jobTarget}
            placeholder="软件开发 / 嵌入式与鸿蒙应用 / AI 应用开发"
            onChange={(v) => set({ jobTarget: v })}
          />
          <TextAreaField
            label="个人简介"
            rows={5}
            value={basic.summary}
            onChange={(v) => set({ summary: v })}
            hint="首屏显示在大标题下方的介绍段落，建议 80-150 字"
          />
        </div>
      </Panel>
    </>
  )
}

export function MetaPanel({ profile, update }: PanelProps) {
  const meta = profile.meta
  const set = (patch: Partial<ProfileMeta>) =>
    update((current) => ({ ...current, meta: { ...current.meta, ...patch } }))

  return (
    <Panel title="网站设置" desc="浏览器标签页标题、导航栏左侧的名字与页脚文案。">
      <div className="grid-1">
        <TextField
          label="浏览器标题"
          value={meta.siteTitle}
          placeholder="晏雅馨 · 个人主页"
          onChange={(v) => set({ siteTitle: v })}
        />
        <TextField
          label="导航栏名字"
          value={meta.navBrand}
          placeholder="留空则使用姓名"
          onChange={(v) => set({ navBrand: v })}
        />
        <TextField
          label="副标题标签"
          value={meta.tagline}
          placeholder="计算机科学与技术 · 2027 届本科在读"
          onChange={(v) => set({ tagline: v })}
        />
        <TextAreaField
          label="页脚文案"
          rows={2}
          value={meta.footer}
          placeholder="© 2026 晏雅馨 · 纯前端个人展示网站"
          onChange={(v) => set({ footer: v })}
        />
      </div>
    </Panel>
  )
}
