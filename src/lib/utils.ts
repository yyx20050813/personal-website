/** 生成稳定唯一的本地 id，用于列表项的增删改查 */
export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}${rand}`
}

/** 就地替换数组中指定 id 的元素 */
export function updateAt<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

/** 删除数组中指定 id 的元素 */
export function removeAt<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id)
}

/** 移动数组中元素位置，dir 为 -1 上移 / 1 下移 */
export function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir
  if (target < 0 || target >= list.length) return list
  const next = list.slice()
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 把逗号 / 顿号 / 换行分隔的文本切成数组 */
export function splitList(text: string): string[] {
  return text
    .split(/[\n,，、;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 数组还原为顿号分隔的一行文本 */
export function joinList(list: string[]): string {
  return (list ?? []).join('、')
}

export function download(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',')
  const mime = /:(.*?);/.exec(head)?.[1] ?? 'application/octet-stream'
  const binary = atob(body ?? '')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** 估算 base64 数据 URL 的实际字节数 */
export function dataUrlBytes(dataUrl: string): number {
  const idx = dataUrl.indexOf(',')
  if (idx < 0) return 0
  const body = dataUrl.slice(idx + 1)
  return Math.floor((body.length * 3) / 4)
}
