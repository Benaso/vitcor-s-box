# Agent.md — Victor's Box 全项目治理文档

> 本文档为 AI 编码助手的系统级上下文。任何 AI 进入本项目前必须阅读此文件，并在修改代码前阅读相关子级 Agent.md。

---

## 1. 项目总体介绍

### 1.1 项目目标

个人网站项目 **Victor's Box**，用于展示个人作品、技术博客、兴趣爱好、成长经历和职业规划。包含一个 AI 交互角色（Qiu/秋）和项目沙箱运行系统。

### 1.2 系统组成

| 组成部分 | 目录 | 职责 |
|---------|------|------|
| Frontend | `/frontend` | SPA 前端应用，UI 渲染、交互、状态管理、API 调用 |
| Backend | `/backend` | REST API 服务、数据库、AI Agent、项目沙箱系统 |
| Docs | `/docs` | 设计文档、API 规范、架构决策记录 |

### 1.3 整体技术架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (SPA)                       │
│  React 18 + Vite + HashRouter + React Context       │
│  Canvas (粒子/知识图谱) + 纯 CSS 像素风              │
└──────────────────────┬──────────────────────────────┘
                       │ fetch /api/*
                       ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (Express 4)                  │
│  TypeScript + ESM | Raw pg (PostgreSQL)              │
│  Multer (文件上传) | Anthropic SDK (AI Agent)        │
│  SandboxPool (进程/容器沙箱)                         │
└──────────────────────┬──────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
   ┌──────────────┐       ┌──────────────┐
   │  PostgreSQL  │       │  MiniMax API │
   │  (数据存储)   │       │  (AI Agent)  │
   └──────────────┘       └──────────────┘
```

### 1.4 技术栈总览

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 | 函数组件 + Hooks |
| 前端构建 | Vite 5 | 开发端口 3000 |
| 前端路由 | React Router v6 (HashRouter) | 静态托管兼容 |
| 前端状态 | React Context | 无第三方状态库 |
| 前端样式 | 纯 CSS (global.css) | 像素风设计系统 |
| 前端国际化 | 自建 i18n (4语言) | 无第三方 i18n 库 |
| 后端框架 | Express 4 | TypeScript + ESM |
| 后端运行时 | Node.js | tsx 开发 / tsc 编译 |
| 数据库 | PostgreSQL | 原始 pg 驱动，无 ORM |
| AI Agent | Anthropic SDK (MiniMax 兼容端点) | 模型: MiniMax-M2.7 |
| 文件上传 | Multer | 50MB 限制 |
| 沙箱 | child_process / Docker | 开发用进程，生产用容器 |
| 包管理 | pnpm (前端) | npm (后端) |
| 部署 | GitHub Pages (前端) | 后端独立部署 |

---

## 2. 分层 Agent.md 机制

```
Agent.md                    ← 你正在这里（根治理文档）
├── frontend/Agent.md       ← 前端局部规则
└── backend/Agent.md        ← 后端局部规则
```

### 2.1 加载优先级

1. AI 进入任意子目录时，**优先读取当前目录的 Agent.md**
2. 子级 Agent.md 规则**优先级高于**根 Agent.md
3. 根 Agent.md 定义全局约束，子级 Agent.md 定义局部约束
4. 若子级规则与根级冲突，**以子级为准**

### 2.2 互索引关系

- 根 Agent.md 引用 → `frontend/Agent.md`、`backend/Agent.md`
- 子级 Agent.md 引用 → 根 Agent.md（获取全局约束）
- 所有 Agent.md 引用 → `/docs`（获取设计文档）

---

## 3. 项目架构详解

### 3.1 前端架构 (SPA)

- **模式**: CSR（客户端渲染）SPA
- **路由**: HashRouter，URL 格式 `/#/path`
- **状态管理**: 4 个 React Context（语言、头像、终端、路由过渡）
- **API 层**: 手写 fetch wrapper（`src/api/client.js`），无第三方请求库
- **Canvas 系统**: 粒子头像（`ParticleBackground.jsx`）、知识图谱（`KnowledgeGraph.jsx`）
- **组件系统**: 全自研像素风组件库（PixelCard、PixelButton、StatusBox 等）
- **样式**: 单体 `global.css`（~3300 行）+ 4 个组件级 CSS 文件

### 3.2 后端架构 (分层单体)

```
src/
├── app.ts              → Express 应用配置（中间件 + 路由挂载）
├── server.ts           → HTTP 服务启动入口
├── config/env.ts       → 环境变量类型化配置
├── db/pool.ts          → PostgreSQL 连接池
├── routes/             → 路由层（HTTP 处理）
│   ├── health.ts       → 健康检查
│   ├── site.ts         → 站点内容
│   ├── graph.ts        → 知识图谱数据
│   ├── agent.ts        → AI Agent (Qiu)
│   └── projects.ts     → 项目 CRUD + 沙箱管理
├── services/           → 业务逻辑层
│   ├── sandbox.ts      → 沙箱池管理（并发控制、空闲回收）
│   ├── processSandbox.ts → 进程沙箱实现
│   ├── dockerSandbox.ts  → Docker 沙箱（未实现）
│   └── projectStorage.ts → 文件存储管理
├── agents/
│   └── qiu.ts          → AI 角色（视觉小说风格聊天 Agent）
└── data/
    └── siteContent.ts  → 站点静态数据（多语言）
```

### 3.3 数据流

```
用户操作 → React 组件 → API Client (fetch) → Vite Proxy (/api) → Express Route
                                                                    ↓
                                                              Service / Agent
                                                                    ↓
                                                          PostgreSQL / 外部 API
```

### 3.4 API 端点总览

| 方法 | 路径 | 职责 |
|------|------|------|
| GET | `/api` | 服务标识 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/site` | 站点内容（i18n） |
| GET | `/api/graph` | 知识图谱节点+关系 |
| GET | `/api/graph/nodes/:id` | 单节点详情 |
| GET | `/api/agent/qiu` | Agent 元信息 |
| POST | `/api/agent/qiu` | 发送聊天消息 |
| GET | `/api/projects` | 项目列表（含媒体） |
| GET | `/api/projects/:id` | 单项目详情 |
| POST | `/api/projects` | 创建项目（multipart） |
| PUT | `/api/projects/:id` | 更新项目（multipart） |
| DELETE | `/api/projects/:id` | 删除项目 |
| POST | `/api/projects/:id/run` | 启动沙箱 |
| POST | `/api/projects/:id/stop` | 停止沙箱 |
| GET | `/api/projects/:id/status` | 沙箱状态+日志 |
| GET | `/api/sandbox/stats` | 沙箱池统计 |

### 3.5 数据库表

| 表名 | 用途 |
|------|------|
| `nodes` | 知识图谱节点（人物/技能/项目/兴趣/地点） |
| `relations` | 知识图谱关系（source→target + 类型） |
| `projects` | 项目信息（名称/描述/仓库/状态/沙箱ID） |
| `project_images` | 项目图片（FK→projects，CASCADE） |
| `project_videos` | 项目视频（FK→projects，CASCADE） |

---

## 4. docs 文档系统

### 4.1 文档目录结构

```
docs/superpowers/
├── specs/                          ← 设计规格文档
│   ├── 2026-05-07-personal-website-design.md      ← 整体架构设计
│   ├── 2026-05-10-code-floating-design.md         ← 代码粒子浮动设计
│   ├── 2026-05-10-agent-panel-design.md           ← Agent 面板设计
│   └── 2026-05-13-project-api-sandbox-design.md   ← 项目 API + 沙箱设计
└── plans/                          ← 实施计划文档
    ├── 2026-05-07-personal-website-implementation.md
    ├── 2026-05-10-code-floating-plan.md
    ├── 2026-05-10-agent-panel-plan.md
    └── 2026-05-13-project-api-sandbox.md
```

### 4.2 文档阅读规则

> **AI 修改代码前，必须先阅读 docs 中相关设计文档。**

- 涉及整体架构 → 读 `personal-website-design.md`
- 涉及粒子/Canvas → 读 `code-floating-design.md`
- 涉及 Agent 面板/终端 → 读 `agent-panel-design.md`
- 涉及项目 CRUD / 沙箱 → 读 `project-api-sandbox-design.md`

### 4.3 设计与实现的已知偏差

> 以下偏差以**当前实际代码**为准，docs 中的原始描述已过时。

| 设计文档描述 | 实际实现 |
|------------|---------|
| 后端使用 Rust + Axum | 实际使用 Express 4 + TypeScript |
| 数据存储使用 JSON 文件 | 实际使用 PostgreSQL |
| 后端端口 8080 | 实际端口 4000 |
| Vite 代理目标 8080 | 实际代理到 4000 |
| Agent 名称为 Marvin | 实际 Agent 名称为 Qiu（秋） |
| 使用 BrowserRouter | 实际使用 HashRouter（静态托管兼容） |

---

## 5. 交流与协作约定

### 5.1 语言

所有沟通使用**中文**。

### 5.2 开发偏好

当用户明确表示"直接开始干，只看效果"时，跳过详细设计文档，直接实现。

---

## 6. AI 行为约束

### 6.1 禁止行为

| 禁止 | 原因 |
|------|------|
| 跨层乱修改（如前端直接操作数据库） | 破坏分层架构 |
| 破坏模块边界（如绕过 Service 直接在 Route 写 SQL） | 破坏职责分离 |
| 引入架构耦合（如前后端共享类型文件） | 前后端独立部署 |
| 跳过已有封装（如不使用 `api/client.js` 直接 fetch） | 违反统一 API 层 |
| 绕过状态管理（如在组件中硬编码数据而不走 Context） | 违反数据流设计 |
| 重复造轮子（如新增第二个 i18n 系统） | 违反 DRY 原则 |
| 引入未经确认的第三方依赖 | 项目遵循极简依赖原则 |
| 在前端包含核心业务逻辑 | 前端仅负责 UI 展示 |

### 6.2 修改前必读清单

AI 在修改代码前**必须**：

1. 阅读相关模块的 Agent.md（根级或子级）
2. 阅读 docs 中相关设计文档
3. 阅读相关目录的现有代码，理解调用链
4. 搜索已有能力（Service / Hook / Component / API），避免重复
5. 理解数据流（数据从哪来、到哪去）

### 6.3 前后端协作约束

- 前端**只能**通过 `/api/*` 与后端通信
- 前端**不允许**直接依赖后端内部实现
- API 变更必须同步更新前端 `api/client.js` 和后端路由
- 新增 API 端点必须遵循现有 RESTful 命名规范

---

## 7. 文档同步规则（强约束）

> **代码变更 == 文档变更**（强制规则）

### 7.1 必须同步的场景

| 代码变更 | 必须同步更新的文档 |
|---------|----------------|
| 新增/修改/删除 API 端点 | docs 中的 API 设计文档 + 本文件 API 端点表 |
| 修改目录结构 | 本文件架构章节 + 对应子级 Agent.md |
| 修改技术栈/依赖 | 本文件技术栈表 + 对应子级 Agent.md |
| 修改数据库 schema | docs 中的数据库设计 + 本文件数据库表 |
| 修改模块职责 | 本文件架构章节 + 对应子级 Agent.md |
| 修改数据流 | docs 中的架构设计 + 本文件数据流 |
| 新增设计/功能 | 在 docs/specs/ 中新建设计文档 |

### 7.2 同步检查

每次代码变更完成后，AI 必须自检：
1. 此变更是否影响了任何文档中描述的行为？
2. 如果是，是否已同步更新相关文档？
3. 本 Agent.md 中的架构描述是否仍然准确？

---

## 8. 开发环境

### 8.1 启动命令

```bash
# 前端开发
cd frontend && pnpm dev          # http://localhost:3000

# 后端开发
cd backend && pnpm dev           # http://localhost:4000

# 后端构建
cd backend && pnpm build && pnpm start
```

### 8.2 环境变量

| 变量 | 位置 | 说明 |
|------|------|------|
| `VITE_API_BASE_URL` | frontend/.env | API 基础地址 |
| `DATABASE_URL` | backend/.env | PostgreSQL 连接串 |
| `PORT` | backend/.env | 后端端口（默认 4000） |
| `CORS_ORIGIN` | backend/.env | CORS 允许的来源 |
| `MINIMAX_API_KEY` | backend/.env | MiniMax API 密钥 |
| `MINIMAX_BASE_URL` | backend/.env | MiniMax API 基础地址 |
| `MINIMAX_MODEL` | backend/.env | AI 模型名称 |
| `SANDBOX_TYPE` | backend/.env | 沙箱类型 (process/docker) |
| `MAX_SANDBOXES` | backend/.env | 最大并发沙箱数 |
| `SANDBOX_IDLE_TIMEOUT` | backend/.env | 沙箱空闲超时(ms) |

### 8.3 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| 桌面 | >= 1024px | 多列布局 |
| 平板 | 768px - 1023px | 单列布局 |
| 手机 | < 768px | 全宽布局 |
