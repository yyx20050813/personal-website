import {
  ListEditor,
  ListField,
  Panel,
  RangeField,
  SelectField,
  TextAreaField,
  TextField,
} from '../fields'
import type { PanelProps } from '../panelTypes'
import { uid } from '../../lib/utils'
import type { Award, CampusExperience, Contact, Education, Project, SkillGroup } from '../../types'

/* ---------- 教育背景 ---------- */

export function EducationPanel({ profile, update }: PanelProps) {
  return (
    <Panel
      title="教育背景"
      desc="学校、成绩、主修课程与荣誉。课程和荣誉每行填一项，会渲染成标签与列表。"
    >
      <ListEditor<Education>
        items={profile.education}
        onChange={(education) => update((current) => ({ ...current, education }))}
        addLabel="添加教育经历"
        confirmDelete={false}
        title={(item) => item.school || '未命名学校'}
        create={() => ({
          id: uid('edu'),
          school: '',
          major: '',
          degree: '本科',
          start: '',
          end: '',
          gpa: '',
          rank: '',
          english: '',
          courses: [],
          honors: [],
        })}
        renderItem={(item, patch) => (
          <>
            <div className="grid-2">
              <TextField
                label="学校"
                value={item.school}
                placeholder="大连海事大学"
                onChange={(v) => patch({ school: v })}
              />
              <TextField
                label="专业"
                value={item.major}
                placeholder="计算机科学与技术"
                onChange={(v) => patch({ major: v })}
              />
              <TextField
                label="学历"
                value={item.degree}
                placeholder="本科"
                onChange={(v) => patch({ degree: v })}
              />
              <div className="grid-2">
                <TextField
                  label="开始时间"
                  value={item.start}
                  placeholder="2023.09"
                  onChange={(v) => patch({ start: v })}
                />
                <TextField
                  label="结束时间"
                  value={item.end}
                  placeholder="2027.06"
                  onChange={(v) => patch({ end: v })}
                />
              </div>
            </div>

            <div className="grid-3">
              <TextField
                label="GPA"
                value={item.gpa}
                placeholder="3.84 / 5"
                onChange={(v) => patch({ gpa: v })}
              />
              <TextField
                label="专业排名"
                value={item.rank}
                placeholder="11 / 70"
                onChange={(v) => patch({ rank: v })}
              />
              <TextField
                label="英语能力"
                value={item.english}
                placeholder="大学英语六级（CET-6）合格"
                onChange={(v) => patch({ english: v })}
              />
            </div>

            <div className="grid-2">
              <ListField
                label="主修课程"
                rows={5}
                value={item.courses}
                onChange={(courses) => patch({ courses })}
              />
              <ListField
                label="获得荣誉"
                rows={5}
                value={item.honors}
                onChange={(honors) => patch({ honors })}
              />
            </div>
          </>
        )}
      />
    </Panel>
  )
}

/* ---------- 技能 ---------- */

const SKILL_ICONS = [
  { value: 'code', label: '代码（编程基础）' },
  { value: 'chip', label: '芯片（硬件嵌入式）' },
  { value: 'palette', label: '调色板（设计表达）' },
  { value: 'globe', label: '地球（语言 / 网络）' },
  { value: 'tool', label: '工具（工程实践）' },
  { value: 'layers', label: '图层（综合能力）' },
]

export function SkillsPanel({ profile, update }: PanelProps) {
  return (
    <Panel
      title="技能展示"
      desc="每一个“技能分组”会渲染成一张卡片；卡片内的技能条目带 0-100 的掌握程度进度条。"
    >
      <ListEditor<SkillGroup>
        items={profile.skills}
        onChange={(skills) => update((current) => ({ ...current, skills }))}
        addLabel="添加技能分组"
        title={(item) => item.category || '未命名分组'}
        create={() => ({ id: uid('group'), category: '', icon: 'code', items: [] })}
        renderItem={(group, patch) => (
          <>
            <div className="grid-2">
              <TextField
                label="分组名称"
                value={group.category}
                placeholder="编程与专业基础"
                onChange={(v) => patch({ category: v })}
              />
              <SelectField
                label="分组图标"
                value={group.icon}
                options={SKILL_ICONS}
                onChange={(icon) => patch({ icon })}
              />
            </div>

            <div className="nested-head">
              <span>技能条目</span>
              <span>{group.items.length} 项</span>
            </div>
            <ListEditor
              nested
              confirmDelete={false}
              items={group.items}
              onChange={(items) => patch({ items })}
              addLabel="添加技能"
              emptyText="该分组还没有技能，点击下方按钮添加。"
              title={(item) => item.name || '未命名技能'}
              create={() => ({ id: uid('skill'), name: '', level: 70, note: '' })}
              renderItem={(item, patchItem) => (
                <>
                  <div className="grid-2">
                    <TextField
                      label="技能名称"
                      value={item.name}
                      placeholder="C 语言开发"
                      onChange={(v) => patchItem({ name: v })}
                    />
                    <RangeField
                      label="掌握程度"
                      value={item.level}
                      onChange={(level) => patchItem({ level })}
                      hint="仅用于页面进度条展示，按真实水平填写即可"
                    />
                  </div>
                  <TextAreaField
                    label="补充说明"
                    rows={2}
                    value={item.note}
                    placeholder="结构体 / 指针 / 单向链表 / 文件操作"
                    onChange={(v) => patchItem({ note: v })}
                  />
                </>
              )}
            />
          </>
        )}
      />
    </Panel>
  )
}

