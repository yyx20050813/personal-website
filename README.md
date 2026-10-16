# 个人展示网站

一个**纯前端**的个人主页项目：展示个人信息、教育背景、技能、项目经历、竞赛与校园经历，并自带一个**本地管理后台**用于修改内容、上传头像与简历。所有数据保存在静态本地文件中，不需要任何服务端。

线上效果即本仓库构建产物，构建完成后可直接部署到 Cloudflare Pages / GitHub Pages / 任意静态服务器。

---

## 功能特性

**展示站（首页）**

- 首屏：头像、姓名、身份标签、院校年级、GPA 与排名统计、简历下载、联系方式
- 关于我：基本信息表 + 个人优势卡片
- 教育背景：学校、GPA、专业排名、英语能力、主修课程标签、荣誉列表
- 技能展示：按分组渲染卡片，每项技能带 0-100 掌握程度进度条
- 项目经历：卡片式布局，技术标签 + 工作要点
- 竞赛经历 / 校园经历：时间轴样式
- 联系方式：邮箱、电话、院校、籍贯，支持一键复制邮箱
- 浅色 / 深色主题切换（跟随系统偏好，可手动切换）
- 滚动进场动画、响应式布局（移动端汉堡菜单）
- 打印友好：`Ctrl + P` 可直接导出简历版式的 PDF

**管理后台（`#/admin`）**

- 口令登录（默认 `admin123`，可在后台修改）
- 12 个编辑面板：基本信息、教育背景、技能、项目、竞赛、校园经历、个人优势、联系方式、头像与简历、网站设置、数据管理、后台设置
- 列表项支持新增、删除、上移下移排序
- 头像与简历拖拽上传、即时预览、随时替换或移除
- 导出 `profile.json`（自动把头像与简历转成 base64 内嵌，自包含可迁移）
- 导入 JSON 覆盖数据、丢弃本机修改、恢复内置示例数据
- `Ctrl + S` 保存，未保存时离开页面会二次确认

---

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 构建 | Vite 8 |
| 框架 | React 19 + TypeScript（严格模式） |
| 样式 | 原生 CSS + CSS 变量（无 UI 框架依赖） |
| 路由 | 自实现的极简 hash 路由（`#/` 首页，`#/admin` 后台） |
| 数据 | `localStorage` + `IndexedDB` + 静态 `profile.json` |
| 图标 | 项目内联 SVG 组件，无外部字体 / 图标库 |

运行时依赖只有 `react` 与 `react-dom`，无网络请求、无第三方追踪脚本。

---

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 本地开发，默认 http://localhost:5173
npm run build    # 类型检查 + 生产构建，产物在 dist/
npm run preview  # 预览构建产物
```

要求 Node.js ≥ 20.19 或 ≥ 22.12（仓库内含 `.node-version`，Cloudflare Pages 会按它选择版本）。

---

## 数据是怎么存的

站点读取数据的优先级（从高到低）：

1. **本机修改**：管理后台保存后写入浏览器 `localStorage`（键 `showcase.profile.v1`），只影响当前浏览器。
2. **已发布的静态数据**：`public/data/profile.json` 会被打包到 `dist/data/profile.json`，构建后对所有访客生效。
3. **打包内置数据**：`src/data/profile.default.json`，作为兜底默认值（首次运行时二者内容一致）。

头像与简历的原文件保存在浏览器 **IndexedDB**（数据库 `showcase-files`），避免 `localStorage` 的 5MB 容量限制。导出数据时它们会被转成 base64 写进 `profile.json`，因此导出的文件是自包含的。

另外，头像与简历还有第二层兜底：若数据里的 `basic.avatarDataUrl` / `resume.url` 有值，即使本机没有上传文件也会使用它们；都没有时头像退化为内置默认头像（`public/assets/avatar-default.svg`）。

### 想修改默认展示内容

有两种方式，任选其一：

- **推荐**：进入 `#/admin` → 编辑 → 保存 → 「数据管理」→ 导出 `profile.json` → 覆盖 `public/data/profile.json` → 重新 `npm run build`。
- 直接编辑 `src/data/profile.default.json`（结构一致，注意保留字段名）。若要同时更新已发布数据，请同步覆盖 `public/data/profile.json`。

---

## 管理后台

访问地址：网站地址后加 `#/admin`，例如 `https://example.com/#/admin`。

- 默认口令：`admin123`（首次进入后建议在「后台设置」里修改）
- 忘记口令：登录页点击「忘记口令」即可重置为默认口令

> ⚠️ 纯前端项目没有服务端校验，口令经过哈希后存在本地浏览器，仅用于防止误操作。任何访客都能通过开发者工具查看本地数据与源码，请勿放置身份证号、家庭住址等敏感信息。

---

## 部署

