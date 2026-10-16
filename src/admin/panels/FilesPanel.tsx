import { useRef, useState } from 'react'
import { pushToast, useFiles } from '../../lib/hooks'
import { removeLocalFile, saveLocalFile } from '../../lib/fileStore'
import { formatBytes } from '../../lib/utils'
import { DEFAULT_AVATAR, useAvatar } from '../../site/useAssets'
import { IconDownload, IconFile, IconInfo, IconTrash, IconUpload, IconWarning } from '../../site/icons'
import { Panel } from '../fields'
import type { PanelProps } from '../panelTypes'

const IMAGE_MAX = 5 * 1024 * 1024
const RESUME_MAX = 20 * 1024 * 1024

export function FilesPanel({ profile, update }: PanelProps) {
  const files = useFiles()
  const avatar = useAvatar(profile)
  const avatarInput = useRef<HTMLInputElement>(null)
  const resumeInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState<'avatar' | 'resume' | null>(null)
  const [busy, setBusy] = useState(false)

  const pickAvatar = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      pushToast('头像需要是图片文件（jpg / png / webp / svg）', 'error')
      return
    }
    if (file.size > IMAGE_MAX) {
      pushToast(`头像请控制在 ${formatBytes(IMAGE_MAX)} 以内，当前 ${formatBytes(file.size)}`, 'error')
      return
    }
    setBusy(true)
    try {
      await saveLocalFile('avatar', file)
      pushToast('头像已更新（已保存在本机浏览器）')
    } catch {
      pushToast('头像保存失败，请重试', 'error')
    } finally {
      setBusy(false)
    }
  }

  const pickResume = async (file: File | undefined) => {
    if (!file) return
    if (file.size > RESUME_MAX) {
      pushToast(`简历请控制在 ${formatBytes(RESUME_MAX)} 以内，当前 ${formatBytes(file.size)}`, 'error')
      return
    }
    setBusy(true)
    try {
      await saveLocalFile('resume', file)
      pushToast('简历已更新（已保存在本机浏览器）')
    } catch {
      pushToast('简历保存失败，请重试', 'error')
    } finally {
      setBusy(false)
    }
  }

  const describeAvatar = () => {
    if (files.avatar) return `本机上传：${files.avatar.name}（${formatBytes(files.avatar.size)}）`
    if (profile.basic.avatarDataUrl) return '数据内嵌头像（随 profile.json 一起发布）'
    return '内置默认头像（灰色人像占位图）'
  }

  const describeResume = () => {
    if (files.resume) return `本机上传：${files.resume.name}（${formatBytes(files.resume.size)}）`
    if (profile.resume?.url) {
      return `${profile.resume.fileName}（${formatBytes(profile.resume.size)}，来自数据内的静态文件路径）`
    }
    return '尚未上传简历'
  }

  return (
    <>
      <Panel
        title="头像"
        desc="上传后立即生效，原始文件保存在本机浏览器的 IndexedDB 中；导出数据时会自动转成 base64 写进 profile.json。"
      >
        <div className="file-preview">
          <img className="file-preview__thumb" src={avatar.url} alt="头像预览" />
          <div className="file-preview__meta">
            <p className="file-preview__name">当前生效：{describeAvatar()}</p>
            <p className="file-preview__sub">
              建议使用正方形图片（1:1），尺寸 512×512 以上，页面会以圆形裁剪展示。
            </p>
            <div className="file-preview__actions">
              <button
                type="button"
                className="btn btn--sm btn--primary"
                disabled={busy}
                onClick={() => avatarInput.current?.click()}
              >
                <IconUpload size={14} />
                上传 / 替换头像
              </button>
              {files.avatar ? (
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={async () => {
                    await removeLocalFile('avatar')
                    pushToast('已移除本机头像', 'warn')
                  }}
                >
                  <IconTrash size={14} />
                  移除本机头像
                </button>
              ) : null}
              {profile.basic.avatarDataUrl ? (
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => {
                    update((current) => ({
                      ...current,
                      basic: { ...current.basic, avatarDataUrl: '' },
                    }))
                    pushToast('已清除数据内嵌头像，记得点保存', 'warn')
                  }}
                >
                  <IconTrash size={14} />
                  清除内嵌头像
                </button>
              ) : null}
              {avatar.url !== DEFAULT_AVATAR ? (
                <a className="btn btn--sm" href={avatar.url} download="avatar">
                  <IconDownload size={14} />
                  下载当前头像
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <input
          ref={avatarInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            void pickAvatar(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        <div
          className={`upload${dragging === 'avatar' ? ' is-dragging' : ''}`}
          style={{ marginTop: 14 }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging('avatar')
          }}
          onDragLeave={() => setDragging(null)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(null)
            void pickAvatar(event.dataTransfer.files?.[0])
          }}
        >
          <span className="upload__icon">
            <IconUpload size={20} />
          </span>
          <p className="upload__title">把头像图片拖到这里</p>
          <p className="upload__hint">
            支持 jpg / png / webp / svg，单张不超过 {formatBytes(IMAGE_MAX)}
          </p>
        </div>
      </Panel>

      <Panel
        title="简历文件"
        desc="上传 PDF 或 Word 文件后，页面上的“下载简历”按钮会指向它。文件同样保存在本机 IndexedDB。"
      >
        <div className="file-preview">
          <span className="file-preview__icon">
            <IconFile size={22} />
          </span>
          <div className="file-preview__meta">
            <p className="file-preview__name">{describeResume()}</p>
            <p className="file-preview__sub">
              {profile.resume
                ? '上方显示的是当前实际生效的文件。上传新文件会立即替换。'
                : '还没有简历文件，访客点击下载按钮时会看到提示。'}
            </p>
            <div className="file-preview__actions">
              <button
                type="button"
                className="btn btn--sm btn--primary"
                disabled={busy}
                onClick={() => resumeInput.current?.click()}
              >
                <IconUpload size={14} />
                上传 / 替换简历
              </button>
              {files.resume ? (
                <>
                  <a className="btn btn--sm" href={files.resume.url} target="_blank" rel="noreferrer">
                    <IconFile size={14} />
                    预览
                  </a>
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={async () => {
                      await removeLocalFile('resume')
                      pushToast('已移除本机简历文件', 'warn')
                    }}
                  >
                    <IconTrash size={14} />
                    移除本机文件
                  </button>
                </>
              ) : null}
              {profile.resume && !files.resume ? (
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => {
                    update((current) => ({ ...current, resume: null }))
                    pushToast('已清除数据内的简历引用，记得点保存', 'warn')
                  }}
                >
                  <IconTrash size={14} />
                  清除简历引用
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <input
          ref={resumeInput}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          hidden
          onChange={(event) => {
            void pickResume(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        <div
          className={`upload${dragging === 'resume' ? ' is-dragging' : ''}`}
          style={{ marginTop: 14 }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging('resume')
          }}
          onDragLeave={() => setDragging(null)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(null)
            void pickResume(event.dataTransfer.files?.[0])
          }}
        >
          <span className="upload__icon">
            <IconFile size={20} />
          </span>
          <p className="upload__title">把简历文件拖到这里</p>
          <p className="upload__hint">支持 pdf / doc / docx，单个文件不超过 {formatBytes(RESUME_MAX)}</p>
        </div>

        <div className="note" style={{ marginTop: 16 }}>
          <IconInfo size={16} />
          <span>
            文件存在浏览器本地，<strong>不会上传到任何服务器</strong>。换一台电脑或换浏览器访问时，
            需要在「数据管理」里导出 JSON（含头像与简历）再导入，或者把导出的
            <code>profile.json</code> 放进 <code>public/data/</code> 后重新构建发布。
          </span>
        </div>
      </Panel>

      {!files.ready ? (
        <div className="note note--warn">
          <IconWarning size={16} />
          <span>本机文件仓库尚未就绪，若刚上传失败请刷新页面重试。</span>
        </div>
      ) : null}
    </>
  )
}
