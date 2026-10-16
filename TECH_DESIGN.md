# TECH_DESIGN · 个人展示网站

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.0 |
| 对应产品版本 | v1.0 |
| 更新日期 | 2026-10-16 |
| 线上地址 | https://personal-website-bri.pages.dev |
| 代码仓库 | https://github.com/yyx20050813/personal-website |

---

## 1. 设计目标与取舍

| 目标 | 设计选择 | 代价 |
| --- | --- | --- |
| 零后端、零运维 | 纯前端 SPA，数据落在静态文件与浏览器本地 | 没有服务端鉴权，内容完全公开 |
| 非技术人员可维护内容 | 内置浏览器端管理后台，改完即存 | 修改默认只对当前浏览器生效，需导出 JSON 才能发布给所有访客 |
| 部署到任意静态托管 | hash 路由 + `base: './'` 相对路径 | 不参与搜索引擎收录 |
| 不依赖 UI 框架 | 原生 CSS + CSS 变量 | 需要自行维护样式约定 |
| 极小运行时依赖 | 只依赖 `react` 与 `react-dom` | 路由、状态订阅、图标等均需自己实现 |

核心取舍：**用"数据可在三个层级存在"换取"无需服务端也能既本地预览、又对外发布"**，这是整个架构的主线。

---

## 2. 技术选型

| 用途 | 选型 | 版本 | 理由 |
| --- | --- | --- | --- |
| 构建工具 | Vite | 8.3.4 | 冷启动快、原生 ESM、开箱支持 JSON 导入 |
| 框架 | React | 19.3.1 | 组件化 + `useSyncExternalStore` 可直接对接外部 Store |
| 语言 | TypeScript | 7.0.2 | 严格模式约束数据模型 |
| React 插件 | @vitejs/plugin-react | 6.1.2 | JSX 转换与 Fast Refresh |
| 样式 | 原生 CSS + CSS 变量 | — | 无 UI 框架依赖，产物体积可控 |
| 路由 | 自实现 hash 路由 | — | 约 20 行即可满足两页需求，避免引入路由库 |
| 数据存储 | `localStorage` + `IndexedDB` + 静态 JSON | — | 分工见 §5 |
| 图标 | 项目内联 SVG 组件 | — | 无外部字体 / 图标库请求 |
| 托管 | Cloudflare Pages | — | 免费、全球 CDN、支持直传与 Git 集成 |

`package.json` 中 `type: "module"`，构建脚本为 `tsc --noEmit && vite build`，即**类型检查不通过则不会产出构建物**。

---

## 3. 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                         浏览器运行时                          │
│                                                              │
│  index.html  ──►  src/main.tsx                               │
│                   ├─ 渲染占位加载态（避免首屏闪白 / 内容闪烁）  │
│                   ├─ await profileStore.init()   ← 读数据     │
│                   └─ await initFiles()           ← 读本机文件  │
│                              │                               │
│                              ▼                               │
│                       src/App.tsx（useRoute 分发）            │
│                    ┌─────────┴─────────┐                     │
│                    ▼                   ▼                     │
│              SiteApp（展示站）     AdminApp（管理后台）        │
│                    │                   │                     │
│   ┌────────────────┴───────┐   ┌───────┴──────────────────┐  │
│   │ Hero + 7 个 Section    │   │ Login + 12 个编辑面板     │  │
│   │ useAvatar / useResume  │   │ 草稿 editing → save()    │  │
│   └────────────────────────┘   └──────────────────────────┘  │
│                    │                   │                     │
│                    └─────────┬─────────┘                     │
│                              ▼                               │
│      ┌───────────────┬───────────────┬────────────────┐      │
│      │ profileStore  │  fileStore    │  auth          │      │
│      │  (数据源·三层) │ (IndexedDB)   │ (口令·会话)     │      │
│      └───────────────┴───────────────┴────────────────┘      │
└──────────────────────────────────────────────────────────────┘
                               │
                    构建产出 dist/ ──► Cloudflare Pages CDN
