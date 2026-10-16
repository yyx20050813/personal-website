import type { ReactNode } from 'react'
import { moveItem, removeAt, updateAt } from '../lib/utils'
import { IconDown, IconPlus, IconTrash, IconUp } from '../site/icons'

/* ---------- 基础字段 ---------- */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label?: string
  hint?: ReactNode
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="field">
      {label ? (
        <span className="field__label">
          {label}
          {required ? <span className="field__required">*</span> : null}
        </span>
      ) : null}
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: ReactNode
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: ReactNode
  placeholder?: string
  rows?: number
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className="textarea"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

/** 逗号 / 顿号 / 换行分隔的字符串数组，用多行文本编辑 */
export function ListField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 3,
}: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  hint?: ReactNode
  placeholder?: string
  rows?: number
}) {
  return (
    <TextAreaField
      label={label}
      rows={rows}
      value={value.join('\n')}
      hint={hint ?? '每行一项，也可以用逗号或顿号分隔'}
      placeholder={placeholder}
      onChange={(text) =>
        onChange(
          text
            .split(/[\n,，、;；]/)
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
    />
  )
}

export function RangeField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  hint?: ReactNode
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="range-row">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="range-value">{value}%</span>
      </div>
    </Field>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  hint?: ReactNode
}) {
  return (
    <Field label={label} hint={hint}>
      <select className="select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

/* ---------- 面板容器 ---------- */

export function Panel({
  title,
  desc,
  actions,
  children,
}: {
  title?: string
  desc?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="panel">
      {title ? (
        <header className="panel__head">
          <h2 className="panel__title">{title}</h2>
          {actions}
        </header>
      ) : null}
      {desc ? <p className="panel__desc">{desc}</p> : null}
      {children}
    </section>
  )
}

/* ---------- 通用列表编辑器 ---------- */

export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  create,
  renderItem,
  title,
  addLabel,
  emptyText = '还没有内容，点击下方按钮添加。',
  nested = false,
  confirmDelete = true,
}: {
  items: T[]
  onChange: (items: T[]) => void
  create: () => T
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  title?: (item: T, index: number) => string
  addLabel: string
  emptyText?: string
  nested?: boolean
  confirmDelete?: boolean
}) {
  const handleRemove = (item: T, index: number) => {
    if (confirmDelete && !window.confirm(`确定删除「${title ? title(item, index) : `第 ${index + 1} 项`}」吗？`)) {
      return
    }
    onChange(removeAt(items, item.id))
  }

  return (
    <div className={nested ? 'nested-block' : 'grid-1'}>
      {items.length === 0 ? <p className="list-empty">{emptyText}</p> : null}

      {items.map((item, index) => (
        <div className={`list-card${nested ? ' list-card--nested' : ''}`} key={item.id}>
          <div className="list-card__head">
            <span className="list-card__title">
              <span className="list-card__index">{index + 1}</span>
              <span>{title ? title(item, index) : `第 ${index + 1} 项`}</span>
            </span>
            <span className="row-actions">
              <button
                type="button"
                className="mini-btn"
                title="上移"
                disabled={index === 0}
                onClick={() => onChange(moveItem(items, index, -1))}
              >
                <IconUp size={14} />
              </button>
              <button
                type="button"
                className="mini-btn"
                title="下移"
                disabled={index === items.length - 1}
                onClick={() => onChange(moveItem(items, index, 1))}
              >
                <IconDown size={14} />
              </button>
              <button
                type="button"
                className="mini-btn mini-btn--danger"
                title="删除"
                onClick={() => handleRemove(item, index)}
              >
                <IconTrash size={14} />
              </button>
            </span>
          </div>
          {renderItem(item, (patch) => onChange(updateAt(items, item.id, patch)), index)}
        </div>
      ))}

      <div className="add-row">
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => onChange([...items, create()])}
        >
          <IconPlus size={14} />
          {addLabel}
        </button>
      </div>
    </div>
  )
}
