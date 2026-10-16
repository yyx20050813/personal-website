import type { CSSProperties, ReactNode } from 'react'
import { pushToast } from '../lib/hooks'
import type { Award, CampusExperience, Education, Profile, Project, SkillGroup } from '../types'
import {
  IconArrowRight,
  IconCheck,
  IconDownload,
  IconExternal,
  IconFile,
  IconInfo,
  IconLayers,
  IconStar,
  contactIcon,
  skillIcon,
} from './icons'
import { useResume } from './useAssets'

/* ---------- 区块标题 ---------- */

export function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string
  title: string
  desc?: string
}) {
  return (
    <header className="section__head reveal">
      <p className="section__eyebrow">{eyebrow}</p>
      <h2 className="section__title">{title}</h2>
      {desc ? <p className="section__desc">{desc}</p> : null}
    </header>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="empty">{text}</p>
}

/* ---------- 关于我 ---------- */

export function AboutSection({ profile }: { profile: Profile }) {
  const { basic } = profile
  const rows: { label: string; value: string }[] = [
    { label: '姓名', value: basic.name },
    { label: '出生年月', value: basic.birth },
    { label: '院校专业', value: [basic.school, basic.major].filter(Boolean).join(' · ') },
    { label: '学历年级', value: [basic.degree, basic.grade].filter(Boolean).join(' · ') },
    { label: '政治面貌', value: basic.political },
    { label: '籍贯', value: basic.hometown },
    { label: '求职意向', value: basic.jobTarget },
  ].filter((row) => row.value)

  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHead
          eyebrow="About"
          title="关于我"
          desc="一句话概括：软硬件都愿意动手、能把项目从方案做到落地的计算机专业学生。"
        />
        <div className="about__grid reveal">
          <div className="info-card">
            <h3 className="info-card__title">
              <IconInfo size={17} />
              基本信息
            </h3>
            <dl className="info-list">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="advantage-list">
            {profile.advantages.length === 0 ? (
              <Empty text="暂无个人优势内容，可在管理后台添加。" />
            ) : (
              profile.advantages.map((item, index) => (
                <article className="advantage" key={item.id}>
                  <span className="advantage__index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="advantage__title">{item.title}</h3>
                    <p className="advantage__detail">{item.detail}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 教育背景 ---------- */

function EducationCard({ item }: { item: Education }) {
  return (
    <article className="edu-card">
      <div className="edu-card__top">
        <div>
          <div className="edu-card__school">
            <span className="edu-card__logo">{item.school.slice(0, 1) || '校'}</span>
            <div>
              <div>{item.school}</div>
              <p className="edu-card__meta">
                {[item.major, item.degree].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        </div>
        {item.start || item.end ? (
          <span className="edu-card__period">
            {item.start}
            {item.start || item.end ? ' - ' : ''}
            {item.end}
          </span>
        ) : null}
      </div>

      <div className="edu-stats">
        {item.gpa ? (
          <div className="edu-stat">
            <p className="edu-stat__label">GPA</p>
            <p className="edu-stat__value">{item.gpa}</p>
          </div>
        ) : null}
        {item.rank ? (
          <div className="edu-stat">
            <p className="edu-stat__label">专业排名</p>
            <p className="edu-stat__value">{item.rank}</p>
          </div>
        ) : null}
        {item.english ? (
          <div className="edu-stat">
            <p className="edu-stat__label">英语能力</p>
            <p className="edu-stat__value">{item.english}</p>
          </div>
        ) : null}
      </div>

      {item.courses.length > 0 ? (
        <>
          <h4 className="block-title">主修课程</h4>
          <ul className="tag-cloud">
            {item.courses.map((course) => (
              <li className="chip" key={course}>
                {course}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {item.honors.length > 0 ? (
        <>
          <h4 className="block-title">获得荣誉</h4>
          <ul className="honor-list">
            {item.honors.map((honor) => (
              <li className="honor" key={honor}>
                <IconStar size={15} />
                <span>{honor}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  )
}

export function EducationSection({ profile }: { profile: Profile }) {
  return (
    <section id="education" className="section">
      <div className="container">
        <SectionHead eyebrow="Education" title="教育背景" desc="在校成绩、主修课程与荣誉情况。" />
        <div className="reveal">
          {profile.education.length === 0 ? (
            <Empty text="暂无教育背景内容，可在管理后台添加。" />
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              {profile.education.map((item) => (
                <EducationCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- 技能 ---------- */

function SkillCard({ group }: { group: SkillGroup }) {
  const Icon = skillIcon(group.icon)
  return (
    <article className="skill-card reveal">
      <header className="skill-card__head">
        <span className="skill-card__icon">
          <Icon size={19} />
        </span>
        <div>
          <h3 className="skill-card__category">{group.category}</h3>
          <p className="skill-card__count">{group.items.length} 项技能</p>
        </div>
      </header>
      <ul className="skill-list">
        {group.items.map((item) => (
          <li key={item.id}>
            <div className="skill__top">
              <span className="skill__name">{item.name}</span>
              <span className="skill__level">{item.level}%</span>
            </div>
            <div
              className="skill__track"
              role="progressbar"
              aria-label={item.name}
              aria-valuenow={item.level}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span
                className="skill__fill"
                style={{ '--level': `${item.level}%` } as CSSProperties}
              />
            </div>
            {item.note ? <p className="skill__note">{item.note}</p> : null}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function SkillsSection({ profile }: { profile: Profile }) {
  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHead
          eyebrow="Skills"
          title="技能展示"
          desc="按「编程与专业基础 / 硬件与嵌入式 / 办公与设计表达」三块整理，百分比为自我评估的掌握程度。"
        />
        {profile.skills.length === 0 ? (
          <Empty text="暂无技能内容，可在管理后台添加。" />
        ) : (
          <div className="skills__grid">
            {profile.skills.map((group) => (
              <SkillCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- 项目经历 ---------- */

function ProjectCard({ item, index }: { item: Project; index: number }) {
  return (
    <article className="project-card reveal">
      <header className="project-card__head">
        <div>
          <span className="project-card__index">PROJECT {String(index + 1).padStart(2, '0')}</span>
          <h3 className="project-card__name">{item.name}</h3>
          {item.subtitle ? <p className="project-card__subtitle">{item.subtitle}</p> : null}
        </div>
        {item.period ? <span className="chip">{item.period}</span> : null}
      </header>

      {item.tech.length > 0 ? (
        <ul className="project-card__tags">
          {item.tech.map((tech) => (
            <li className="chip chip--accent" key={tech}>
              {tech}
            </li>
          ))}
        </ul>
      ) : null}

      {item.highlights.length > 0 ? (
        <ul className="highlight-list">
          {item.highlights.map((h) => (
            <li className="highlight" key={h.id}>
              <IconCheck size={14} />
              <span>
                {h.title ? <strong>{h.title}：</strong> : null}
                {h.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {item.link ? (
        <a className="project-card__link" href={item.link} target="_blank" rel="noreferrer">
          查看项目
          <IconExternal size={14} />
        </a>
      ) : null}
    </article>
  )
}

export function ProjectsSection({ profile }: { profile: Profile }) {
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHead
          eyebrow="Projects"
          title="项目经历"
          desc="从数据结构、计算机组成原理到鸿蒙设备与 Android 应用，覆盖软硬件多个方向。"
        />
        {profile.projects.length === 0 ? (
          <Empty text="暂无项目内容，可在管理后台添加。" />
        ) : (
          <div className="projects__grid">
            {profile.projects.map((item, index) => (
              <ProjectCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- 竞赛经历 ---------- */

function AwardRow({ item }: { item: Award }) {
  return (
    <article className="award reveal">
      <div>
        <p className="award__year">{item.year}</p>
        <span className="award__level">{item.level}</span>
      </div>
      <div>
        <div className="award__head">
          <h3 className="award__name">{item.name}</h3>
          {item.rank ? <span className="award__rank">{item.rank}</span> : null}
        </div>
        {item.track ? <p className="award__track">{item.track}</p> : null}
        {item.description ? <p className="award__desc">{item.description}</p> : null}
      </div>
    </article>
  )
}

export function AwardsSection({ profile }: { profile: Profile }) {
  return (
    <section id="awards" className="section">
      <div className="container">
        <SectionHead eyebrow="Awards" title="竞赛经历" desc="国家级与省级竞赛获奖，含承担的具体工作。" />
        {profile.awards.length === 0 ? (
          <Empty text="暂无竞赛内容，可在管理后台添加。" />
        ) : (
          <div className="awards">
            {profile.awards.map((item) => (
              <AwardRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- 校园经历 ---------- */

function CampusRow({ item }: { item: CampusExperience }) {
  return (
    <article className="timeline__item reveal">
      <div className="timeline__head">
        <div>
          <h3 className="timeline__role">{item.role}</h3>
          {item.org ? <p className="timeline__org">{item.org}</p> : null}
        </div>
        {item.start || item.end ? (
          <span className="timeline__period">
            {item.start}
            {item.start || item.end ? ' - ' : ''}
            {item.end}
          </span>
        ) : null}
      </div>
      {item.points.length > 0 ? (
        <ul className="timeline__points">
          {item.points.map((point) => (
            <li className="highlight" key={point}>
              <IconCheck size={14} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export function CampusSection({ profile }: { profile: Profile }) {
  return (
    <section id="campus" className="section">
      <div className="container">
        <SectionHead eyebrow="Campus" title="校园经历" desc="学生工作中的组织、统筹与沟通能力积累。" />
        {profile.campus.length === 0 ? (
          <Empty text="暂无校园经历内容，可在管理后台添加。" />
        ) : (
          <div className="timeline reveal">
            {profile.campus.map((item) => (
              <CampusRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- 联系方式 ---------- */

export function ContactSection({ profile }: { profile: Profile }) {
  const resume = useResume(profile)
  const { basic, contacts } = profile

  const copyEmail = async () => {
    if (!basic.email) {
      pushToast('还没有填写邮箱，请先在管理后台补充', 'warn')
      return
    }
    try {
      await navigator.clipboard.writeText(basic.email)
      pushToast('邮箱已复制到剪贴板')
    } catch {
      pushToast('复制失败，请手动选择邮箱文本', 'warn')
    }
  }

  const renderContact = (contact: Profile['contacts'][number]): ReactNode => {
    const Icon = contactIcon(contact.type)
    const body = (
      <>
        <span className="contact-item__icon">
          <Icon size={17} />
        </span>
        <span>
          <span className="contact-item__label">{contact.label}</span>
          <span className="contact-item__value">{contact.value}</span>
        </span>
      </>
    )
    return contact.href ? (
      <a className="contact-item" href={contact.href} target="_blank" rel="noreferrer" key={contact.id}>
        {body}
      </a>
    ) : (
      <div className="contact-item" key={contact.id}>
        {body}
      </div>
    )
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="contact-card reveal">
          <div>
            <p className="section__eyebrow">Contact</p>
            <h2 className="contact-card__title" style={{ marginTop: 10 }}>
              期待与你交流
            </h2>
            <p className="contact-card__desc">
              {basic.jobTarget
                ? `求职意向：${basic.jobTarget}。`
                : '欢迎就项目合作、技术交流与我联系。'}
              {resume
                ? ' 点击下方按钮可下载简历 PDF，也可以直接发邮件给我。'
                : ' 目前还没有上传简历文件，可先通过邮件或电话联系。'}
            </p>
            <div className="contact-card__actions">
              {resume ? (
                <a className="btn btn--primary" href={resume.url} download={resume.fileName}>
                  <IconDownload size={15} />
                  下载简历
                </a>
              ) : null}
              <button type="button" className="btn" onClick={copyEmail}>
                <IconFile size={15} />
                复制邮箱
              </button>
              <a className="btn btn--ghost" href="#top">
                <IconArrowRight size={15} />
                回到顶部
              </a>
            </div>
          </div>

          <div className="contact-grid">
            {contacts.length === 0 ? (
              <Empty text="暂无联系方式。" />
            ) : (
              contacts.map((contact) => renderContact(contact))
            )}
            {basic.hometown ? (
              <div className="contact-item">
                <span className="contact-item__icon">
                  <IconLayers size={17} />
                </span>
                <span>
                  <span className="contact-item__label">籍贯</span>
                  <span className="contact-item__value">{basic.hometown}</span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 教育小工具（供 Hero 统计使用） ---------- */

export function heroStats(profile: Profile) {
  const education = profile.education[0]
  const stats: { value: string; label: string }[] = []
  if (education?.gpa) stats.push({ value: education.gpa.split('/')[0].trim(), label: '/5 GPA' })
  if (education?.rank) stats.push({ value: education.rank.replace(/\s/g, ''), label: '专业排名' })
  if (profile.projects.length) stats.push({ value: String(profile.projects.length), label: '个项目经历' })
  if (stats.length < 3 && profile.awards.length) {
    stats.push({ value: String(profile.awards.length), label: '项竞赛获奖' })
  }
  if (stats.length < 3 && profile.skills.length) {
    stats.push({ value: String(profile.skills.length), label: '类技能方向' })
  }
  return stats.slice(0, 3)
}
