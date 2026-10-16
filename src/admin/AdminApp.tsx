import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Toaster } from '../components/Toaster'
import { clearSession, hasSession } from '../lib/auth'
import { pushToast, useProfile } from '../lib/hooks'
import { cloneProfile, builtinProfile } from '../lib/normalize'
import { profileStore } from '../lib/profileStore'
import type { Profile } from '../types'
import {
  IconAward,
  IconBriefcase,
  IconChip,
  IconEdit,
  IconFile,
  IconLayers,
  IconLock,
  IconMail,
  IconRefresh,
  IconSchool,
  IconStar,
  IconUser,
} from '../site/icons'
import { Login } from './Login'
import type { PanelProps } from './panelTypes'
import { BasicPanel, MetaPanel } from './panels/BasicPanel'
import { DataPanel } from './panels/DataPanel'
import { FilesPanel } from './panels/FilesPanel'
import {
  AdvantagesPanel,
  AwardsPanel,
  CampusPanel,
  ContactsPanel,
  EducationPanel,
  ProjectsPanel,
  SkillsPanel,
} from './panels/ListsPanels'
import { SecurityPanel } from './panels/SecurityPanel'

interface TabDef {
  id: string
  label: string
  title: string
  desc: string
  icon: (props: { size?: number }) => ReactNode
  render: (props: PanelProps) => ReactNode
}

export function AdminApp() {
  const [authed, setAuthed] = useState(() => hasSession())
  const saved = useProfile()

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return <AdminShell saved={saved} onLogout={() => {
    clearSession()
    setAuthed(false)
  }} />
}

function AdminShell({ saved, onLogout }: { saved: Profile; onLogout: () => void }) {
  const [draft, setDraft] = useState<Profile>(() => cloneProfile(saved))
  const [dirty, setDirty] = useState(false)
  const [tabId, setTabId] = useState('basic')

  const update = useCallback((recipe: (profile: Profile) => Profile) => {
    setDraft((prev) => recipe(prev))
    setDirty(true)
  }, [])

  const replaceDraft = useCallback((profile: Profile, markDirty: boolean) => {
    setDraft(cloneProfile(profile))
    setDirty(markDirty)
  }, [])

  const save = useCallback(() => {
    const result = profileStore.save(draft)
    setDraft(result.profile)
    setDirty(false)
    pushToast(
      result.persisted
        ? '已保存到本机浏览器，刷新页面不会丢失'
        : '浏览器拒绝了本地存储写入（可能是隐私模式），修改不会被保存',
      result.persisted ? 'ok' : 'error',
    )
  }, [draft])

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  const tabs: TabDef[] = [
    {
      id: 'basic',
      label: '基本信息',
      title: '基本信息',
      desc: '姓名、院校、联系方式与个人简介，决定首屏第一印象。',
      icon: IconUser,
      render: (props) => <BasicPanel {...props} />,
    },
    {
      id: 'education',
      label: '教育背景',
      title: '教育背景',
      desc: '学校、成绩排名、主修课程与荣誉。',
      icon: IconSchool,
      render: (props) => <EducationPanel {...props} />,
    },
    {
      id: 'skills',
      label: '技能展示',
      title: '技能展示',
      desc: '分组维护技能项与掌握程度进度条。',
      icon: IconChip,
      render: (props) => <SkillsPanel {...props} />,
    },
    {
      id: 'projects',
      label: '项目经历',
      title: '项目经历',
      desc: '项目名称、技术标签与工作要点。',
      icon: IconLayers,
      render: (props) => <ProjectsPanel {...props} />,
    },
    {
      id: 'awards',
      label: '竞赛经历',
      title: '竞赛经历',
      desc: '竞赛名称、级别、奖项与承担的工作。',
      icon: IconAward,
      render: (props) => <AwardsPanel {...props} />,
    },
    {
      id: 'campus',
      label: '校园经历',
      title: '校园经历',
      desc: '学生工作与职务，时间轴方式展示。',
      icon: IconBriefcase,
      render: (props) => <CampusPanel {...props} />,
    },
    {
      id: 'advantages',
      label: '个人优势',
      title: '个人优势',
      desc: '"关于我"区块右侧的亮点卡片。',
      icon: IconStar,
      render: (props) => <AdvantagesPanel {...props} />,
    },
    {
      id: 'contacts',
      label: '联系方式',
      title: '联系方式',
      desc: '邮箱、电话、GitHub 等联系入口。',
      icon: IconMail,
      render: (props) => <ContactsPanel {...props} />,
    },
    {
      id: 'files',
      label: '头像与简历',
      title: '头像与简历',
      desc: '上传头像图片与简历文件，即传即用。',
      icon: IconFile,
      render: (props) => <FilesPanel {...props} />,
    },
    {
      id: 'meta',
      label: '网站设置',
      title: '网站设置',
      desc: '浏览器标题、导航名字与页脚文案。',
      icon: IconEdit,
      render: (props) => <MetaPanel {...props} />,
    },
    {
      id: 'data',
      label: '数据管理',
      title: '数据管理',
      desc: '导出、导入、重置与发布指引。',
      icon: IconRefresh,
      render: (props) => (
        <DataPanel
          {...props}
          onReloadPublished={() => replaceDraft(profileStore.clearLocal(), false)}
          onLoadBuiltin={() => replaceDraft(builtinProfile, true)}
          onImport={(profile) => replaceDraft(profile, true)}
        />
      ),
    },
    {
      id: 'security',
      label: '后台设置',
      title: '后台设置',
      desc: '修改后台口令与查看安全边界说明。',
      icon: IconLock,
      render: () => <SecurityPanel />,
    },
  ]

  const active = tabs.find((tab) => tab.id === tabId) ?? tabs[0]
  const panelProps: PanelProps = { profile: draft, update }

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <span className="nav__mark">{draft.basic.name.slice(0, 1) || 'A'}</span>
          <div>
            <strong>管理后台</strong>
            <span>本地数据 · 即改即存</span>
          </div>
        </div>

        <nav className="admin__tabs" aria-label="后台功能">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                type="button"
                key={tab.id}
                className={`admin__tab${tab.id === active.id ? ' is-active' : ''}`}
                onClick={() => setTabId(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="admin__side-foot">
          <a href="#/">
            <IconEdit size={15} />
            查看网站效果
          </a>
          <button type="button" onClick={onLogout}>
            <IconLock size={15} />
            退出登录
          </button>
        </div>
      </aside>

      <main className="admin__main">
        <header className="admin__topbar">
          <div>
            <h1 className="admin__title">{active.title}</h1>
            <p className="admin__subtitle">{active.desc}</p>
          </div>
          <div className="admin__topbar-actions">
            {dirty ? <span className="admin__dirty">● 有未保存修改</span> : null}
            <button
              type="button"
              className="btn btn--sm"
              disabled={!dirty}
              onClick={() => {
                replaceDraft(saved, false)
                pushToast('已放弃未保存的修改', 'warn')
              }}
            >
              放弃修改
            </button>
            <button type="button" className="btn btn--sm btn--primary" disabled={!dirty} onClick={save}>
              保存
            </button>
          </div>
        </header>

        <div className="admin__body">{active.render(panelProps)}</div>
      </main>

      <Toaster />
    </div>
  )
}
