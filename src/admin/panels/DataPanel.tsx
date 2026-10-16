import { useRef } from 'react'
import { pushToast, useFiles, useProfileSource } from '../../lib/hooks'
import { builtinProfile } from '../../lib/normalize'
import { buildExport, exportProfileFile, parseImported, readFileText } from '../../lib/publish'
import { formatBytes, formatDate } from '../../lib/utils'
import { IconDownload, IconInfo, IconRefresh, IconUpload, IconWarning } from '../../site/icons'
import { Panel } from '../fields'
import type { PanelProps } from '../panelTypes'
import type { Profile } from '../../types'

export interface DataPanelProps extends PanelProps {
  /** 丢弃本机修改，回到已发布的静态数据 */
  onReloadPublished: () => void
  /** 载入内置示例数据（写入草稿，需保存后生效） */
  onLoadBuiltin: () => void
  /** 用外部导入的数据替换草稿 */
  onImport: (profile: Profile) => void
}

const SOURCE_LABEL: Record<string, string> = {
  local: '本机修改（localStorage）',
  static: '已发布静态数据 profile.json',
  builtin: '打包内置数据',
}

export function DataPanel({
  profile,
  onReloadPublished,
  onLoadBuiltin,
  onImport,
}: DataPanelProps) {
  const source = useProfileSource()
  const files = useFiles()
  const importInput = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      const result = await exportProfileFile(profile)
      pushToast(
        `已导出 profile.json（${formatBytes(result.size)}${
          result.embeddedAvatar || result.embeddedResume ? '，含头像/简历' : ''
        }）`,
      )
    } catch {
      pushToast('导出失败，请重试', 'error')
    }
  }

  const handlePreviewSize = async () => {
    try {
      const result = await buildExport(profile)
      pushToast(`导出后文件大小约 ${formatBytes(result.size)}`)
    } catch {
      pushToast('统计失败', 'error')
    }
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await readFileText(file)
      const imported = parseImported(text)
      onImport(imported)
      pushToast('已读取 JSON 到编辑区，确认无误后点击右上角「保存」')
    } catch {
      pushToast('导入失败：不是合法的 profile.json', 'error')
    }
  }

  return (
    <>
      <Panel title="数据概况" desc="当前页面读取到的数据来源与统计信息。">
        <div className="stat-row">
          <div className="stat-box">
            <p className="stat-box__label">数据来源</p>
            <p className="stat-box__value">{SOURCE_LABEL[source] ?? source}</p>
          </div>
          <div className="stat-box">
            <p className="stat-box__label">最近更新</p>
            <p className="stat-box__value">{formatDate(profile.updatedAt) || '未记录'}</p>
          </div>
          <div className="stat-box">
            <p className="stat-box__label">内容条目</p>
            <p className="stat-box__value">
              {profile.projects.length} 项目 / {profile.awards.length} 获奖
            </p>
          </div>
          <div className="stat-box">
            <p className="stat-box__label">本机文件</p>
            <p className="stat-box__value">
              {files.avatar ? '头像 ✓' : '头像 —'} · {files.resume ? '简历 ✓' : '简历 —'}
            </p>
          </div>
        </div>
      </Panel>

      <Panel
        title="导出数据"
        desc="导出的 profile.json 是自包含的：本机上传的头像与简历会被转成 base64 一并写入，换设备导入即可完整还原。"
      >
        <div className="button-row">
          <button type="button" className="btn btn--primary btn--sm" onClick={() => void handleExport()}>
            <IconDownload size={14} />
            导出 profile.json
          </button>
          <button type="button" className="btn btn--sm" onClick={() => void handlePreviewSize()}>
            预估文件大小
          </button>
        </div>
        <div className="note" style={{ marginTop: 14 }}>
          <IconInfo size={16} />
          <span>
            想让所有访客都看到修改，把导出的文件覆盖到
            <code>public/data/profile.json</code>，然后执行 <code>npm run build</code> 重新发布即可。
            站点加载时会先读取这个静态文件。
          </span>
        </div>
      </Panel>

      <Panel
        title="导入数据"
        desc="用之前导出的 profile.json 覆盖当前编辑内容。导入只写入编辑区，确认后点右上角「保存」。"
      >
        <div className="button-row">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => importInput.current?.click()}
          >
            <IconUpload size={14} />
            选择 JSON 文件
          </button>
        </div>
        <input
          ref={importInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            void handleImport(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </Panel>

      <Panel
        title="重置"
        desc="两个重置动作的影响范围不同，请留意说明。"
      >
        <div className="button-row">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              if (!window.confirm('放弃本机所有修改，恢复到已发布的静态数据？')) return
              onReloadPublished()
              pushToast('已恢复为已发布的静态数据', 'warn')
            }}
          >
            <IconRefresh size={14} />
            丢弃本机修改
          </button>
          <button
            type="button"
            className="btn btn--sm btn--danger"
            onClick={() => {
              if (!window.confirm('载入内置示例数据（需要再点保存才生效）？')) return
              onLoadBuiltin()
              pushToast('已载入内置示例数据，点击「保存」后生效', 'warn')
            }}
          >
            <IconRefresh size={14} />
            载入内置示例数据
          </button>
        </div>
        <div className="note note--warn" style={{ marginTop: 14 }}>
          <IconWarning size={16} />
          <span>
            「载入内置示例数据」只会把这一版默认内容填回编辑区，不会删除你导出的 JSON 文件，
            所以请先确认已有一份备份。
          </span>
        </div>
      </Panel>

      <Panel title="发布流程速查" desc="三种发布方式，按需要选择。">
        <div className="grid-1">
          <div className="note">
            <IconInfo size={16} />
            <span>
              <strong>本地开发预览：</strong>执行 <code>npm run dev</code>，在浏览器里打开
              <code>http://localhost:5173</code>，改完保存即刻可见。
            </span>
          </div>
          <div className="note">
            <IconInfo size={16} />
            <span>
              <strong>发布到 GitHub Pages / 静态服务器：</strong>在管理后台导出
              <code>profile.json</code> → 覆盖 <code>public/data/profile.json</code> →
              <code>npm run build</code> → 把 <code>dist/</code> 整个目录上传即可（构建使用相对路径，
              放在仓库子目录也能正常访问）。
            </span>
          </div>
          <div className="note">
            <IconInfo size={16} />
            <span>
              <strong>只在本机更新：</strong>点「保存」即可，数据写入浏览器
              localStorage，刷新不丢失，但不会影响其他访客。
            </span>
          </div>
        </div>
      </Panel>

      <Panel title="默认内容说明" desc="内置数据是本项目自带的示例简历内容。">
        <div className="button-row">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              if (!window.confirm('确定要用内置示例数据覆盖编辑区吗？（点保存后才生效）')) return
              onImport(builtinProfile)
              pushToast('已载入内置数据到编辑区')
            }}
          >
            载入内置数据到编辑区
          </button>
        </div>
      </Panel>
    </>
  )
}
