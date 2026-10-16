import type { Profile } from '../types'
import { IconArrowRight, IconDownload, IconEdit, contactIcon } from './icons'
import { heroStats } from './sections'
import { useAvatar, useResume } from './useAssets'

export function Hero({ profile }: { profile: Profile }) {
  const avatar = useAvatar(profile)
  const resume = useResume(profile)
  const stats = heroStats(profile)
  const { basic } = profile

  const chips = [
    basic.school,
    basic.grade,
    basic.political,
    basic.hometown ? `籍贯 ${basic.hometown}` : '',
  ].filter(Boolean)

  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <p className="hero__hello">
            <span className="hero__wave">👋</span>
            你好，我是{basic.name || '一位开发者'}
          </p>

          <h1 className="hero__name">{basic.name || '未填写姓名'}</h1>
          <p className="hero__headline">{basic.headline || '计算机专业学生'}</p>

          {chips.length > 0 ? (
            <ul className="hero__meta">
              {chips.map((chip) => (
                <li className="chip" key={chip}>
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}

          {basic.summary ? <p className="hero__summary">{basic.summary}</p> : null}

          <div className="hero__actions">
            {resume ? (
              <a className="btn btn--primary" href={resume.url} download={resume.fileName}>
                <IconDownload size={15} />
                下载简历
              </a>
            ) : (
              <a className="btn btn--primary" href="#/admin">
                <IconDownload size={15} />
                上传简历
              </a>
            )}
            <a className="btn" href="#projects">
              <IconArrowRight size={15} />
              查看项目经历
            </a>
            <a className="btn btn--ghost" href="#/admin">
              <IconEdit size={15} />
              管理后台
            </a>
          </div>

          {profile.contacts.length > 0 ? (
            <ul className="hero__contacts">
              {profile.contacts.slice(0, 4).map((contact) => {
                const Icon = contactIcon(contact.type)
                const content = (
                  <>
                    <Icon size={15} />
                    {contact.value}
                  </>
                )
                return (
                  <li key={contact.id}>
                    {contact.href ? (
                      <a className="hero__contact" href={contact.href}>
                        {content}
                      </a>
                    ) : (
                      <span className="hero__contact">{content}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>

        <div className="hero__portrait">
          <div className="portrait">
            <span className="portrait__ring" aria-hidden="true" />
            <img className="portrait__img" src={avatar.url} alt={`${basic.name} 的头像`} />
            <span className="portrait__tag">
              <span className="portrait__dot" />
              {basic.grade ? basic.grade.split('·')[0].trim() : '在读'}
            </span>
          </div>

          {stats.length > 0 ? (
            <ul className="hero__stats">
              {stats.map((stat) => (
                <li className="stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
