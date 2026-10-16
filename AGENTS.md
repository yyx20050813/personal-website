# AGENTS.md · 个人展示网站

本文件面向在此仓库中协作的 AI 编码助手与新加入的开发者，说明项目结构、编码约定、修改流程与验证要求。

配套文档：

- `PRD.md` —— 产品需求与验收标准
- `TECH_DESIGN.md` —— 技术设计与架构决策
- `README.md` —— 面向使用者的功能与部署说明

---

## 1. 项目概览

一个**纯前端**的个人展示网站：展示站（`#/`）+ 浏览器端管理后台（`#/admin`）。没有服务端、没有数据库、不发起任何第三方网络请求，运行时依赖只有 `react` 与 `react-dom`。

数据存在三个层级，优先级从高到低：

1. 本机修改 —— `localStorage`，键 `showcase.profile.v1`
2. 已发布的静态数据 —— `public/data/profile.json`（构建后为 `dist/data/profile.json`）
3. 打包内置数据 —— `src/data/profile.default.json`（兜底）

头像与简历的原始文件存在 IndexedDB（数据库 `showcase-files`）。

---

## 2. 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发，http://localhost:5173（自动打开浏览器）
npm run build      # tsc --noEmit && vite build → dist/
npm run typecheck  # 仅类型检查
npm run preview    # 预览构建产物
```

部署：

```bash
npx wrangler pages deploy dist --project-name=personal-website
# 或使用仓库内的直传脚本（强制 IPv4 + 重试，本机网络下更稳）
node scripts/deploy-cloudflare.mjs
```

**改动完成后必须执行 `npm run build`**，它同时完成类型检查与构建。类型检查不通过时不会产出 `dist/`。

---

## 3. 目录职责

| 路径 | 职责 |
| --- | --- |
| `src/types.ts` | 全站数据模型，**唯一数据契约来源** |
| `src/lib/normalize.ts` | 数据校验与补全、空骨架、深拷贝 |
| `src/lib/profileStore.ts` | 数据源与三层优先级、`localStorage` 读写、存储键常量 |
| `src/lib/fileStore.ts` | 头像 / 简历的 IndexedDB 仓库（含内存降级） |
| `src/lib/publish.ts` | 导出（base64 内嵌）/ 导入 |
| `src/lib/auth.ts` | 后台口令哈希与登录态 |
| `src/lib/hooks.ts` | `useProfile` / `useFiles` / `useTheme` / 滚动动画 / 滚动高亮 / 轻提示 |
| `src/lib/router.ts` | hash 路由 |
| `src/lib/utils.ts` | id 生成、列表增删改排序、格式化、下载、base64 互转 |
| `src/site/` | 展示站组件（`SiteApp` / `Hero` / `sections` / `useAssets` / `icons`） |
| `src/admin/` | 管理后台（`AdminApp` / `Login` / `fields` / `panels/`） |
| `src/styles/` | `base.css`（变量与通用组件）、`site.css`、`admin.css` |
| `public/` | 原样拷贝到 `dist/`：`assets/`、`data/profile.json`、`_redirects` |
| `scripts/deploy-cloudflare.mjs` | Cloudflare Pages 直传部署脚本 |

依赖方向单向：`site/`、`admin/` → `lib/`、`types.ts`。`lib/` 内部只允许 `normalize` ← `profileStore` ← `publish` 这一条链路，**不要引入循环依赖**。

---

## 4. 编码约定

### 4.1 文件与命名

| 对象 | 约定 | 示例 |
| --- | --- | --- |
| React 组件文件 | PascalCase `.tsx` | `SiteApp.tsx`、`FilesPanel.tsx` |
| 逻辑模块 | camelCase `.ts` | `profileStore.ts`、`useAssets.ts` |
| 组件名 | PascalCase，具名导出 | `export function Hero(...)` |
| 函数 / 变量 | camelCase | `normalizeProfile`、`splitList` |
| 常量 | UPPER_SNAKE_CASE | `PROFILE_KEY`、`DEFAULT_PASSWORD`、`IMAGE_MAX` |
| 类型 / 接口 | PascalCase | `Profile`、`PanelProps` |

**没有路径别名**，`tsconfig.json` 里没有 `paths`，一律使用相对路径导入（`../lib/hooks`、`./panels/BasicPanel`）。

### 4.2 代码风格

- 不写分号，字符串用单引号，缩进 2 空格，单行尽量不超过约 100 字符。
- 仓库内**没有** ESLint / Prettier / EditorConfig 配置，格式靠约定与人工保持一致，不要为此新增配置文件。
- 组件一律**具名导出**，不使用 `export default`。
- 注释用**中文**，解释"为什么"而非"做了什么"。类型与接口字段上加 `/** ... */` 说明用途。
- 启用严格模式且开启 `noUnusedLocals`、`noUnusedParameters`：不要留未使用的变量或参数。TS 允许以 `_` 前缀的形参未使用，但本项目不采用该写法，未使用的参数请直接删除。
- 优先不可变更新：`{ ...prev, field: next }`，不要就地修改对象。

### 4.3 样式约定

- 类名使用 **BEM 风格**：块 `hero`、元素 `hero__inner`、修饰符 `btn--primary`。
- 状态类使用 `is-` 前缀：`is-active`、`is-scrolled`、`is-visible`、`is-dragging`。
- 颜色、圆角、阴影、间距一律使用 `base.css` 中定义的 CSS 变量，**不要在组件里写死色值**。
- 深色主题通过 `[data-theme='dark']` 覆盖变量实现，不要写 `@media (prefers-color-scheme)` 来改颜色。
- 新增样式按归属放进 `base.css`（通用）/ `site.css`（展示站）/ `admin.css`（后台），不要新建第四个样式文件。
- 打印样式规则集中在 `base.css` 的 `@media print` 中。

---

## 5. 数据与状态约定

### 5.1 访问数据

组件**不要**直接 import `profileStore` 单例，统一走 hook：

```tsx
const profile = useProfile()          // 全站数据
const source = useProfileSource()     // 'local' | 'static' | 'builtin'
const files = useFiles()              // 本机已上传的头像 / 简历
const toasts = useToasts()            // 轻提示
```

底层是 `useSyncExternalStore` + 模块级单例，任何 `emit()` 都会触发所有订阅组件重渲染。

### 5.2 修改数据

- **展示站只读**：`site/` 下的组件不得调用 `profileStore` 的写方法。
- **后台通过草稿编辑**：`AdminApp` 持有 `draft` 状态，面板通过 `PanelProps.update(recipe)` 以不可变方式修改：

  ```tsx
  update((p) => ({ ...p, basic: { ...p.basic, name: '新名字' } }))
  ```

- **落盘只发生在保存时**：`update` 只改内存草稿。写入 `localStorage` 只由 `profileStore.save()` 完成（后台「保存」按钮或 `Ctrl + S`）。
- **修改后需要归一化**：任何外部来源的数据（导入的 JSON、`localStorage`、静态文件）都必须先过 `normalizeProfile()` 才能进入系统。

### 5.3 列表操作

列表项的增删改排序统一使用 `src/lib/utils.ts` 中的工具，不要手写 `splice`：

```ts
updateAt(list, id, patch)   // 按 id 替换
removeAt(list, id)          // 按 id 删除
moveItem(list, index, dir)  // dir 为 -1 上移 / 1 下移
```

列表项必须带唯一 `id`（用 `uid('前缀')` 生成）。

---

## 6. 数据模型变更清单

修改 `src/types.ts` 中的任何字段时，**必须同步以下所有位置**，缺一项就会导致数据被静默丢弃或页面渲染异常：

1. `src/types.ts` —— 添加 / 修改类型定义与注释。
2. `src/lib/normalize.ts` —— 在对应的 `normalizeXxx()` 中处理该字段；若属于新增区块，还要更新 `emptyProfile` 与 `normalizeProfile` 的 `pick(...)` 列表。
3. `src/data/profile.default.json` —— 补上默认值。
4. `public/data/profile.json` —— 同步补上（否则线上访客看不到该字段的默认内容）。
5. `src/admin/panels/` —— 在对应面板中加上编辑控件。
6. 展示侧 —— 在 `src/site/sections.tsx`（或 `Hero.tsx`）中渲染该字段。

新增一个**完整展示区块**时，除上述 6 步外还要：

7. `src/site/SiteApp.tsx` —— 在 `NAV_SECTIONS` 与 `<main>` 中登记。
8. `src/admin/AdminApp.tsx` —— 在 `tabs` 数组中登记编辑面板。

---

## 7. 明确不要做的事

- **不要引入新的运行时依赖**（如 UI 框架、路由库、状态管理库、图标库、日期库）。当前运行时依赖只有 `react` 与 `react-dom`，这是项目的硬约束。
- **不要引入外部字体、CDN 资源或追踪脚本**，站点必须零第三方请求。
- **不要把敏感信息写进数据**。纯前端项目没有安全边界，任何访客都能读到 `localStorage` 与源码，站点内容应视为完全公开。不要把身份证号、家庭住址、未公开联系方式放进站内。
- **不要把 `dist/` 或 `node_modules/` 提交进仓库**（`.gitignore` 已配置）。
- **不要把后台口令写进代码或文档**（默认口令 `admin123` 是公开的初始值，不作为密文使用）。
- **不要改动 `vite.config.ts` 中的 `base: './'`**。产物依赖相对路径才能同时部署在根目录与子目录，并支持 `file://` 直接打开。
- **不要删除 `public/_redirects`**，它是 Cloudflare Pages 的兜底重写规则。
- **不要绕过 `normalizeProfile()` 直接使用外部数据**。
- **不要为了动画引入动画库**；滚动进场动画用 `IntersectionObserver` + `.reveal` / `.is-visible` 两个类实现。
- **不要新增第四个 CSS 文件**，样式按归属并入现有三份。

