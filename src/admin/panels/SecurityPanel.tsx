import { useState } from 'react'
import { getAuthTip, isPasswordSet, resetPassword, setPassword, DEFAULT_PASSWORD } from '../../lib/auth'
import { pushToast } from '../../lib/hooks'
import { IconInfo, IconLock, IconWarning } from '../../site/icons'
import { Panel, TextField } from '../fields'

export function SecurityPanel() {
  const [password, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [tip, setTip] = useState(() => getAuthTip())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [changed, setChanged] = useState(() => isPasswordSet())

  const submit = async () => {
    setError('')
    if (password.length < 6) {
      setError('口令至少 6 位')
      return
    }
    if (password !== confirm) {
      setError('两次输入的口令不一致')
      return
    }
    setBusy(true)
    const ok = await setPassword(password, tip || '自定义口令')
    setBusy(false)
    if (!ok) {
      setError('保存失败，浏览器可能禁用了本地存储')
      return
    }
    setNewPassword('')
    setConfirm('')
    setChanged(true)
    pushToast('后台口令已更新')
  }

  return (
    <>
      <Panel
        title="后台口令"
        desc="口令经过哈希后保存在本机浏览器，不写进代码仓库，也不会随导出的 JSON 外泄。"
      >
        <div className="grid-2">
          <TextField
            label="新口令"
            type="password"
            value={password}
            placeholder="至少 6 位"
            onChange={setNewPassword}
          />
          <TextField
            label="确认新口令"
            type="password"
            value={confirm}
            placeholder="再输入一次"
            onChange={setConfirm}
          />
        </div>
        <div className="grid-1" style={{ marginTop: 14 }}>
          <TextField
            label="口令提示"
            value={tip}
            placeholder="例如：常用密码后四位"
            onChange={setTip}
            hint="仅作备忘提示，会明文显示在本机浏览器中"
          />
        </div>

        {error ? <p className="login__error" style={{ marginTop: 10 }}>{error}</p> : null}

        <div className="button-row" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn--sm btn--primary"
            disabled={busy}
            onClick={() => void submit()}
          >
            <IconLock size={14} />
            保存新口令
          </button>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              if (!window.confirm(`将后台口令重置为默认的 ${DEFAULT_PASSWORD}？`)) return
              resetPassword()
              setChanged(false)
              setTip(getAuthTip())
              pushToast(`已重置为默认口令 ${DEFAULT_PASSWORD}`, 'warn')
            }}
          >
            重置为默认口令
          </button>
        </div>

        <div className="note" style={{ marginTop: 16 }}>
          <IconInfo size={16} />
          <span>
            当前状态：{changed ? '已设置自定义口令' : `使用默认口令 ${DEFAULT_PASSWORD}`}。
            修改口令后请牢记，忘记时可在登录页点击「忘记口令」重置。
          </span>
        </div>
      </Panel>

      <Panel title="安全边界说明" desc="这是一个纯前端项目，请务必了解它的能力边界。">
        <div className="note note--warn">
          <IconWarning size={16} />
          <span>
            纯前端站点没有服务端校验：任何访客都可以通过浏览器开发者工具查看本地存储与源码。
            因此后台口令只用于防止误操作，<strong>请不要把身份证号、家庭住址、未公开的联系方式等敏感信息放进站点</strong>，
            简历文件也只放你愿意公开的版本。
          </span>
        </div>
      </Panel>
    </>
  )
}