```

关键点：**数据与文件在渲染前就绪**。`main.tsx` 先 `await` 两个初始化 Promise，再 `root.render(<App />)`，这样组件内不需要处理"数据还没到"的中间态，从根本上避免了内容闪烁和空值分支。

---

## 4. 目录结构与职责

```
.
├─ index.html                     入口 HTML；内联主题预置脚本（先于 React 设置 data-theme）
├─ vite.config.ts                 base './'、outDir 'dist'、assetsDir 'assets'、dev 端口 5173
├─ tsconfig.json                  严格模式；target ES2022；jsx react-jsx；noEmit
├─ .node-version                  构建使用 Node 22.12.0（供 Cloudflare Pages 选择版本）
│
├─ public/                        原样拷贝到 dist/，不参与打包
│  ├─ assets/
│  │  ├─ avatar-default.svg       内置默认头像（无头像时的兜底）
│  │  ├─ favicon.svg              站点图标
│  │  └─ resume.pdf               默认简历文件（可在后台替换）
│  ├─ data/profile.json           已发布的静态数据（对所有访客生效）
│  └─ _redirects                  Cloudflare Pages 兜底重写：/* → /index.html 200
│
├─ scripts/
│  └─ deploy-cloudflare.mjs       直传部署脚本（详见 §10.3）
│
└─ src/
   ├─ main.tsx                    启动引导：读数据 → 读文件 → 渲染
   ├─ App.tsx                     hash 路由分发（首页 / 后台）
   ├─ types.ts                    全站数据模型（唯一数据契约来源）
   │
   ├─ data/profile.default.json   打包内置的默认数据（兜底）
   │
   ├─ lib/                        无 UI 的逻辑层
   │  ├─ normalize.ts             数据校验 / 补全 / 空骨架 / 深拷贝
   │  ├─ profileStore.ts          数据源与三层优先级、localStorage 读写、发布键常量
   │  ├─ fileStore.ts             头像与简历的 IndexedDB 文件仓库（含内存降级）
   │  ├─ publish.ts               导出（base64 内嵌）/ 导入
   │  ├─ auth.ts                  口令哈希、登录态
   │  ├─ hooks.ts                 useProfile / useFiles / useTheme / 滚动动画 / 滚动高亮 / 轻提示
   │  ├─ router.ts                极简 hash 路由
   │  └─ utils.ts                 id 生成、列表增删改排序、字节与日期格式化、下载、base64 互转
   │
   ├─ site/                       展示站组件
   │  ├─ SiteApp.tsx              导航、区块编排、页脚（NAV_SECTIONS 定义在此）
   │  ├─ Hero.tsx                 首屏
   │  ├─ sections.tsx             7 个区块 + heroStats 派生逻辑
   │  ├─ useAssets.ts             头像 / 简历的优先级解析
   │  └─ icons.tsx                内联 SVG 图标与 contactIcon 映射
   │
   ├─ admin/                      管理后台
   │  ├─ AdminApp.tsx             登录门禁、草稿状态、12 个 Tab 定义
   │  ├─ Login.tsx                口令登录页
   │  ├─ fields.tsx               通用表单组件（Panel / TextField / ListEditor 等）
   │  └─ panels/                  12 个功能面板
   │     ├─ BasicPanel.tsx        基本信息 + 网站设置
   │     ├─ ListsPanels.tsx       教育背景 / 技能 / 项目 / 竞赛 / 校园 / 优势 / 联系方式
   │     ├─ FilesPanel.tsx        头像与简历
   │     ├─ DataPanel.tsx         导出 / 导入 / 重置 / 发布指引
   │     └─ SecurityPanel.tsx     后台口令与安全边界说明
   │
   ├─ components/Toaster.tsx      全局轻提示容器
   └─ styles/                     base.css / site.css / admin.css
```

依赖方向是**单向**的：`site/` 与 `admin/` 依赖 `lib/` 与 `types.ts`，`lib/` 之间只允许 `normalize` ← `profileStore` ← `publish` 这一条链路，不存在循环依赖。

---

## 5. 数据设计

### 5.1 数据模型

数据根对象 `Profile` 定义在 `src/types.ts`，是前后端（此处即"运行时与静态文件"）唯一契约。结构概览：

```ts
interface Profile {
  version: number
  updatedAt: string
  meta: ProfileMeta        // siteTitle / navBrand / tagline / footer
  basic: BasicInfo         // 个人信息 + avatarDataUrl + summary
  education: Education[]   // 含 courses[] / honors[]
  skills: SkillGroup[]     // 分组 → items[]（name / level 0-100 / note）
  projects: Project[]      // 含 tech[] / highlights[]
  awards: Award[]          // year / name / track / level / rank / description
  campus: CampusExperience[]  // org / role / start / end / points[]
  advantages: Advantage[]  // title / detail
  contacts: Contact[]      // type / label / value / href
  resume: ResumeFile | null   // fileName / mimeType / url / size
}
```

所有列表项都带 `id`（由 `uid(prefix)` 生成，形如 `prj-<base36 时间>-<随机>`），保证增删改与排序时引用稳定。

### 5.2 三层数据源与优先级

```
优先级高 ┌────────────────────────────────────────────┐
        │ 1. 本机修改  localStorage['showcase.profile.v1'] │  ← 后台「保存」写入
        ├────────────────────────────────────────────┤
        │ 2. 已发布静态数据  dist/data/profile.json       │  ← 覆盖 public/data/ 后重新构建
        ├────────────────────────────────────────────┤
        │ 3. 打包内置数据  src/data/profile.default.json  │  ← 兜底
优先级低 └────────────────────────────────────────────┘
```

`profileStore.init()` 的执行顺序：

1. `fetch(staticProfileUrl(), { cache: 'no-cache' })` 读取已发布数据；失败则回落到内置数据（`file://` 直开时浏览器会拦截 `fetch`，此处静默忽略，是有意设计）。
2. 读取 `localStorage`；存在则用 `normalizeProfile(local, published)` 归一化，并把数据源标记为 `local`。
3. 把就绪标记置真并通知订阅者。

数据源枚举 `ProfileSource = 'local' | 'static' | 'builtin'`，在后台「数据管理」面板中直接展示给用户，让当前生效的层级一目了然。

### 5.3 ProfileStore 的写操作语义

| 方法 | 作用 | 是否落盘 | 典型调用点 |
| --- | --- | --- | --- |
| `save(profile)` | 归一化 → 写入 `localStorage` → 更新快照 | 是 | 后台「保存」/ `Ctrl + S` |
| `preview(profile)` | 只更新内存快照 | 否 | 预留的实时预览能力 |
| `clearLocal()` | 移除 `localStorage` 键 → 回到已发布基线 | 是（删除） | 「丢弃本机修改」 |
| `adopt(raw)` | 归一化后替换快照 | 否 | 导入 JSON / 载入内置数据 |
| `draft()` | 深拷贝当前快照 | 否 | 后台初始化编辑草稿 |

`save()` 会在写入前把 `updatedAt` 刷成当前时间；若浏览器拒绝写入（隐私模式 / 配额不足），返回 `{ persisted: false }`，后台据此弹出明确的错误提示，而不是静默失败。

### 5.4 状态订阅机制

Store 采用**外部 Store + `useSyncExternalStore`** 模式，不引入 Redux / Zustand：

- `profileStore`、`fileStore`、`toast` 三者都是模块级单例，各自维护 `Set<listener>`。
- 对外暴露 `subscribe` / `getSnapshot`，正好匹配 `useSyncExternalStore` 的签名，因此任何一处 `emit()` 都会触发所有订阅组件重渲染，天然做到"后台保存、前台立即同步"。
- 组件侧只通过 `useProfile()` / `useProfileSource()` / `useFiles()` / `useToasts()` 这些 hook 访问，不直接接触单例，便于将来替换实现。

---

## 6. 文件存储设计（IndexedDB）

头像与简历的**原始文件**不放在 `localStorage`（5 MB 上限），而是存入 IndexedDB：

| 项 | 值 |
| --- | --- |
| 数据库名 | `showcase-files` |
| 对象仓库 | `profile-files` |
| 版本 | 1 |
| 主键 | `keyPath: 'key'`（取值 `'avatar'` \| `'resume'`） |
| 记录结构 | `{ key, name, type, size, blob }` |

设计要点：

1. **内存降级**：若 `indexedDB` 不存在、打开失败或事务异常，置 `idbBroken = true` 并改用模块内 `Map<FileKey, RawRecord>`。此时上传仍可用，只是刷新页面后丢失——对应"无痕模式"场景。
2. **object URL 生命周期**：每次 `loadInto()` 都先 `URL.revokeObjectURL(previous.url)` 再创建新的，避免内存泄漏；移除文件时同样回收。
3. **对外只暴露带 `url` 的 `StoredFile`**，组件拿到的 `url` 可直接塞进 `<img src>` 或 `<a href download>`。

读取时的"三层兜底"由 `useAssets.ts` 实现：

```
头像：本机 IndexedDB 文件  →  profile.basic.avatarDataUrl  →  assets/avatar-default.svg
简历：本机 IndexedDB 文件  →  profile.resume.url（静态路径或 base64）  →  null（按钮降级为「上传简历」）
```

---

## 7. 路由与视图分发

`src/lib/router.ts` 的约定：

- `#/xxx` 视为路由；`#xxx`（不带斜杠）视为首页内的锚点，始终解析为 `/`。
- `useRoute()` 监听 `hashchange`，是"外部事件 → React state"的薄封装。
- `navigate(path)` 只是给 `location.hash` 赋值。

`App.tsx` 据此分发：`route === '/admin'` 渲染 `AdminApp`，否则渲染 `SiteApp`；并在路由变化时把滚动位置重置到顶部。

选择 hash 路由而非 History API 的收益：静态托管无需配置 URL 重写即可支持刷新与直达（`public/_redirects` 只是锦上添花的兜底）；产物也能直接以 `file://` 打开。

---

## 8. 认证设计

纯前端项目没有可信的鉴权边界，因此设计目标被明确限定为**防误入、防误改**：

| 项 | 设计 |
| --- | --- |
| 默认口令 | `admin123` |
| 哈希算法 | 优先 Web Crypto `SHA-256`，存为 `sha256:<hex>` |
| 降级算法 | 非安全上下文（如 `file://`）下 `crypto.subtle` 不可用，退化为内置双通道 FNV 式哈希，存为 `fnv:<hex>` |
| 存储位置 | `localStorage['showcase.auth.v1']`，结构 `{ hash, updatedAt, tip }` |
| 登录态 | `sessionStorage['showcase.session.v1'] = '1'`，关闭标签页即失效 |
| 忘记口令 | 清除本机口令记录，回到默认口令 |
| 明文口令 | 不落盘、不进仓库、不随导出的 JSON 外泄 |

> 安全声明：口令只是软门槛。任何访客都能通过开发者工具读取 `localStorage` 与源码，站点内容应视为完全公开。该结论同时写在 `SecurityPanel` 与 README 中，属于**有意公开的限制说明**。

---

## 9. 数据归一化（容错层）

`src/lib/normalize.ts` 是数据进入系统的唯一入口，职责是"把任意可能残缺、可能来自旧版本的输入，整理成结构完整、类型正确的 `Profile`"。

机制：

1. **类型守卫**：`isObject` / `str` / `num` / `list` / `strList` / `objects` 六个小工具，把 `unknown` 收敛到确定类型；数字字段经 `clamp` 限制范围（如技能掌握度夹取到 0–100）。
2. **两段式 fallback**：`normalizeProfile(raw, fallback)` 中，某字段存在就归一化该字段，不存在就回落到 `fallback` 的同名字段。因此"某一节整体缺失"会回退到默认内容，而**不会**把页面清空。
3. **空骨架**：`emptyProfile` 提供结构完整、内容为空的兜底对象；`builtinProfile` 由 `src/data/profile.default.json` 经同一套归一化生成，保证内置数据与运行时数据同构。
4. **id 补齐**：缺失 `id` 的列表项由 `uid(prefix)` 现场生成，避免 React key 冲突。
5. **深拷贝**：`cloneProfile` 用 JSON 往返实现，确保后台的草稿编辑不会污染已保存的数据。

修改数据模型时，**必须"三处同步"**：`types.ts` 加字段 → `normalize.ts` 补归一化 → `profile.default.json` 与 `public/data/profile.json` 补默认值。

---

## 10. 构建与部署

### 10.1 构建

```bash
npm install
npm run dev        # 本地开发，http://localhost:5173（自动打开浏览器）
npm run build      # tsc --noEmit && vite build → dist/
npm run preview    # 预览构建产物
npm run typecheck  # 仅类型检查
```

`vite.config.ts` 中 `base: './'` 是关键：产物使用相对路径引用资源，因此既能部署在域名根目录，也能放在 `用户名.github.io/仓库名/` 这类子路径下正常工作。

产物构成（约）：

```
dist/index.html                    1.0 KB
dist/assets/index-*.css           31.9 KB
dist/assets/index-*.js           301.7 KB
dist/assets/{avatar-default,favicon}.svg
dist/assets/resume.pdf
dist/data/profile.json
dist/_redirects
```

### 10.2 部署到 Cloudflare Pages

**方式一：Git 集成（推荐，push 即自动部署）**

在 Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git 中选择本仓库，构建配置：

| 配置项 | 值 |
| --- | --- |
| Framework preset | Vite（或 None） |
| Build command | `npm run build` |
| Build output directory | `dist` |
| 环境变量 | `NODE_VERSION = 22.12.0` |

**方式二：命令行直传**

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name=personal-website
```

**方式三：仓库内直传脚本**

```bash
node scripts/deploy-cloudflare.mjs
node scripts/deploy-cloudflare.mjs --project personal-website --branch main --dir dist
```

### 10.3 直传脚本 `scripts/deploy-cloudflare.mjs` 的设计

该脚本直接调用 Cloudflare Pages 的直传部署 API（`POST /client/v4/accounts/:id/pages/projects/:name/deployments`，`multipart/form-data`），而非调用 wrangler 命令，原因与实现要点：

1. **强制 IPv4 解析**。本机网络环境下 `api.cloudflare.com` 的 IPv6 记录不可达，wrangler 会报 `UND_ERR_CONNECT_TIMEOUT`。脚本通过给 `https.request` 注入自定义 `lookup`，把 DNS 解析限制为 IPv4。

   > 注意：该 `lookup` 必须**原样透传调用方传入的 `options`**（尤其是 `all`）。Node 20+ 默认启用 `autoSelectFamily`（Happy Eyeballs），会以 `all: true` 调用 `lookup` 并期望得到地址数组；若强行改成 `all: false` 返回裸字符串，会抛 `ERR_INVALID_IP_ADDRESS: Invalid IP address: undefined`。

2. **带重试的请求**：默认 4 次指数退避重试，应对这类网络下的连接重置。
3. **凭据解析顺序**：环境变量 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`（推荐，长期有效）→ wrangler 的 OAuth 配置（`wrangler login` 后生成，约 1 小时过期，脚本会检查 `expiration_time`）。
4. **上传内容**：遍历 `dist` 计算每个文件的 SHA-256，组装 `manifest`（`{ "/path": hash }`）与同名 multipart 分段，并把 git 的 `HEAD` 哈希与提交信息作为部署元数据一并上报。
5. **`_redirects` 由 Pages 单独处理**：`wrangler pages deploy` 会把 `_redirects` 作为项目级配置单独上传，而不是当作普通静态资源。

### 10.4 部署注意事项

- 账号 ID 与项目名为 `personal-website`，线上域名为 `https://personal-website-bri.pages.dev`。
- `public/_redirects` 内容为 `/*  /index.html  200`，用于把未匹配路径兜底重写到首页，避免手输路径时出现 404。
- 新建 Pages 项目后，`*.pages.dev` 子域可能有一段时间返回 500（DNS 与边缘配置尚未就绪），稍后自行恢复；若持续 500，需先排查是否 Cloudflare 侧的故障（对照 Cloudflare 状态页与另建空白项目的表现）。

---

## 11. 样式与主题

| 文件 | 职责 |
| --- | --- |
| `styles/base.css` | 设计变量（颜色、圆角、阴影、间距）、重置规则、通用组件（按钮、卡片、chip、输入框）、轻提示、打印样式 |
| `styles/site.css` | 展示站：导航、首屏、各区块、时间轴、进度条、响应式断点、动画 |
| `styles/admin.css` | 管理后台：侧边栏、编辑面板、表单、上传区、统计卡片、登录页 |

主题机制：

1. 颜色统一用 CSS 变量声明在 `:root`，深色主题覆盖在 `[data-theme='dark']`。
2. `index.html` 内联一段**先于 React 执行**的脚本：读 `localStorage['showcase.theme.v1']`，没有则读 `prefers-color-scheme`，立即写到 `<html data-theme>`。这消除了首屏闪白。
3. `useTheme()` 负责后续的切换与持久化。
4. 滚动进场动画依赖 `.reveal` / `.is-visible` 两个类，由 `useRevealOnScroll()` 用 `IntersectionObserver` 统一驱动；不支持该 API 时一次性全部置为可见。

---

## 12. 已知限制与权衡

| 限制 | 原因 | 影响 / 缓解 |
| --- | --- | --- |
| 后台修改默认只对本机生效 | 数据写入 `localStorage` | 需导出 `profile.json` 覆盖 `public/data/` 后重新构建才能发布给所有访客 |
| 口令不构成安全边界 | 纯前端无服务端校验 | 站点内容应视为公开；面板内已明确提示 |
| 导出 JSON 体积偏大 | 头像与简历以 base64 内嵌（约为原文件的 1.37 倍） | 超过约 2 MB 时建议把文件放进 `public/assets/`，数据内改用静态路径 |
| 换设备不会自动同步 | 无后端 | 通过导出 / 导入 JSON 手动迁移 |
| 不支持 SEO 收录 | hash 路由 + 客户端渲染 | 定位为"投递时主动分享的链接"，不依赖搜索流量 |
| 无自动化测试 | 项目规模小、以 UI 与本地数据为主 | 依赖 `tsc --noEmit` 保证类型安全 + 人工验证清单（见 `AGENTS.md`） |

---

## 13. 扩展点

若后续需要演进，以下位置的改动成本最低：

| 需求 | 改动位置 |
| --- | --- |
| 接入 Git 自动部署 | 无需改代码，在 Cloudflare Dashboard 连接仓库即可 |
| 绑定自定义域名 | 在 Pages 项目的 Custom domains 中添加 |
| 新增一个展示区块 | `types.ts` 加类型 → `normalize.ts` 加归一化 → `sections.tsx` 加组件 → `SiteApp.tsx` 的 `NAV_SECTIONS` 与 `<main>` 中登记 → `admin/panels/` 加编辑面板 → `AdminApp.tsx` 的 `tabs` 中登记 |
| 新增联系方式类型 | `types.ts` 的 `Contact.type` 注释 → `site/icons.tsx` 的 `contactIcon` 映射 |
| 接入真实后端 | 替换 `profileStore` 内部实现即可，组件与 hook 层无需改动 |