### 方式一：Cloudflare Pages + Git 集成（推荐，推送即自动部署）

1. 把本仓库推送到 GitHub（见下文「上传到 GitHub」）。
2. 打开 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 选择本仓库，构建配置填：

   | 配置项 | 值 |
   | --- | --- |
   | Framework preset | `Vite`（或 None） |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version（环境变量） | `NODE_VERSION = 22.12.0` |

4. 点击 **Save and Deploy**，几十秒后会得到一个 `*.pages.dev` 域名。
5. 之后每次 `git push`，Cloudflare 都会自动重新构建并发布。

### 方式二：Cloudflare Pages + Wrangler 命令行（本地产物直接上传）

```bash
npx wrangler login                                   # 浏览器授权
npm run build                                        # 先构建
npx wrangler pages deploy dist --project-name=personal-showcase
```

也可以直接用 API Token 免交互：

```bash
# PowerShell
$env:CLOUDFLARE_API_TOKEN = "<你的 Token>"
npx wrangler pages deploy dist --project-name=personal-showcase
```

Token 权限只需要 **Account → Cloudflare Pages → Edit**。

### 方式三：其他静态托管

构建产物是纯静态文件且使用相对路径（`base: './'`），所以：

- **GitHub Pages**：把 `dist/` 内容推到 `gh-pages` 分支（或配置 Actions 部署）。因为是 hash 路由，放在 `用户名.github.io/仓库名/` 子路径下也能正常工作，不需要额外配置。
- **本地直接打开**：`npm run build` 后双击 `dist/index.html` 也能看到页面（此时浏览器会拦截 `fetch`，站点自动回退到打包内置数据）。
- **Nginx / 对象存储**：把 `dist/` 上传到网站根目录即可。`public/_redirects` 已为 Cloudflare Pages 配置好兜底重写规则。

---

## 上传到 GitHub

```bash
git init
git add .
git commit -m "feat: 纯前端个人展示网站（含本地管理后台）"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

或者使用 GitHub CLI 一步创建并推送：

```bash
gh repo create personal-showcase --public --source=. --push
```

---

## 目录结构

```
.
├─ index.html                    入口 HTML（含主题预置脚本，避免首屏闪白）
├─ public/
│  ├─ assets/
│  │  ├─ avatar-default.svg      内置默认头像
│  │  ├─ favicon.svg             站点图标
│  │  └─ resume.pdf              默认简历文件（可在后台替换）
│  ├─ data/profile.json          已发布的静态数据
│  └─ _redirects                 Cloudflare Pages 兜底重写规则
├─ src/
│  ├─ main.tsx                   启动：先读数据与文件，再渲染
│  ├─ App.tsx                    hash 路由分发（首页 / 后台）
│  ├─ types.ts                   全站数据模型
│  ├─ data/profile.default.json  打包内置的默认数据
│  ├─ lib/
│  │  ├─ normalize.ts            数据校验与补全（容忍残缺 JSON）
│  │  ├─ profileStore.ts         数据源与优先级、localStorage 读写
│  │  ├─ fileStore.ts            头像 / 简历的 IndexedDB 文件仓库
│  │  ├─ publish.ts              导出、导入
│  │  ├─ auth.ts                 后台口令哈希与登录态
│  │  ├─ hooks.ts                useProfile / useTheme / 滚动动画 / 轻提示
│  │  ├─ router.ts               极简 hash 路由
│  │  └─ utils.ts                列表增删改、字节格式化、下载等工具
│  ├─ site/                      展示站组件（首屏、各区块、图标）
│  ├─ admin/                     管理后台（登录、12 个面板、通用表单组件）
│  ├─ components/Toaster.tsx     全局轻提示
│  └─ styles/                    base / site / admin 三份样式
├─ .node-version                 构建使用的 Node 版本
└─ vite.config.ts
```

---

## 常见问题

**换了电脑 / 换了浏览器，后台的修改不见了？**
数据存在浏览器本地，属于预期行为。请在「数据管理」导出 `profile.json` 后在新环境导入，或者把它发布到 `public/data/`。

**上传头像或简历后刷新页面还在吗？**
在。文件保存在 IndexedDB 中。若浏览器禁用了 IndexedDB（如部分浏览器的无痕模式），则退化为内存存储，刷新后会丢失，此时请用导出功能保存数据。

**导出的 JSON 太大了？**
导出会把头像与简历内嵌为 base64（体积约为原文件的 1.37 倍）。若超过约 2MB，建议把文件放到 `public/assets/` 里，再在「头像与简历」面板中清除内嵌数据、改用静态文件路径。

**为什么口令不能真正保护数据？**
因为这是纯前端站点，没有服务端。口令只用于防止误入和误改，不能作为安全边界。

---

## 许可

个人项目，示例内容与简历信息仅用于本站展示，请勿转载使用。
