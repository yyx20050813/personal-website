import { useEffect } from 'react'
import { AdminApp } from './admin/AdminApp'
import { useRoute } from './lib/router'
import { SiteApp } from './site/SiteApp'

export function App() {
  const route = useRoute()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  if (route === '/admin') return <AdminApp />
  return <SiteApp />
}
