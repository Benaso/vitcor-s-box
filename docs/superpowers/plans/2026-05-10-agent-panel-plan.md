# Agent 分屏面板实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现点击"嗨！马文！"后页面分屏，右侧出现带启动序列的 agent 对话面板

**Architecture:** 分屏布局通过 Layout 组件实现，使用 CSS flexbox 和 transitions。启动序列使用独立的动画组件，对话界面复用现有的 BTGlobalTerminal 结构。

**Tech Stack:** React + CSS transitions + CSS animations

---

## 文件结构

```
frontend/src/
├── components/
│   ├── Layout.jsx                    # 修改：支持分屏布局
│   ├── BTGlobalTerminal.jsx          # 重构：移除独立面板逻辑
│   ├── BTBootSequence.jsx           # 新增：启动序列动画组件
│   ├── BTSplitPanel.jsx             # 新增：分屏主容器
│   └── BTTerminalContext.jsx        # 修改：添加分屏状态
├── pages/
│   └── Home.jsx                     # 修改：按钮显示逻辑
└── App.jsx                          # 无需修改
```

---

## Task 1: 创建 BTBootSequence 启动序列组件

**Files:**
- Create: `frontend/src/components/BTBootSequence.jsx`

- [ ] **Step 1: 创建组件文件**

```jsx
import { useEffect, useState } from 'react'

const BOOT_LINES = [
  '> initializing marvin module...',
  '> loading personality matrix...',
  '> establishing neural link...',
  '> calibrating empathic processors...',
  '> BT-7274 protocol online',
  '> Marvin ready.'
]

function BTBootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [visibleLines, onComplete])

  return (
    <div className="bt-boot-sequence">
      {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
        <div key={index} className="bt-boot-sequence__line">
          <span className="bt-boot-sequence__text">{line}</span>
          {index < BOOT_LINES.length - 1 && (
            <span className="bt-boot-sequence__status">[完成]</span>
          )}
        </div>
      ))}
      {visibleLines < BOOT_LINES.length && (
        <span className="bt-boot-sequence__cursor">▋</span>
      )}
    </div>
  )
}

export default BTBootSequence
```

- [ ] **Step 2: 添加样式（内联或 CSS module）**

在组件同目录下创建 `BTBootSequence.css`：

```css
.bt-boot-sequence {
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 2;
  color: #2a2a2a;
}

.bt-boot-sequence__line {
  display: flex;
  gap: 8px;
}

.bt-boot-sequence__text {
  animation: type-in 0.3s ease-out;
}

.bt-boot-sequence__status {
  color: #666;
}

.bt-boot-sequence__cursor {
  animation: blink 0.5s infinite;
}

@keyframes type-in {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/BTBootSequence.jsx frontend/src/components/BTBootSequence.css
git commit -m "feat: 添加启动序列动画组件 BTBootSequence"
```

---

## Task 2: 修改 BTTerminalContext 添加分屏状态

**Files:**
- Modify: `frontend/src/components/BTTerminalContext.jsx`

- [ ] **Step 1: 添加 isSplitMode 状态**

```jsx
const BTTerminalContext = createContext(null)

export function BTTerminalProvider({ children }) {
  const [isBTTerminalEnabled, setIsBTTerminalEnabled] = useState(false)
  const [isBTTerminalOpen, setIsBTTerminalOpen] = useState(false)
  const [isSplitMode, setIsSplitMode] = useState(false)

  const enableBTTerminal = useCallback(() => {
    setIsBTTerminalEnabled(true)
    setIsBTTerminalOpen(true)
    setIsSplitMode(true)
  }, [])

  const closeBTTerminal = useCallback(() => {
    setIsSplitMode(false)
    setTimeout(() => {
      setIsBTTerminalOpen(false)
      setIsBTTerminalEnabled(false)
    }, 300)
  }, [])

  const value = useMemo(() => ({
    closeBTTerminal,
    enableBTTerminal,
    isBTTerminalOpen,
    isBTTerminalEnabled,
    isSplitMode,
    openBTTerminal
  }), [closeBTTerminal, enableBTTerminal, isBTTerminalEnabled, isBTTerminalOpen, isSplitMode, openBTTerminal])

  return (
    <BTTerminalContext.Provider value={value}>
      {children}
    </BTTerminalContext.Provider>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/BTTerminalContext.jsx
git commit -m "feat: BTTerminalContext 添加分屏状态"
```

---

## Task 3: 创建 BTSplitPanel 分屏容器组件

**Files:**
- Create: `frontend/src/components/BTSplitPanel.jsx`

- [ ] **Step 1: 创建分屏容器组件**

```jsx
import { useState } from 'react'
import { useBTTerminal } from './BTTerminalContext'
import BTBootSequence from './BTBootSequence'
import BTGlobalTerminal from './BTGlobalTerminal'

function BTSplitPanel() {
  const { isSplitMode } = useBTTerminal()
  const [showChat, setShowChat] = useState(false)

  if (!isSplitMode) return null

  return (
    <div className="bt-split-panel">
      <div className="bt-split-panel__divider" />
      <div className="bt-split-panel__agent">
        {!showChat ? (
          <BTBootSequence onComplete={() => setShowChat(true)} />
        ) : (
          <BTGlobalTerminal />
        )}
      </div>
    </div>
  )
}

export default BTSplitPanel
```

- [ ] **Step 2: 创建分屏样式**

