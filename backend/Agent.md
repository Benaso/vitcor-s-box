# backend/Agent.md — 后端局部治理文档

> 本文档为 AI 进入 `/backend` 目录时的局部上下文。本文件规则优先于根 `Agent.md`。

---

## 1. Backend 职责

### 1.1 核心职责

| 职责 | 实现 |
|------|------|
| REST API 服务 | Express 4 路由 |
| 数据库操作 | PostgreSQL (原始 pg 驱动) |
| AI Agent 服务 | Anthropic SDK (MiniMax 兼容端点) |
| 文件上传/存储 | Multer + 本地文件系统 |
| 项目沙箱管理 | SandboxPool + Process/Docker Sandbox |
| 站点内容服务 | 多语言静态数据 |
| 知识图谱数据 | nodes + relations 表查询 |

### 1.2 职责边界

Backend **不允许**：
- 返回前端 UI 逻辑
- 包含 HTML/CSS/JS 渲染逻辑（纯 API 服务）
- 直接操作前端状态

---

## 2. 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 运行时 | Node.js | - | TypeScript + ESM |
| 框架 | Express | 4.18 | 无装饰器、无 DI 框架 |
| 语言 | TypeScript | 5.3 | 严格模式，ES2022 目标 |
| 数据库 | PostgreSQL | - | 原始 pg 驱动，**无 ORM** |
| AI SDK | @anthropic-ai/sdk | 0.95 | 连接 MiniMax 兼容端点 |
| 文件上传 | Multer | 2.1 | multipart/form-data，50MB 限制 |
| CORS | cors | 2.8 | 可配置来源 |
| 环境变量 | dotenv | 16.4 | .env 文件加载 |
| 开发工具 | tsx | 4.7 | 热重载开发 |

### 2.1 关键设计决策

- **无 ORM**: 所有 SQL 为原始参数化查询（`$1`, `$2` 等），通过 `pg.Pool` 执行
- **无认证中间件**: 当前所有端点公开访问
- **无输入验证库**: 手动验证（如 `if (!name)`）
- **无日志框架**: 使用 `console.log` / `console.error`
- **无迁移工具**: schema 由 `scripts/` 下的初始化脚本管理

---

## 3. 架构分析

### 3.1 分层架构

```
Express App (app.ts)
    │
    ├── 中间件栈
    │   ├── cors()
    │   ├── express.json()
    │   └── express.static('/uploads')
    │
    ├── 路由层 (routes/)
    │   └── 职责：HTTP 请求处理、参数提取、响应格式化
    │
    ├── 服务层 (services/)
    │   └── 职责：业务逻辑、沙箱管理、文件操作
    │
    ├── Agent 层 (agents/)
    │   └── 职责：AI 角色定义、LLM 交互
    │
    ├── 数据层 (data/)
    │   └── 职责：静态站点数据、多语言内容
    │
    └── 数据库层 (db/)
        └── 职责：PostgreSQL 连接池管理
```

### 3.2 模块依赖关系

```
routes/ → services/ → db/
routes/ → agents/   → (外部 API: MiniMax)
routes/ → data/
app.ts  → routes/
app.ts  → services/sandbox.ts (启动空闲回收)
```

---

## 4. 目录结构分析

```
backend/
├── src/
│   ├── app.ts                      → Express 应用配置
│   │                                  中间件注册、路由挂载、静态文件服务
│   │                                  内联: GET /api, GET /api/sandbox/stats
│   │
│   ├── server.ts                   → HTTP 启动入口 (app.listen)
│   │
│   ├── config/
│   │   └── env.ts                  → 环境变量类型化导出
│   │                                  读取 .env 并提供默认值
│   │
│   ├── db/
│   │   └── pool.ts                 → PostgreSQL 连接池
│   │                                  export pool | null
│   │                                  checkDatabase() → SELECT 1
│   │
│   ├── routes/
│   │   ├── health.ts               → GET /api/health (DB 连通性检查)
│   │   ├── site.ts                 → GET /api/site (站点静态数据)
│   │   ├── graph.ts                → GET /api/graph (+ nodes/:id)
│   │   ├── agent.ts                → Qiu Agent 路由 (GET 元信息 + POST 聊天)
│   │   └── projects.ts             → 项目 CRUD + 沙箱控制 (最复杂路由)
│   │
│   ├── services/
│   │   ├── sandbox.ts              → SandboxPool (并发管理、空闲回收)
│   │   │                              SandboxProvider 接口定义
│   │   │                              动态加载 process/docker 实现
│   │   ├── processSandbox.ts       → 进程沙箱 (child_process)
│   │   │                              git clone + spawn 启动
│   │   │                              Windows/Linux 兼容
│   │   ├── dockerSandbox.ts        → Docker 沙箱 (未实现，全部 throw)
│   │   └── projectStorage.ts       → 文件系统操作
│   │                                  uploads/projects/{id}/
│   │                                  sandbox/{sandboxId}/
│   │
│   ├── agents/
│   │   └── qiu.ts                  → Qiu AI Agent
│   │                                  视觉小说风格角色
│   │                                  MiniMax-M2.7 模型
│   │                                  温度 0.7, max_tokens 700
│   │                                  最近 10 条对话历史
│   │
│   └── data/
│       └── siteContent.ts          → 硬编码站点数据
│                                      多语言 (ZH/EN/DE/JA)
│                                      仅 EN 有完整内容
│
├── scripts/
│   ├── init-graph.ts               → 创建 nodes/relations 表 + 种子数据
│   └── init-projects.ts            → 创建 projects/images/videos 表
│
├── uploads/                        → 文件上传目录
│   └── tmp/                        → Multer 临时目录
│
├── dist/                           → 编译输出 (tsc)
├── .env                            → 环境变量
├── package.json                    → 依赖 + 脚本
└── tsconfig.json                   → TypeScript 配置
```

