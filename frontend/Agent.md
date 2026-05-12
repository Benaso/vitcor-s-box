# frontend/Agent.md — 前端局部治理文档

> 本文档为 AI 进入 `/frontend` 目录时的局部上下文。本文件规则优先于根 `Agent.md`。

---

## 1. Frontend 职责

### 1.1 核心职责

| 职责 | 实现 |
|------|------|
| UI 渲染 | React 函数组件 + Canvas |
| 页面路由 | React Router v6 HashRouter |
| 状态管理 | React Context (4 个 Context Provider) |
| API 调用 | 手写 fetch wrapper (`src/api/client.js`) |
| 国际化 | 自建 i18n 系统 (4 语言) |
| 视觉效果 | Canvas 粒子系统 + 知识图谱 |
| 组件系统 | 自研像素风组件库 |

### 1.2 职责边界

Frontend **不允许**：
- 直接操作数据库
- 包含核心业务逻辑
- 绕过 `api/client.js` 直接调用后端
- 直接依赖后端内部实现（类型、结构等）

---

## 2. 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | React | 18.2 | 函数组件 + Hooks，无类组件 |
| 构建 | Vite | 5.x | 开发端口 3000 |
| 路由 | react-router-dom | 6.22 | HashRouter（静态托管兼容） |
| 状态 | React Context | 内置 | 无第三方状态库 |
| 样式 | 纯 CSS | - | 单体 global.css + 组件级 CSS |
| 国际化 | 自建 | - | 4 语言 (zh/en/de/ja) |
| 包管理 | pnpm | - | pnpm-lock.yaml |

**极简依赖原则**: 全项目仅 3 个运行时依赖（react, react-dom, react-router-dom）。新增依赖需充分理由。

---

## 3. 目录结构分析

```
frontend/
├── src/
│   ├── main.jsx                     → 入口：挂载 App 到 #root
│   ├── App.jsx                      → 根组件：Provider 嵌套 + 路由表
│   │
│   ├── api/
│   │   └── client.js                → 统一 API 层（所有后端通信入口）
│   │
│   ├── components/
│   │   ├── AvatarRevealContext.jsx   → 头像粒子散开状态管理
│   │   ├── BTTerminalContext.jsx     → 终端面板状态（开/关/停靠位置）
│   │   ├── RouteTransitionContext.jsx → 路由转场动画控制
│   │   ├── Layout.jsx               → 页面骨架（Navbar + Main + Terminal + Footer）
│   │   ├── Navbar.jsx               → 导航栏 + 语言切换
│   │   ├── Footer.jsx               → 页脚
│   │   ├── PixelCard.jsx            → 像素风卡片（内联样式）
│   │   ├── PixelButton.jsx          → 像素风按钮（内联样式，含按下状态）
│   │   ├── SectionTitle.jsx         → 注释风格标题 `// TITLE`
│   │   ├── StatusBox.jsx            → 标签/值状态展示
│   │   ├── PageScaffold.jsx         → 通用内容页框架（eyebrow+title+intro+grid）
│   │   ├── ParticleBackground.jsx   → Canvas 粒子头像 + 代码粒子效果
│   │   ├── KnowledgeGraph.jsx       → Canvas 知识图谱（力导向图）
│   │   ├── BTSplitPanel.jsx         → 可拖拽浮动面板（物理模拟拖拽+惯性+停靠区）
│   │   ├── BTBootSequence.jsx       → Agent 启动动画（逐行打字效果）
│   │   ├── BTGlobalTerminal.jsx     → 聊天终端界面
│   │   ├── TerminalCard.jsx         → 打字效果终端卡片
│   │   └── PixelRouteTransition.jsx → 取景器路由转场动画
│   │
│   ├── pages/
│   │   ├── Home.jsx                 → 首页（粒子头像 + 终端卡片 + Agent 入口）
│   │   ├── About.jsx                → 关于页（知识图谱全屏 Canvas）
│   │   ├── Projects.jsx             → 项目页（胶卷 UI + API 数据）
│   │   ├── Blog.jsx                 → 博客页（PageScaffold）
│   │   └── Hobbies.jsx              → 爱好页（胶卷 UI）
│   │
│   ├── data/
│   │   └── home.json                → 首页静态数据（名称/标题/状态）
│   │
│   ├── i18n/
│   │   ├── LanguageContext.jsx       → 语言 Provider + useLanguage Hook
│   │   └── translations.js          → 翻译字符串（zh/en/de/ja）
│   │
│   └── styles/
│       └── global.css               → 全局样式（~3300 行，像素风设计系统）
│
├── public/
│   ├── images/                      → 静态图片资源
│   └── demo-agent-animation.html    → Agent 动画演示
│
├── static_res/                      → Agent 角色/Qiu 精灵图 + 头像
├── .env                             → VITE_API_BASE_URL
├── vite.config.js                   → Vite 配置（base ./ + proxy）
├── index.html                       → HTML 模板
└── package.json                     → 依赖 + 脚本
```

---

## 4. 架构模式

### 4.1 页面结构

| 路由 | 页面 | 内容 |
|------|------|------|
| `/` | Home | 简介 + 粒子头像 + 核心技能状态卡 + Agent 入口 |
| `/about` | About | 成长经历（知识图谱全屏 Canvas） |
| `/projects` | Projects | 作品展示（胶卷 UI + API 数据 + 沙箱运行） |
| `/blog` | Blog | 碎碎念/博客/日志 |
| `/hobbies` | Hobbies | 个人兴趣（胶卷 UI） |

> 注：原始设计中包含 `/career`（职业规划）路由，当前实现中未包含。

### 4.2 布局原则

- **网格化设计**：CSS Grid 网格布局
- **卡片式组件**：PixelCard 统一包裹内容
- **大量留白**：宽裕的 padding/margin
- **固体阴影**：`4px 4px 0 #2a2a2a` 硬边偏移阴影
- **粗边框**：`4px` 统一边框宽度