/* ---------- 项目经历 ---------- */

export function ProjectsPanel({ profile, update }: PanelProps) {
  return (
    <Panel
      title="项目经历"
      desc="每个项目是一张卡片。技术标签每行一项；“工作要点”对应简历里的加粗小标题 + 描述。"
    >
      <ListEditor<Project>
        items={profile.projects}
        onChange={(projects) => update((current) => ({ ...current, projects }))}
        addLabel="添加项目"
        title={(item) => item.name || '未命名项目'}
        create={() => ({
          id: uid('prj'),
          name: '',
          subtitle: '',
          period: '',
          tech: [],
          link: '',
          highlights: [],
        })}
        renderItem={(project, patch) => (
          <>
            <div className="grid-2">
              <TextField
                label="项目名称"
                value={project.name}
                placeholder="OpenHarmony 智能小车"
                onChange={(v) => patch({ name: v })}
              />
              <TextField
                label="副标题"
                value={project.subtitle}
                placeholder="鸿蒙设备开发"
                onChange={(v) => patch({ subtitle: v })}
              />
              <TextField
                label="时间"
                value={project.period}
                placeholder="留空则不显示"
                onChange={(v) => patch({ period: v })}
              />
              <TextField
                label="项目链接"
                value={project.link}
                placeholder="https://github.com/…（可留空）"
                onChange={(v) => patch({ link: v })}
              />
            </div>

            <ListField
              label="技术标签"
              rows={2}
              value={project.tech}
              placeholder="OpenHarmony&#10;嵌入式开发&#10;WiFi 通信"
              onChange={(tech) => patch({ tech })}
            />

            <div className="nested-head">
              <span>工作要点</span>
              <span>{project.highlights.length} 条</span>
            </div>
            <ListEditor
              nested
              confirmDelete={false}
              items={project.highlights}
              onChange={(highlights) => patch({ highlights })}
              addLabel="添加要点"
              emptyText="还没有要点，建议写 2-3 条，描述你具体做了什么。"
              title={(item) => item.title || '未命名要点'}
              create={() => ({ id: uid('hl'), title: '', detail: '' })}
              renderItem={(item, patchItem) => (
                <>
                  <TextField
                    label="小标题"
                    value={item.title}
                    placeholder="硬件与微程序开发"
                    onChange={(v) => patchItem({ title: v })}
                  />
                  <TextAreaField
                    label="详细描述"
                    rows={3}
                    value={item.detail}
                    onChange={(v) => patchItem({ detail: v })}
                  />
                </>
              )}
            />
          </>
        )}
      />
    </Panel>
  )
}

/* ---------- 竞赛经历 ---------- */

const LEVELS = [
  { value: '国家级', label: '国家级' },
  { value: '省级', label: '省级' },
  { value: '市级', label: '市级' },
  { value: '校级', label: '校级' },
  { value: '其他', label: '其他' },
]

const RANKS = [
  { value: '一等奖', label: '一等奖' },
  { value: '二等奖', label: '二等奖' },
  { value: '三等奖', label: '三等奖' },
  { value: '优秀奖', label: '优秀奖' },
  { value: '其他', label: '其他' },
]

export function AwardsPanel({ profile, update }: PanelProps) {
  return (
    <Panel title="竞赛经历" desc="按年份从新到旧排列更好读，可用右上角的箭头调整顺序。">
      <ListEditor<Award>
        items={profile.awards}
        onChange={(awards) => update((current) => ({ ...current, awards }))}
        addLabel="添加获奖"
        title={(item) => item.name || '未命名奖项'}
        create={() => ({
          id: uid('aw'),
          year: '',
          name: '',
          track: '',
          level: '省级',
          rank: '二等奖',
          description: '',
        })}
        renderItem={(item, patch) => (
          <>
            <div className="grid-2">
              <TextField
                label="年份"
                value={item.year}
                placeholder="2026"
                onChange={(v) => patch({ year: v })}
              />
              <TextField
                label="竞赛名称"
                value={item.name}
                placeholder="中国大学生计算机设计大赛"
                onChange={(v) => patch({ name: v })}
              />
              <TextField
                label="赛道"
                value={item.track}
                placeholder="游戏设计赛道"
                onChange={(v) => patch({ track: v })}
              />
              <div className="grid-2">
                <SelectField
                  label="级别"
                  value={item.level}
                  options={LEVELS}
                  onChange={(level) => patch({ level })}
                />
                <SelectField
                  label="奖项"
                  value={item.rank}
                  options={RANKS}
                  onChange={(rank) => patch({ rank })}
                />
              </div>
            </div>
            <TextAreaField
              label="获奖说明"
              rows={3}
              value={item.description}
              onChange={(v) => patch({ description: v })}
              hint="写清楚你在项目中承担了哪些工作"
            />
          </>
        )}
      />
    </Panel>
  )
}