---

## 5. 数据库详解

### 5.1 连接管理

- `db/pool.ts` 创建 `pg.Pool`，从 `DATABASE_URL` 环境变量读取连接串
- 若未配置 `DATABASE_URL`，pool 导出 `null`（部分功能降级）
- 无连接池配置调优（使用 pg 默认值）

### 5.2 表结构

#### nodes 表（知识图谱节点）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 自增 ID |
| name | VARCHAR | 节点名称 |
| type | VARCHAR | 节点类型（person/skill/project/interest/location） |
| description | TEXT | 节点描述 |
| properties | JSONB | 扩展属性 |
| created_at | TIMESTAMP | 创建时间 |

#### relations 表（知识图谱关系）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 自增 ID |
| source_id | INTEGER FK→nodes | 起始节点 |
| target_id | INTEGER FK→nodes | 目标节点 |
| relation_type | VARCHAR | 关系类型 |
| properties | JSONB | 扩展属性 |
| created_at | TIMESTAMP | 创建时间 |

#### projects 表（项目）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 自增 ID |
| name | VARCHAR NOT NULL | 项目名称 |
| description | TEXT | 项目描述 |
| repo_url | VARCHAR | 仓库地址 |
| status | VARCHAR DEFAULT 'idle' | 状态: idle/cloning/running/error |
| sandbox_id | VARCHAR | 沙箱实例 ID |
| last_accessed_at | TIMESTAMP | 最后访问时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### project_images / project_videos 表

| 列名 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 自增 ID |
| project_id | INTEGER FK→projects CASCADE | 所属项目（级联删除） |
| url | VARCHAR | 文件路径 |
| sort_order | INTEGER | 排序 |
| created_at | TIMESTAMP | 创建时间 |

### 5.3 SQL 使用规范

- **必须使用参数化查询**：`pool.query('SELECT * FROM projects WHERE id = $1', [id])`
- 禁止字符串拼接 SQL
- 禁止引入 ORM（项目明确使用原始 SQL）

---

## 6. 沙箱系统

### 6.1 架构

```
SandboxPool (sandbox.ts)
├── instances: Map<sandboxId, SandboxInstance>
├── projectMap: Map<projectId, sandboxId>
├── maxConcurrent: 15 (env: MAX_SANDBOXES)
├── idleTimeout: 30min (env: SANDBOX_IDLE_TIMEOUT)
├── reapIdle: 每 5 分钟扫描
│
└── provider: SandboxProvider (动态加载)
    ├── ProcessSandbox (SANDBOX_TYPE=process) ← 当前默认
    └── DockerSandbox (SANDBOX_TYPE=docker)  ← 未实现
```

### 6.2 沙箱生命周期

```
run(projectId)
  → 检查项目存在
  → 检查并发限制
  → clone 仓库到 sandbox/{sandboxId}/
  → Agent 分析项目结构 (askQiu)
  → 返回启动命令
  → spawn 子进程执行
  → 更新 project.status = 'running'
  → 返回 sandboxId

stop(projectId)
  → 获取 sandboxId
  → provider.stop() (taskkill / kill)
  → 清理 sandbox 目录
  → 更新 project.status = 'idle'
```

### 6.3 ProcessSandbox 细节

- **clone**: `child_process.exec('git clone ...')`, 120s 超时
- **start**: `child_process.spawn(command)`, Windows 用 `cmd`, Linux 用 `sh`
- **stop**: Windows 用 `taskkill /T /F`, Linux 用 `kill(-pid)`
- **日志**: stdout/stderr 捕获，上限 500 行
- **启动检测**: spawn 后 1s 优雅期检测即时失败

---

## 7. Agent 系统

### 7.1 Qiu Agent (agents/qiu.ts)

| 属性 | 值 |
|------|---|
| 角色名 | Qiu（秋） |
| 风格 | 视觉小说女主角，温暖、善于观察 |
| 模型 | MiniMax-M2.7 |
| 端点 | `https://api.minimaxi.com/anthropic` |
| 认证 | `authToken` 方式（非 `apiKey`） |
| 温度 | 0.7 |
| 最大 Token | 700 |
| 历史长度 | 最近 10 条消息，每条最多 4000 字符 |
| 回复长度 | 2-6 行简短回复 |
| 降级 | 无 API Key 时返回本地预设回复 |