### 4.3 SPA (Single Page Application)

- **纯 CSR**：所有页面在客户端渲染，无 SSR/SSG
- **HashRouter**：URL 格式 `/#/path`，兼容 GitHub Pages 静态托管
- **路由转场**：取景器动画遮罩实现页面切换效果

### 4.4 Context + Hook 状态模式

| Context | 管理状态 | Hook | 持久化 |
|---------|---------|------|--------|
| LanguageContext | 当前语言、翻译字典、服务端覆盖 | `useLanguage()` | localStorage |
| AvatarRevealContext | 头像散开状态 | `useAvatarReveal()` | 无 |
| BTTerminalContext | 终端面板开/关、停靠位置 | `useBTTerminal()` | 无 |
| RouteTransitionContext | 路由转场动画状态 | `useRouteTransition()` | 无 |

每个 Context 导出 `use[Name]` Hook，在 Provider 外使用会抛错。

### 4.5 Provider 嵌套顺序 (App.jsx)

```
LanguageProvider          ← 最外层（i18n 需全局可用）
  └─ HashRouter           ← 路由
    └─ RouteTransitionProvider  ← 路由转场
      └─ BTTerminalProvider     ← 终端面板
        └─ AvatarRevealProvider ← 头像状态（最内层）
```

### 4.6 组件设计模式

| 模式 | 说明 |
|------|------|
| 原子化组件 | PixelCard/PixelButton/StatusBox 为最小 UI 单元 |
| 复合组件 | BTSplitPanel 内含 BootSequence + ChatInterface |
| Canvas 组件 | ParticleBackground/KnowledgeGraph 直接操作 Canvas API |
| 内联样式 vs CSS | 部分组件用内联样式(PixelCard/PixelButton)，部分用 CSS 文件(BTSplitPanel/BTGlobalTerminal) |

### 4.7 胶卷 UI 模式

Projects 和 Hobbies 页面共享"胶卷"交互模式：
- 胶卷罐列表 → 点击展开 → 水平滚动的胶片条 → 帧（标题/描述/标签/状态等）
- CSS `clip-path` 实现展开动画

---

## 5. API 层

### 5.1 统一入口

所有后端通信**必须**通过 `src/api/client.js`。禁止在组件中直接使用 `fetch`。

### 5.2 API 函数列表