/* ---------- 校园经历 ---------- */

export function CampusPanel({ profile, update }: PanelProps) {
  return (
    <Panel title="校园经历" desc="学生工作、社团与班级职务，以时间轴形式展示。">
      <ListEditor<CampusExperience>
        items={profile.campus}
        onChange={(campus) => update((current) => ({ ...current, campus }))}
        addLabel="添加经历"
        confirmDelete={false}
        title={(item) => item.role || '未命名经历'}
        create={() => ({ id: uid('cp'), org: '', role: '', start: '', end: '', points: [] })}
        renderItem={(item, patch) => (
          <>
            <div className="grid-2">
              <TextField
                label="单位 / 组织"
                value={item.org}
                placeholder="大连海事大学"
                onChange={(v) => patch({ org: v })}
              />
              <TextField
                label="职务"
                value={item.role}
                placeholder="学生会外联部部长"
                onChange={(v) => patch({ role: v })}
              />
              <TextField
                label="开始时间"
                value={item.start}
                placeholder="2023.09"
                onChange={(v) => patch({ start: v })}
              />
              <TextField
                label="结束时间"
                value={item.end}
                placeholder="2025.06 或 至今"
                onChange={(v) => patch({ end: v })}
              />
            </div>
            <ListField
              label="工作内容"
              rows={4}
              value={item.points}
              onChange={(points) => patch({ points })}
              placeholder="每行一条，会渲染成带勾选图标的列表"
            />
          </>
        )}
      />
    </Panel>
  )
}

/* ---------- 个人优势 ---------- */

export function AdvantagesPanel({ profile, update }: PanelProps) {
  return (
    <Panel title="个人优势" desc="“关于我”右侧的卡片列表，建议 3 条，每条一句话概括 + 一句佐证。">
      <ListEditor
        items={profile.advantages}
        onChange={(advantages) => update((current) => ({ ...current, advantages }))}
        addLabel="添加优势"
        confirmDelete={false}
        title={(item) => item.title || '未命名优势'}
        create={() => ({ id: uid('ad'), title: '', detail: '' })}
        renderItem={(item, patch) => (
          <>
            <TextField
              label="标题"
              value={item.title}
              placeholder="学业基础扎实"
              onChange={(v) => patch({ title: v })}
            />
            <TextAreaField
              label="详细说明"
              rows={3}
              value={item.detail}
              onChange={(v) => patch({ detail: v })}
            />
          </>
        )}
      />
    </Panel>
  )
}

/* ---------- 联系方式 ---------- */

const CONTACT_TYPES = [
  { value: 'email', label: '邮箱' },
  { value: 'phone', label: '电话' },
  { value: 'school', label: '院校' },
  { value: 'location', label: '位置' },
  { value: 'github', label: '代码仓库' },
  { value: 'link', label: '网页链接' },
  { value: 'other', label: '其他' },
]

export function ContactsPanel({ profile, update }: PanelProps) {
  return (
    <Panel
      title="联系方式"
      desc="同时显示在首屏与“联系方式”区块。链接留空则只展示文字，不可点击。"
    >
      <ListEditor<Contact>
        items={profile.contacts}
        onChange={(contacts) => update((current) => ({ ...current, contacts }))}
        addLabel="添加联系方式"
        confirmDelete={false}
        title={(item) => item.label || item.value || '未命名联系方式'}
        create={() => ({ id: uid('ct'), type: 'email', label: '', value: '', href: '' })}
        renderItem={(item, patch) => (
          <div className="grid-2">
            <SelectField
              label="类型"
              value={item.type}
              options={CONTACT_TYPES}
              onChange={(type) => patch({ type })}
            />
            <TextField
              label="名称"
              value={item.label}
              placeholder="邮箱 / 手机 / GitHub"
              onChange={(v) => patch({ label: v })}
            />
            <TextField
              label="显示内容"
              value={item.value}
              placeholder="878281275@qq.com"
              onChange={(v) => patch({ value: v })}
            />
            <TextField
              label="跳转链接"
              value={item.href}
              placeholder="mailto:xxx@qq.com / tel:159… / https://…"
              onChange={(v) => patch({ href: v })}
            />
          </div>
        )}
      />
    </Panel>
  )
}
