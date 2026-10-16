import { useToasts } from '../lib/hooks'

/** 全局轻提示，展示保存 / 上传 / 导入结果 */
export function Toaster() {
  const toasts = useToasts()
  if (toasts.length === 0) return null
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.tone}`} key={toast.id}>
          <span className="toast__dot" />
          {toast.text}
        </div>
      ))}
    </div>
  )
}
