import type { ReactNode, SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m3.8 7.4 7.3 5.2a1.6 1.6 0 0 0 1.8 0l7.3-5.2" />
  </Svg>
)

export const IconPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 3.5h2.2l1.6 4-2 1.4a11.6 11.6 0 0 0 5.8 5.8l1.4-2 4 1.6v2.2a2.5 2.5 0 0 1-2.7 2.5C10.9 18.5 5.5 13.1 4 6.2A2.5 2.5 0 0 1 6.5 3.5Z" />
  </Svg>
)

export const IconSchool = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z" />
    <path d="M6.5 11.7V16c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-4.3" />
    <path d="M21 9.5V15" />
  </Svg>
)

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.3" r="2.4" />
  </Svg>
)

export const IconFlag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3v18" />
    <path d="M6 4.2h9.8l-1.5 3.6 1.5 3.6H6" />
  </Svg>
)

export const IconBriefcase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
    <path d="M3 12.5h18" />
  </Svg>
)

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.2" r="3.7" />
    <path d="M4.8 20c.9-3.5 3.7-5.5 7.2-5.5s6.3 2 7.2 5.5" />
  </Svg>
)

export const IconCode = (p: IconProps) => (
  <Svg {...p}>
    <path d="m8.5 8-4 4 4 4" />
    <path d="m15.5 8 4 4-4 4" />
    <path d="M13.4 4.5 10.6 19.5" />
  </Svg>
)

export const IconChip = (p: IconProps) => (
  <Svg {...p}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
  </Svg>
)

export const IconPalette = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 2-.9 2-1.9 0-1.4-1.2-1.7-1.2-2.7 0-.8.7-1.4 1.6-1.4h1.6a4.5 4.5 0 0 0 4.5-4.5C20.5 6.6 16.7 3.5 12 3.5Z" />
    <circle cx="8.2" cy="11" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="11" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.4" cy="8.6" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconGlobe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" />
  </Svg>
)

export const IconTool = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.6 6.2a3.6 3.6 0 0 0 4.8 4.7l-8.2 8.2a2.2 2.2 0 0 1-3.1-3.1l8.2-8.2a3.6 3.6 0 0 0-1.7-1.6Z" />
    <path d="M6 4.5 9 7.5" />
  </Svg>
)

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.6 4.3 4.3L19 7" />
  </Svg>
)

export const IconStar = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 4 2.5 5 5.5.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L12 4Z" />
  </Svg>
)

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
)

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v11" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M5 19h14" />
  </Svg>
)

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
)

export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
  </Svg>
)

export const IconMoon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Svg>
)

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3.5H8a2.5 2.5 0 0 0-2.5 2.5v12A2.5 2.5 0 0 0 8 20.5h8a2.5 2.5 0 0 0 2.5-2.5V8L14 3.5Z" />
    <path d="M13.6 3.8V8h4.4" />
  </Svg>
)

export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 17V6" />
    <path d="m7.5 10.5 4.5-4.5 4.5 4.5" />
    <path d="M5 19h14" />
  </Svg>
)

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7l.9 12A2 2 0 0 0 9.4 21h5.2a2 2 0 0 0 2-1.9L17.5 7" />
    <path d="M10.5 11v6M13.5 11v6" />
  </Svg>
)

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </Svg>
)

export const IconDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </Svg>
)

export const IconSave = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 4.5h9L19.5 9.5v9a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-13Z" />
    <path d="M9 4.5V9h5.5V4.5" />
    <path d="M8.5 20v-5h7v5" />
  </Svg>
)

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
)

export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11.5A8 8 0 0 0 6.3 6.8L4 9" />
    <path d="M4 4.5V9h4.5" />
    <path d="M4 12.5a8 8 0 0 0 13.7 4.7L20 15" />
    <path d="M20 19.5V15h-4.5" />
  </Svg>
)

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10" />
    <path d="M19.5 4.5 12 12" />
    <path d="M18 14.5v3.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2H10" />
  </Svg>
)

export const IconEdit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16.5 4.6l2.9 2.9-9.6 9.6-3.6.7.7-3.6 9.6-9.6Z" />
    <path d="M5 20h14" />
  </Svg>
)

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
    <path d="m4 12.5 8 4.3 8-4.3" />
    <path d="m4 16.8 8 4.2 8-4.2" />
  </Svg>
)

export const IconAward = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="m8.6 14.2-1.1 6 4.5-2.4 4.5 2.4-1.1-6" />
  </Svg>
)

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <path d="M12 7.8h.01" />
  </Svg>
)

export const IconWarning = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4M12 16.6h.01" />
  </Svg>
)

/** 技能分组图标：按 icon 字段取用，找不到就用默认 */
export function skillIcon(name: string): (p: IconProps) => ReactNode {
  const map: Record<string, (p: IconProps) => ReactNode> = {
    code: IconCode,
    chip: IconChip,
    palette: IconPalette,
    globe: IconGlobe,
    tool: IconTool,
    layers: IconLayers,
  }
  return map[name] ?? IconCode
}

/** 联系方式图标：按 type 字段取用 */
export function contactIcon(name: string): (p: IconProps) => ReactNode {
  const map: Record<string, (p: IconProps) => ReactNode> = {
    email: IconMail,
    phone: IconPhone,
    school: IconSchool,
    location: IconPin,
    github: IconCode,
    link: IconGlobe,
    other: IconUser,
  }
  return map[name] ?? IconInfo
}
