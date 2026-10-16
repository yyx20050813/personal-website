import { useState, type FormEvent } from 'react'
import {
  DEFAULT_PASSWORD,
  isPasswordSet,
  markSession,
  resetPassword,
  verifyPassword,
} from '../lib/auth'
import { pushToast } from '../lib/hooks'
import { IconLock } from '../site/icons'
import { Toaster } from '../components/Toaster'

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [firstUse, setFirstUse] = useState(() => !isPasswordSet())

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    const ok = await verifyPassword(password)
    setBusy(false)
    if (!ok) {
      setError('口令不正确，请重新输入')
      return
    }
    markSession()
    onSuccess()
  }

  return (
    <div className="login">
      <div className="login__card">
        <span className="login__badge">
          <IconLock size={21} />
        </span>
        <h1 className="login__title">管理后台</h1>
        <p className="login__desc">
          在这里修改个人信息、技能、项目经历，并上传头像与简历。数据只保存在你自己的浏览器里。
        </p>

        <form className="login__form" onSubmit={submit}>
          <input
            className="input"
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder={firstUse ? `默认口令：${DEFAULT_PASSWORD}` : '请输入后台口令'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="login__error">{error}</p> : null}
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? '校验中…' : '进入后台'}
          </button>
        </form>

        {firstUse ? (
          <div className="note" style={{ marginTop: 18 }}>
            <IconLock size={16} />
            <span>
              首次使用默认口令 <code>{DEFAULT_PASSWORD}</code>，进入后台后可在「后台设置」里修改。
            </span>
          </div>
        ) : null}

        <div className="login__foot">
          <a href="#/">← 返回网站首页</a>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`确定把口令重置为默认的 ${DEFAULT_PASSWORD} 吗？`)) return
              resetPassword()
              setFirstUse(true)
              setError('')
              pushToast(`口令已重置为 ${DEFAULT_PASSWORD}`, 'warn')
            }}
          >
            忘记口令
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
