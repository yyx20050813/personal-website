import { useEffect, useState } from 'react'

/**
 * 极简 hash 路由。
 * 约定：形如 #/xxx 的是路由；形如 #projects 的是站内锚点，始终属于首页。
 */
function parseRoute(): string {
  const raw = window.location.hash.replace(/^#/, '')
  return raw.startsWith('/') ? raw : '/'
}

export function useRoute(): string {
  const [route, setRoute] = useState(parseRoute)
  useEffect(() => {
    const onChange = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(path: string): void {
  window.location.hash = path
}