---

## 8. 验证清单

改动完成后，按以下顺序自查：

```bash
npm run build     # 必须通过：先类型检查，再构建
```

构建通过后再人工验证：

| 检查项 | 要点 |
| --- | --- |
| 展示站渲染 | `#/` 各区块内容正确，无空值报错 |
| 空态 | 把某一区块的数据清空后，页面显示引导文案而非空白或崩溃 |
| 后台登录 | `#/admin` 可用默认口令进入 |
| 保存与刷新 | 后台改内容 → 保存 → 刷新 → 修改仍在 |
| 未保存提示 | 有未保存修改时刷新页面会触发二次确认 |
| 主题 | 切换深色模式后刷新保持，首屏无闪白 |
| 响应式 | 窄屏（≈375px）下导航折叠为汉堡菜单，无横向溢出 |
| 导入导出 | 导出 `profile.json` → 清空数据 → 导入 → 内容与头像、简历完整还原 |
| 头像 / 简历 | 上传、替换、移除均即时生效 |
| 打印预览 | `Ctrl + P` 时导航与装饰元素被隐藏 |

触达数据模型、存储或部署逻辑的改动，额外验证：

```bash
npm run preview   # 用构建产物跑一遍上面的检查
node scripts/deploy-cloudflare.mjs   # 需要线上验证时再部署
```

---

## 9. 提交与部署

- 提交信息使用**中文**，采用 `类型: 简述` 格式，类型取 `feat` / `fix` / `docs` / `chore` / `refactor` / `style`。

  ```
  feat: 新增「荣誉奖项」展示区块
  fix: 修复深色模式下进度条颜色对比度不足
  docs: 补充 PRD 与 TECH_DESIGN
  ```

- 每次提交应是**一个完整可构建的状态**，不要把类型检查不通过的代码推进仓库。
- 推送前确认 `npm run build` 通过。
- 部署目标：Cloudflare Pages 项目 `personal-website`，分支 `main`，线上地址 `https://personal-website-bri.pages.dev`。
- 本机网络对 `api.cloudflare.com`（IPv6）与 `github.com` 的连接不稳定，推送或部署失败时**先重试**；部署优先使用 `scripts/deploy-cloudflare.mjs`（已强制 IPv4 并带重试）。
