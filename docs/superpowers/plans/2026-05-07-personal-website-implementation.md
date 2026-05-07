# 个人网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 React + Rust 个人网站的基础架构，包含首页和像素风格组件库

**Architecture:** 采用前后端分离架构，前端 React SPA 通过 Vite 构建，后端 Rust Axum 提供 API 服务。数据使用 JSON 文件存储。

**Tech Stack:** React 18 + Vite, React Router v6, Rust + Axum, 纯 CSS

---

## 文件结构

```
myWeb/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/       # 像素风格组件
│   │   ├── pages/            # 页面组件
│   │   ├── styles/           # 全局样式
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── backend/                  # Rust 后端
│   ├── src/
│   │   ├── main.rs
│   │   └── routes.rs
│   └── Cargo.toml
└── data/                     # JSON 数据文件
    ├── profile.json
    ├── projects.json
    ├── blog.json
    ├── career.json
    └── hobbies.json
```

---

## Task 1: 初始化前端项目

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/vite.config.js`
- Create: `frontend/package.json`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/styles/global.css`

- [ ] **Step 1: 创建 frontend/package.json**

```json
{
  "name": "myweb-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: 创建 frontend/vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 3: 创建 frontend/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Moon.DEV</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 frontend/src/main.jsx**

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: 创建 frontend/src/styles/global.css（像素风格全局样式）**

```css
:root {
  --color-bg: #f5f2eb;
  --color-border: #2a2a2a;
  --color-text: #2a2a2a;
  --color-text-muted: #666;
  --shadow-offset: 4px;
  --border-width: 3px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', Consolas, monospace;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 6: 创建 frontend/src/App.jsx**

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 7: 创建 frontend/src/pages/Home.jsx**

```javascript
function Home() {
  return (
    <div style={{ padding: '32px' }}>
      <h1>HELLO WORLD</h1>
    </div>
  )
}

export default Home
```

- [ ] **Step 8: 安装依赖并验证**

```bash
cd frontend && pnpm install && pnpm dev
```

访问 http://localhost:3000 确认页面正常显示

- [ ] **Step 9: 提交代码**

```bash
git add frontend/
git commit -m "feat: 初始化前端项目"
```

---

## Task 2: 创建像素风格组件库

**Files:**
- Create: `frontend/src/components/PixelCard.jsx`
- Create: `frontend/src/components/PixelButton.jsx`
- Create: `frontend/src/components/Navbar.jsx`
- Create: `frontend/src/components/SectionTitle.jsx`
- Create: `frontend/src/components/Footer.jsx`
- Create: `frontend/src/components/StatusBox.jsx`

- [ ] **Step 1: 创建 PixelCard 组件**

```jsx
function PixelCard({ children, style }) {
  return (
    <div
      style={{
        background: '#fff',
        border: 'var(--border-width) solid var(--color-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--color-border)',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export default PixelCard
```

- [ ] **Step 2: 创建 PixelButton 组件**

```jsx
function PixelButton({ children, onClick, variant = 'default' }) {
  const isActive = variant === 'active'

  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? 'var(--color-border)' : '#fff',
        color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
        border: 'var(--border-width) solid var(--color-border)',
        padding: '10px 20px',
        fontFamily: 'inherit',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: isActive ? 'none' : 'var(--shadow-offset) var(--shadow-offset) 0 var(--color-border)',
        transform: isActive ? 'translate(2px, 2px)' : 'none'
      }}
    >
      {children}
    </button>
  )
}

export default PixelButton
```

- [ ] **Step 3: 创建 Navbar 组件**

```jsx
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: 'var(--border-width) solid var(--color-border)'
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}
      >
        MOON.DEV
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/"><PixelButton>首页</PixelButton></Link>
        <Link to="/about"><PixelButton>关于</PixelButton></Link>
        <Link to="/projects"><PixelButton>项目</PixelButton></Link>
        <Link to="/blog"><PixelButton>碎碎念</PixelButton></Link>
      </div>
    </nav>
  )
}

export default Navbar
```

- [ ] **Step 4: 创建 SectionTitle 组件**

```jsx
function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        marginBottom: '12px',
        letterSpacing: '1px',
        fontFamily: 'monospace'
      }}
    >
      // {children}
    </div>
  )
}

export default SectionTitle
```

- [ ] **Step 5: 创建 Footer 组件**

```jsx
function Footer() {
  return (
    <footer
      style={{
        padding: '16px 24px',
        borderTop: 'var(--border-width) solid var(--color-border)',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--color-text-muted)'
      }}
    >
      © 2026 MOON.DEV — BUILD WITH RUST + REACT
    </footer>
  )
}

export default Footer
```

- [ ] **Step 6: 创建 StatusBox 组件**

```jsx
function StatusBox({ label, value }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        padding: '16px',
        border: 'var(--border-width) solid var(--color-border)'
      }}
    >
      <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>
      <span
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          float: 'right',
          color: 'var(--color-text)'
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default StatusBox
```

- [ ] **Step 7: 提交代码**

```bash
git add frontend/src/components/
git commit -m "feat: 添加像素风格组件库"
```

---

## Task 3: 实现首页

**Files:**
- Create: `frontend/src/pages/Home.jsx` (更新)
- Create: `frontend/src/components/Layout.jsx`

- [ ] **Step 1: 创建 Layout 组件**

```jsx
import Navbar from './Navbar'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Navbar />
      <main style={{ flex: 1, padding: '32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
```

- [ ] **Step 2: 更新 App.jsx 使用 Layout**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 3: 实现首页 Home 页面**

```jsx
import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import SectionTitle from '../components/SectionTitle'
import StatusBox from '../components/StatusBox'

function Home() {
  return (
    <div>
      <PixelCard style={{ marginBottom: '24px' }}>
        <SectionTitle>INTRO</SectionTitle>
        <h1
          style={{
            fontFamily: 'monospace',
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}
        >
          HELLO<br />WORLD
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
          全栈开发者<br />
          Rust · React · WebAssembly<br />
          热爱技术与创造
        </p>
        <PixelButton>VIEW PROJECTS ▶</PixelButton>
      </PixelCard>

      <PixelCard>
        <SectionTitle>STATUS</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatusBox label="PROJECTS" value="10+" />
          <StatusBox label="EXPERIENCE" value="5Y" />
          <StatusBox label="STACK" value="RUST/REACT" />
        </div>
      </PixelCard>
    </div>
  )
}

export default Home
```

- [ ] **Step 4: 验证并提交**

访问 http://localhost:3000 确认首页正常显示

```bash
git add frontend/src/
git commit -m "feat: 实现首页"
```

---

## Task 4: 初始化 Rust 后端

**Files:**
- Create: `backend/Cargo.toml`
- Create: `backend/src/main.rs`
- Create: `backend/src/routes.rs`

- [ ] **Step 1: 创建 backend/Cargo.toml**

```toml
[package]
name = "myweb-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower-http = { version = "0.5", features = ["cors"] }
```

- [ ] **Step 2: 创建 backend/src/main.rs**

```rust
mod routes;

use axum::Router;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::permissive();

    let app = Router::new()
        .nest("/api", routes::router())
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

- [ ] **Step 3: 创建 backend/src/routes.rs**

```rust
use axum::{Router, routing::get};
use serde::Serialize;

#[derive(Serialize)]
struct Profile {
    name: String,
    title: String,
    bio: String,
}

#[derive(Serialize)]
struct Status {
    projects: String,
    experience: String,
    stack: String,
}

#[derive(Serialize)]
struct HomeData {
    profile: Profile,
    status: Status,
}

async fn home() -> axum::Json<HomeData> {
    axum::Json(HomeData {
        profile: Profile {
            name: "Moon".to_string(),
            title: "全栈开发者".to_string(),
            bio: "Rust · React · WebAssembly\n热爱技术与创造".to_string(),
        },
        status: Status {
            projects: "10+".to_string(),
            experience: "5Y".to_string(),
            stack: "RUST/REACT".to_string(),
        },
    })
}

pub fn router() -> Router {
    Router::new().route("/home", get(home))
}
```

- [ ] **Step 4: 测试后端**

```bash
cd backend && cargo run
```

确认服务在 http://127.0.0.1:8080 运行

- [ ] **Step 5: 提交代码**

```bash
git add backend/
git commit -m "feat: 初始化 Rust 后端"
```

---

## Task 5: 前后端联调

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: 更新 Home 页面获取后端数据**

```jsx
import { useEffect, useState } from 'react'
import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import SectionTitle from '../components/SectionTitle'
import StatusBox from '../components/StatusBox'

function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <PixelCard style={{ marginBottom: '24px' }}>
        <SectionTitle>INTRO</SectionTitle>
        <h1
          style={{
            fontFamily: 'monospace',
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}
        >
          HELLO<br />WORLD
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
          {data.profile.title}<br />
          {data.profile.bio}
        </p>
        <PixelButton>VIEW PROJECTS ▶</PixelButton>
      </PixelCard>

      <PixelCard>
        <SectionTitle>STATUS</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatusBox label="PROJECTS" value={data.status.projects} />
          <StatusBox label="EXPERIENCE" value={data.status.experience} />
          <StatusBox label="STACK" value={data.status.stack} />
        </div>
      </PixelCard>
    </div>
  )
}

export default Home
```

- [ ] **Step 2: 验证联调**

确保后端运行在 8080 端口，前端运行在 3000 端口
访问 http://localhost:3000 确认数据正常加载

- [ ] **Step 3: 提交代码**

```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat: 首页对接后端 API"
```

---

## 验证检查清单

- [ ] 前端可运行 `pnpm dev`
- [ ] 后端可运行 `cargo run`
- [ ] 首页显示正确
- [ ] 像素风格组件正常渲染
- [ ] 响应式布局在移动端正常

---

**计划完成。**