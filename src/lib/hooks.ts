import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getFileState, subscribeFiles } from './fileStore'
import { profileStore, THEME_KEY } from './profileStore'
import type { Profile, ProfileSource } from '../types'

/** 订阅全站数据 */
export function useProfile(): Profile {
  return useSyncExternalStore(profileStore.subscribe, profileStore.getSnapshot, profileStore.getSnapshot)
}

export function useProfileSource(): ProfileSource {
  return useSyncExternalStore(profileStore.subscribe, profileStore.getSource, profileStore.getSource)
}

/** 订阅本机已上传的头像 / 简历 */
export function useFiles() {
  return useSyncExternalStore(subscribeFiles, getFileState, getFileState)
}

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const current = document.documentElement.getAttribute('data-theme')
    return current === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* 忽略 */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggle }
}

/**
 * 滚动进场动画：给所有 .reveal 元素加上 .is-visible。
 * 内容随数据变化时需要重新扫描，所以依赖 deps。
 */
export function useRevealOnScroll(deps: unknown[] = []) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** 导航高亮：返回当前可视区块的 id */
export function useScrollSpy(ids: string[], offset = 140): string {
  const [active, setActive] = useState(ids[0] ?? '')
  const frame = useRef(0)

  useEffect(() => {
    const compute = () => {
      frame.current = 0
      let current = ids[0] ?? ''
      for (const id of ids) {
        const node = document.getElementById(id)
        if (!node) continue
        if (node.getBoundingClientRect().top - offset <= 0) current = id
      }
      setActive((prev) => (prev === current ? prev : current))
    }
    const onScroll = () => {
      if (frame.current) return
      frame.current = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [ids, offset])

  return active
}

export interface Toast {
  id: number
  text: string
  tone: 'ok' | 'warn' | 'error'
}

let toastSeq = 0
const toastListeners = new Set<(toasts: Toast[]) => void>()
let toasts: Toast[] = []

function publish() {
  for (const listener of toastListeners) listener(toasts)
}

export function pushToast(text: string, tone: Toast['tone'] = 'ok') {
  const id = ++toastSeq
  toasts = [...toasts, { id, text, tone }]
  publish()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    publish()
  }, 4200)
}

export function useToasts(): Toast[] {
  const [list, setList] = useState<Toast[]>(toasts)
  useEffect(() => {
    toastListeners.add(setList)
    setList(toasts)
    return () => {
      toastListeners.delete(setList)
    }
  }, [])
  return list
}