| 函数 | 端点 | 用途 |
|------|------|------|
| `fetchSiteContent()` | GET `/api/site` | i18n 服务端覆盖 |
| `fetchGraphData()` | GET `/api/graph` | 知识图谱数据 |
| `postQiuMessage(msg, history)` | POST `/api/agent/qiu` | AI 聊天 |
| `fetchProjects()` | GET `/api/projects` | 项目列表 |
| `fetchProject(id)` | GET `/api/projects/:id` | 单项目 |
| `runSandbox(projectId)` | POST `/api/projects/:id/run` | 启动沙箱 |
| `stopSandbox(projectId)` | POST `/api/projects/:id/stop` | 停止沙箱 |
| `fetchSandboxStatus(projectId)` | GET `/api/projects/:id/status` | 沙箱状态 |
| `fetchSandboxStats()` | GET `/api/sandbox/stats` | 沙箱统计 |

### 5.3 新增 API 函数规则

新增后端端点后，必须：
1. 在 `api/client.js` 中添加对应函数
2. 函数返回解析后的 JSON
3. 使用 `getBaseUrl()` 获取 API 基础地址（支持环境变量和代理）

---

## 6. 样式系统

### 6.1 设计语言

**柔和黑白像素风**

| 属性 | 值 |
|------|---|
| 背景色 | `#f5f2eb`（温暖米白） |
| 边框/文字色 | `#2a2a2a`（炭灰） |
| 边框宽度 | `4px` |
| 阴影 | 硬边固体阴影 `4px 4px 0 #2a2a2a` |
| 标题字体 | `'Press Start 2P'`（8-bit 像素风） |
| 正文字体 | `'Courier New'`, monospace |
| 主题色 | 纯黑白灰，无彩色点缀 |

### 6.2 CSS 变量

```css
--color-bg: #f5f2eb;
--color-border: #2a2a2a;
--color-text: #2a2a2a;
--color-text-muted: #666;
--shadow-offset: 4px;
--border-width: 4px;
```

### 6.3 按钮交互规则

- 所有像素风按钮必须有可见的按下状态
- 按下时：移除硬阴影 + 向右下位移 2-3px
- 适用于所有按钮表面（导航、菜单、下拉、语言切换等）
- 使用 pointer events 确保 mouse/touch/pen 行为一致

---

## 7. 国际化 (i18n)

### 7.1 支持语言

| 代码 | 语言 |
|------|------|
| `zh` | 中文 |
| `en` | English |
| `de` | Deutsch |
| `ja` | 日本語 |

### 7.2 使用方式

```jsx
const { t, language, setLanguage } = useLanguage();
// t('nav.home') → 翻译字符串
// language → 当前语言代码
// setLanguage('en') → 切换语言
```

### 7.3 翻译数据流

1. `translations.js` 提供静态回退翻译
2. `LanguageProvider` 在挂载时调用 `fetchSiteContent()` 获取服务端覆盖
3. 服务端翻译深度合并到静态翻译上
4. 切换语言后存入 `localStorage`（key: `myweb-language`）

---

## 8. AI 修改规则

### 8.1 修改前检查清单

1. 是否有现有组件可复用？（检查 `components/` 目录）
2. 是否有现有 Hook 可用？（检查 `useLanguage`、`useAvatarReveal` 等）
3. 是否有现有 API 函数？（检查 `api/client.js`）
4. 是否有现有样式可扩展？（检查 `global.css` 中的相关类）
5. 是否需阅读 docs 中的相关设计？

### 8.2 新增页面规则

新增页面必须：
1. 在 `App.jsx` 路由表中注册
2. 使用 `Layout.jsx` 作为页面骨架
3. 使用 `PageScaffold.jsx` 作为内容框架（如适用）
4. 文案通过 `useLanguage()` + `translations.js` 管理
5. 遵循响应式断点设计

### 8.3 新增组件规则

新增组件必须：
1. 放在 `src/components/` 目录下
2. 遵循像素风设计语言（使用 CSS 变量）
3. 状态通过 Context 管理（不新增第三方状态库）
4. 样式优先使用 `global.css` 中的现有类
5. 如需组件级 CSS，创建同名 `.css` 文件

### 8.4 Canvas 组件规则

修改 Canvas 组件（ParticleBackground / KnowledgeGraph）时：
1. 理解 `requestAnimationFrame` 渲染循环
2. 理解粒子物理系统（速度、阻尼、交互力）
3. 注意 Canvas 尺寸在 resize 时的重建逻辑
4. 性能敏感，避免在渲染循环中创建新对象
