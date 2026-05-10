# 首页 Code 漂浮实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页粒子头像炸开时，渐进出现漂浮的代码字符

**Architecture:** 在现有 ParticleBackground.jsx 的 Canvas 中新增 CodeParticle 类，与头像粒子共存，统一管理漂浮动画

**Tech Stack:** React + Canvas API + requestAnimationFrame

---

### Task 1: 在 ParticleBackground.jsx 中新增 codePool 和 CodeParticle 类

**Files:**
- Modify: `frontend/src/components/ParticleBackground.jsx:1-10`

- [ ] **Step 1: 添加 codePool 常量**

在 `ParticleBackground.jsx` 文件顶部，import 语句之后，添加：

```javascript
const codePool = [
  '{', '}', '[', ']', '(', ')', '<', '>', '/', '*', ';',
  'const', 'let', 'var', 'function', 'if', 'else', 'return',
  '=>', '===', '!==', '&&', '||', '++', '--',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]
```

- [ ] **Step 2: 添加 CodeParticle 类**

在 `Particle` 类之后（约第 133 行），添加：

```javascript
class CodeParticle {
  constructor(x, y, text) {
    this.originX = x
    this.originY = y
    this.x = x
    this.y = y
    this.codeText = text
    this.opacity = 0
    this.maxOpacity = 0.5
    this.floatSpeed = 0.3 + Math.random() * 0.5
    this.amplitude = 20 + Math.random() * 40
    this.phase = Math.random() * Math.PI * 2
    this.size = 14
    this.speedX = 0.2 + Math.random() * 0.3
  }

  update(shouldAppear) {
    if (shouldAppear) {
      this.opacity += (this.maxOpacity - this.opacity) * 0.008
    }

    this.phase += this.floatSpeed * 0.05
    this.y += Math.sin(this.phase) * 0.8
    this.x += Math.cos(this.phase * 0.5) * this.speedX
  }

  draw() {
    if (this.opacity < 0.02) return
    ctx.font = `${this.size}px monospace`
    ctx.fillStyle = `rgba(42, 42, 42, ${this.opacity})`
    ctx.fillText(this.codeText, this.x, this.y)
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/ParticleBackground.jsx
git commit -m "feat: 添加 codePool 常量和 CodeParticle 类"
```

---

### Task 2: 在 draw 循环中集成 code 粒子

**Files:**
- Modify: `frontend/src/components/ParticleBackground.jsx`

- [ ] **Step 1: 在粒子系统初始化位置添加 codeParticles 数组**

在 `particles = []` 初始化之后（约第 160 行），添加：

```javascript
let codeParticles = []
let codeAppearProgress = 0
```

- [ ] **Step 2: 在 loadImage 函数末尾添加 code 粒子初始化**

在 `loadImage` 函数末尾（`particles.push(...)` 循环之后，约第 188 行后），添加：

```javascript
// 初始化 code 粒子
const codeCount = window.innerWidth >= 1024 ? 25 : window.innerWidth >= 768 ? 20 : 15
for (let i = 0; i < codeCount; i++) {
  const text = codePool[Math.floor(Math.random() * codePool.length)]
  const angle = Math.random() * Math.PI * 2
  const distance = 100 + Math.random() * 200
  const startX = centerX + Math.cos(angle) * distance
  const startY = centerY + Math.sin(angle) * distance
  codeParticles.push(new CodeParticle(startX, startY, text))
}
```

- [ ] **Step 3: 在 draw 函数中添加 code 粒子绘制**

在 `particles.forEach` 循环之后（约第 212 行后），添加：

```javascript
// 更新和绘制 code 粒子
const shouldCodeAppear = hasScrolled && typeof titleTop === 'number' && avatarBottom + avatarLayout.disperseTriggerOffset >= titleTop
codeParticles.forEach(cp => {
  cp.update(shouldCodeAppear)
  cp.draw()
})
```

- [ ] **Step 4: 在 handleResize 中添加 code 粒子重置**

在 `handleResize` 函数中，当 `previousMode !== avatarMode` 分支重置 `imageLoaded = false` 之后（约第 242 行），添加：

```javascript
codeParticles = []
```

- [ ] **Step 5: 提交**

```bash
git add frontend/src/components/ParticleBackground.jsx
git commit -m "feat: 集成 code 粒子到绘制循环"
```

---

### Task 3: 验证功能

**Files:**
- Test: 启动开发服务器进行手动验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd frontend && pnpm dev
```

- [ ] **Step 2: 验证动画**

1. 打开首页
2. 滚动页面触发头像炸开
3. 确认 code 字符渐进出现
4. 确认漂浮动画流畅
5. 确认响应式（调整窗口大小）

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/ParticleBackground.jsx
git commit -m "feat: 完成 code 漂浮功能"
```

---

## 验收标准

1. 页面加载时无 code 漂浮
2. 滚动触发头像炸开后，code 字符渐进出现
3. code 字符柔和像素风（灰色调）
4. 漂浮动画流畅，无明显性能问题
5. 响应式：各屏幕尺寸均有合适数量