### 7.2 Agent 在沙箱中的角色

`/api/projects/:id/run` 流程中，Agent 负责分析克隆的仓库结构：
1. 读取目录内容（package.json / go.mod / pom.xml / Makefile 等）
2. 判断项目类型和依赖管理
3. 返回单一 shell 命令用于安装+启动

---

## 8. 路由详解

### 8.1 projects 路由（最复杂）

```
GET    /api/projects         → 列表（JOIN images/videos 到 project 对象）
GET    /api/projects/:id     → 单个（同上 JOIN 逻辑）
POST   /api/projects         → 创建（multipart: 字段+文件，multer 50MB）
PUT    /api/projects/:id     → 更新（multipart: 追加新文件）
DELETE /api/projects/:id     → 删除（停止沙箱 + 删除文件 + CASCADE 删媒体）
POST   /api/projects/:id/run → 启动沙箱（clone → agent 分析 → spawn）
POST   /api/projects/:id/stop → 停止沙箱
GET    /api/projects/:id/status → 沙箱状态 + 日志
```

### 8.2 错误响应规范

| 状态码 | 场景 |
|--------|------|
| 200 | 成功 / 沙箱已在运行 |
| 400 | 参数缺失 |
| 404 | 资源不存在 |
| 429 | 沙箱并发数达到上限 |
| 500 | 服务器内部错误 |

---

## 9. AI 修改规则

### 9.1 修改前检查清单

1. 搜索已有 Service 是否提供所需能力
2. 搜索已有路由是否已实现类似端点
3. 搜索已有 SQL 查询模式（参考 `routes/projects.ts`）
4. 检查 `config/env.ts` 是否已定义相关环境变量
5. 阅读 docs 中相关设计文档

### 9.2 新增路由规则

新增路由必须：
1. 在 `src/routes/` 下创建独立文件
2. 在 `src/app.ts` 中注册到 `/api` 前缀下
3. 使用 `pool.query()` 参数化查询
4. 使用 try/catch 包裹，返回合适的 HTTP 状态码
5. 如果涉及文件上传，使用 Multer

### 9.3 新增服务规则

新增 Service 必须：
1. 放在 `src/services/` 目录下
2. 导出明确的函数/类
3. 数据库操作通过 `pool` 参数或直接 import
4. 不在 Service 层处理 HTTP 状态码（那是 Route 层的职责）

### 9.4 层级调用规则

```
允许的调用方向:
  Route → Service → DB
  Route → Agent → (外部 API)
  Route → Data (静态数据)

禁止的调用方向:
  Service → Route   (服务不知道路由)
  DB → Service      (DB 是被动层)
  Agent → Route     (Agent 不知道 HTTP)
```

### 9.5 数据库操作规则

- 所有 SQL 必须使用参数化查询（`$1`, `$2` ...）
- 禁止引入 ORM
- 新增表必须创建对应的 init 脚本（`scripts/` 目录）
- 表结构变更需要同时更新 init 脚本和本文件

### 9.6 沙箱系统修改规则

修改沙箱系统时注意：
- `SandboxPool` 是单例，在 `app.ts` 启动时初始化
- ProcessSandbox 需兼容 Windows（cmd）和 Linux（sh）
- 日志有 500 行上限，不可无限增长
- 空闲回收器每 5 分钟运行，不可随意修改间隔
- DockerSandbox 当前为 stub，完整实现时需在 `dockerSandbox.ts` 中填写

---

## 10. 环境配置

### 10.1 环境变量

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `DATABASE_URL` | 是 | - | PostgreSQL 连接串 |
| `PORT` | 否 | 4000 | 服务端口 |
| `CORS_ORIGIN` | 否 | `http://localhost:3000` | CORS 允许来源 |
| `MINIMAX_API_KEY` | 否* | - | MiniMax API 密钥 |
| `MINIMAX_BASE_URL` | 否 | `https://api.minimaxi.com/anthropic` | API 端点 |
| `MINIMAX_MODEL` | 否 | `MiniMax-M2.7` | AI 模型 |
| `SANDBOX_TYPE` | 否 | `process` | 沙箱类型 |
| `MAX_SANDBOXES` | 否 | 15 | 最大并发沙箱 |
| `SANDBOX_IDLE_TIMEOUT` | 否 | 1800000 (30min) | 空闲超时(ms) |

*无 MINIMAX_API_KEY 时，Qiu Agent 使用本地预设回复降级。

### 10.2 文件存储路径

| 路径 | 用途 |
|------|------|
| `uploads/projects/{projectId}/` | 项目上传的图片/视频 |
| `uploads/tmp/` | Multer 临时文件 |
| `sandbox/{sandboxId}/` | 沙箱工作目录（克隆的仓库） |
