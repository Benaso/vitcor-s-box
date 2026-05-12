# 项目展示 + 沙箱运行：后端接口与数据库设计

## 概述

为项目展示页面（Projects）提供后端 API，支持项目的 CRUD 管理（含多图多视频上传），并为每个项目提供隔离沙箱环境，允许访客在线启动项目 Demo。支持最多约 10+ 个沙箱并发运行。

## 技术决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 文件存储 | 本地文件系统 `backend/uploads/` | 媒体量小（介绍用途），不需要 MinIO/OSS |
| 沙箱隔离（开发） | 子进程 `child_process` | Windows 开发环境，无 Docker |
| 沙箱隔离（生产） | Docker 容器 | Linux 部署，完全隔离 |
| 沙箱调度 | Agent 自动分析 | Agent 读取仓库结构，自行决定依赖安装和启动命令 |
| 并发管理 | 沙箱池 + 空闲回收 | 支持多访客同时查看不同项目 |

## 数据库表

```sql
CREATE TABLE projects (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  repo_url         VARCHAR(1024),
  status           VARCHAR(20) DEFAULT 'idle',  -- idle / cloning / running / error
  sandbox_id       VARCHAR(255),                -- 运行时沙箱实例 ID，idle 时为 NULL
  last_accessed_at TIMESTAMPTZ,                 -- 最后访问时间，用于空闲回收
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_images (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url         VARCHAR(1024) NOT NULL,  -- 相对路径 /uploads/projects/{id}/xxx.png
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_videos (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url         VARCHAR(1024) NOT NULL,  -- 相对路径 /uploads/projects/{id}/xxx.mp4
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

## API 接口

### 项目 CRUD

| 方法 | 路径 | Content-Type | 说明 |
|------|------|-------------|------|
| GET | `/api/projects` | JSON | 获取所有项目（含图片、视频列表） |
| GET | `/api/projects/:id` | JSON | 获取单个项目详情 |
| POST | `/api/projects` | multipart/form-data | 创建项目（字段：name, description, repo_url + 文件：images[], videos[]） |
| PUT | `/api/projects/:id` | multipart/form-data | 更新项目（同上，未传的图片/视频保留） |
| DELETE | `/api/projects/:id` | JSON | 删除项目及关联图片/视频文件 |

### 沙箱操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/projects/:id/run` | 启动沙箱：clone 仓库 → Agent 分析 → 启动运行 |
| POST | `/api/projects/:id/stop` | 停止沙箱 |
| GET | `/api/projects/:id/status` | 查询沙箱运行状态 + 日志 |
| GET | `/api/sandbox/stats` | 沙箱池全局状态（运行数/上限） |

### 静态文件

- 图片：`GET /uploads/projects/:projectId/{filename}`
- 视频：`GET /uploads/projects/:projectId/{filename}`

### 错误响应

| 场景 | HTTP 状态码 | 说明 |
|------|------------|------|
| 沙箱已在运行 | 200 | 返回已有沙箱信息，不重复启动 |
| 并发达到上限 | 429 | `MAX_SANDBOXES` 配置上限，超出拒绝 |
| 项目不存在 | 404 | — |
| 无 repo_url | 400 | 没有 repo_url 的项目无法启动沙箱 |

## 沙箱架构

```
SandboxPool（单例）
├── maxConcurrent: number（默认 15，通过 MAX_SANDBOXES 环境变量配置）
├── idleTimeoutMs: number（默认 30 分钟）
├── instances: Map<sandboxId, SandboxInstance>
│
├── run(project) →
│   1. 检查该项目是否已有运行中沙箱 → 有则直接返回
│   2. 检查并发数是否达到上限 → 达到则 429
│   3. project.status = cloning
│   4. provider.clone(repo_url, sandboxDir)
│   5. Agent 分析仓库结构，返回启动命令
│   6. project.status = running
│   7. provider.start(command)
│   8. 启动空闲回收定时器
│
├── stop(sandboxId) →
│   1. provider.stop()
│   2. 清理沙箱目录
│   3. project.status = idle, sandbox_id = null
│
└── reapIdle() →
    定时扫描，last_accessed_at 超过 idleTimeoutMs 的沙箱自动 stop

SandboxProvider（接口）
├── clone(repoUrl, targetDir): Promise<void>
├── start(cwd, command): Promise<ProcessHandle>
├── stop(): Promise<void>
├── getLogs(): string[]
└── isRunning(): boolean

ProcessSandbox（开发环境）
├── child_process.exec('git clone ...')
├── child_process.spawn(command, { cwd })
├── process.kill() + 目录清理
└── Windows / Linux 通用

DockerSandbox（生产环境）
├── docker run + 容器内 git clone
├── docker exec 启动命令
├── docker stop + docker rm
└── 资源限制：CPU / 内存 / 网络隔离
```

### Agent 参与流程

1. 沙箱 clone 完成后，SandboxPool 调用 Agent
2. Agent 读取项目目录结构（package.json / go.mod / pom.xml / Makefile 等）
3. Agent 返回启动命令（如 `cd backend && go run . & cd frontend && npm run dev`）
4. SandboxPool 将命令交给 Provider 执行

### 环境切换

`.env` 新增：

```
SANDBOX_TYPE=process    # process | docker
MAX_SANDBOXES=15        # 最大并发沙箱数
SANDBOX_IDLE_TIMEOUT=1800000  # 空闲回收时间（ms），默认 30 分钟
```

代码根据 `SANDBOX_TYPE` 加载 `ProcessSandbox` 或 `DockerSandbox` 实现。

## 文件存储结构

```
backend/
├── uploads/
│   └── projects/
│       └── {projectId}/
│           ├── screenshot1.png
│           ├── demo.mp4
│           └── ...
└── sandbox/
    └── {sandboxId}/        # 沙箱工作目录
        └── {repo-name}/    # git clone 的项目代码
```

## 数据流

### 创建项目

```
前端 (multipart) → POST /api/projects
  → 解析文字字段（name, description, repo_url）
  → 保存图片/视频到 uploads/projects/{newId}/
  → 写入 DB（projects + project_images + project_videos）
  → 返回完整项目对象
```

### 启动沙箱

```
前端 → POST /api/projects/:id/run
  → SandboxPool.run(project)
    → 检查并发 + 重复
    → provider.clone(repo_url, sandbox/{uuid}/)
    → Agent 分析 → 得到启动命令
    → provider.start(command)
    → 更新 project.status = running, sandbox_id = uuid
  → 返回沙箱状态
```

### 空闲回收

```
定时器（每 5 分钟）
  → SandboxPool.reapIdle()
    → 遍历 instances，检查 last_accessed_at
    → 超时的调用 stop()
```