在 `BTSplitPanel.css` 中：

```css
.bt-split-panel {
  position: fixed;
  top: var(--nav-height, 76px);
  right: 0;
  bottom: 0;
  width: 40%;
  display: flex;
  animation: slide-in 0.3s ease-out;
  z-index: 100;
}

.bt-split-panel__divider {
  width: 4px;
  background: #2a2a2a;
}

.bt-split-panel__agent {
  flex: 1;
  background: #f5f2eb;
  overflow: hidden;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 1023px) {
  .bt-split-panel {
    top: 50%;
    left: 0;
    right: 0;
    width: 100%;
    height: 50%;
    flex-direction: column;
  }

  .bt-split-panel__divider {
    width: 100%;
    height: 4px;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/BTSplitPanel.jsx frontend/src/components/BTSplitPanel.css
git commit -m "feat: 添加分屏容器组件 BTSplitPanel"
```

---

## Task 4: 修改 Layout 支持分屏布局

**Files:**
- Modify: `frontend/src/components/Layout.jsx`

- [ ] **Step 1: 读取当前 Layout 结构**

```jsx
// 当前 Layout 大致结构：
// <div className="layout">
//   <Navbar />
//   <main className="layout__main">{children}</main>
//   <Footer />
//   <BTGlobalTerminal />  // 目前渲染在这里
// </div>
```

- [ ] **Step 2: 修改 Layout 支持分屏**

```jsx
import { useBTTerminal } from './BTTerminalContext'
import BTSplitPanel from './BTSplitPanel'

function Layout({ children }) {
  const { isSplitMode } = useBTTerminal()

  return (
    <div className={`layout ${isSplitMode ? 'layout--split' : ''}`}>
      <Navbar />
      <main className="layout__main">{children}</main>
      <Footer />
      <BTSplitPanel />
    </div>
  )
}
```

- [ ] **Step 3: 添加分屏样式**

```css
.layout--split .layout__main {
  width: 60%;
  transition: width 0.3s ease-out;
}

@media (max-width: 1023px) {
  .layout--split .layout__main {
    width: 100%;
    height: 50%;
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add frontend/src/components/Layout.jsx frontend/src/components/Layout.css
git commit -m "feat: Layout 支持分屏布局"
```

---

## Task 5: 修改 Home 页面按钮显示逻辑

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: 添加按钮显示条件**

Home 页面已经有 `isAvatarRevealed` 状态，按钮应该只在头像炸开后显示：

```jsx
// Home.jsx 中已经有 useAvatarReveal
// 确保按钮在 isAvatarRevealed 为 true 时才显示

const { revealAvatar, isAvatarRevealed } = useAvatarReveal()

// JSX 中：
{isAvatarRevealed && (
  <PixelButton onClick={handleEmbark}>
    {t.home.viewProjects}
  </PixelButton>
)}
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat: Home 页面按钮仅在头像炸开后显示"
```

---

## Task 6: 清理 BTGlobalTerminal 移除独立面板逻辑

**Files:**
- Modify: `frontend/src/components/BTGlobalTerminal.jsx`

- [ ] **Step 1: 简化组件**

移除独立面板的渲染逻辑，仅保留对话界面内容：

```jsx
function BTGlobalTerminal() {
  const { closeBTTerminal } = useBTTerminal()
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)

  // ... handleSubmit 逻辑保持不变

  return (
    <div className="bt-chat-interface">
      <div className="bt-chat-interface__header">
        <span />
        <span />
        <span />
        <strong>marvin.agent</strong>
        <em>LINK: LOCAL MOCK</em>
        <button type="button" onClick={closeBTTerminal}>HIDE</button>
      </div>

      <div className="bt-chat-interface__body">
        {/* 消息列表 */}
        <div className="bt-chat-interface__messages">
          {messages.map((message, index) => (
            <div key={`${message.source}-${index}`} className="bt-chat-interface__message">
              <span>{message.source}</span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        {/* 输入区 */}
        <form className="bt-chat-interface__input" onSubmit={handleSubmit}>
          <label htmlFor="bt-command">$</label>
          <input
            id="bt-command"
            placeholder={isSending ? 'Marvin is thinking...' : 'type a message...'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isSending}
          />
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 添加 bt-chat-interface 样式**

```css
.bt-chat-interface {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f2eb;
}

.bt-chat-interface__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #2a2a2a;
  color: #f5f2eb;
  font-size: 12px;
}

.bt-chat-interface__header button {
  margin-left: auto;
  background: none;
  border: none;
  color: #f5f2eb;
  cursor: pointer;
}

.bt-chat-interface__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bt-chat-interface__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.bt-chat-interface__input {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 2px solid #2a2a2a;
  background: #fff;
}

.bt-chat-interface__input label {
  margin-right: 8px;
}

.bt-chat-interface__input input {
  flex: 1;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 12px;
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/BTGlobalTerminal.jsx frontend/src/components/BTGlobalTerminal.css
git commit -m "refactor: BTGlobalTerminal 简化为对话界面组件"
```

---

## 验收标准

1. 点击"嗨！马文！"按钮后页面分屏（左侧 60%，右侧 40%）
2. 中间有 4px 炭灰色分隔线
3. 面板内显示启动序列，逐行动画
4. 启动完成后切换到对话界面
5. 可发送消息并接收回复
6. 点击关闭按钮后分屏消失，主页恢复全宽
7. 移动端自适应（上下分屏）
