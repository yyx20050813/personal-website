import { useEffect, useState } from 'react'
import { Toaster } from '../components/Toaster'
import { useProfile, useRevealOnScroll, useScrollSpy, useTheme } from '../lib/hooks'
import { Hero } from './Hero'
import {
  AboutSection,
  AwardsSection,
  CampusSection,
  ContactSection,
  EducationSection,
  ProjectsSection,
  SkillsSection,
} from './sections'
import { IconClose, IconMenu, IconMoon, IconSun } from './icons'

export const NAV_SECTIONS = [
  { id: 'about', label: '关于我' },
  { id: 'education', label: '教育背景' },
  { id: 'skills', label: '技能展示' },
  { id: 'projects', label: '项目经历' },
  { id: 'awards', label: '竞赛经历' },
  { id: 'campus', label: '校园经历' },
  { id: 'contact', label: '联系方式' },
] as const

const SECTION_IDS = NAV_SECTIONS.map((item) => item.id)

export function SiteApp() {
  const profile = useProfile()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useScrollSpy(SECTION_IDS)

  useRevealOnScroll([profile])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const title = profile.meta.siteTitle || `${profile.basic.name || '个人'} · 个人主页`
    document.title = title
  }, [profile.meta.siteTitle, profile.basic.name])

  const brandText = profile.meta.navBrand || profile.basic.name || '个人主页'

  return (
    <div className="site">
      <div className="site__bg" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
        <span className="blob blob--3" />
      </div>

      <a className="skip-link" href="#about">
        跳到主要内容
      </a>

      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container nav__inner">
          <a className="nav__brand" href="#top">
            <span className="nav__mark">{brandText.slice(0, 1)}</span>
            <span>{brandText}</span>
          </a>

          <nav className="nav__links" aria-label="页面导航">
            {NAV_SECTIONS.map((item) => (
              <a
                className={`nav__link${active === item.id ? ' is-active' : ''}`}
                href={`#${item.id}`}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              aria-label={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
              title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
            >
              {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <a className="btn btn--sm nav__cta" href="#/admin">
              管理后台
            </a>
            <a className="btn btn--sm btn--primary nav__cta" href="#contact">
              联系我
            </a>
            <button
              type="button"
              className="icon-btn nav__burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconClose size={16} /> : <IconMenu size={16} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="nav__mobile">
            <div className="container">
              <div className="nav__mobile-list">
                {NAV_SECTIONS.map((item) => (
                  <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                ))}
                <a href="#/admin" onClick={() => setMenuOpen(false)}>
                  管理后台
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Hero profile={profile} />
        <AboutSection profile={profile} />
        <EducationSection profile={profile} />
        <SkillsSection profile={profile} />
        <ProjectsSection profile={profile} />
        <AwardsSection profile={profile} />
        <CampusSection profile={profile} />
        <ContactSection profile={profile} />
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <p>
            {profile.meta.footer ||
              `© ${new Date().getFullYear()} ${profile.basic.name} · 纯前端个人展示网站`}
          </p>
          <div className="footer__links">
            {profile.basic.email ? <a href={`mailto:${profile.basic.email}`}>邮件</a> : null}
            <a href="#top">回到顶部</a>
            <a href="#/admin">管理后台</a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
