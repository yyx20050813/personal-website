import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initFiles } from './lib/fileStore'
import { profileStore } from './lib/profileStore'
import './styles/base.css'
import './styles/site.css'
import './styles/admin.css'

async function bootstrap() {
  const host = document.getElementById('root')
  if (!host) throw new Error('找不到 #root 挂载点')

  const root = createRoot(host)
  root.render(
    <div className="boot">
      <span className="boot__spinner" />
      <p>正在读取本地数据…</p>
    </div>,
  )

  // 先读取已发布的静态数据 + 本机文件，再渲染，避免页面内容闪烁
  await Promise.all([profileStore.init(), initFiles()])

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
