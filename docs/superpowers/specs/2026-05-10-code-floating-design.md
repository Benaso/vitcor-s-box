# 首页粒子头像炸开后漂浮 Code 设计文档

## 概述

在首页粒子头像炸开时，渐进出现漂浮的代码字符，增强视觉趣味性和个人网站的技术氛围。

## 设计目标

- **时机**：头像炸开时渐进出现
- **内容**：编程符号 + 关键字混合（如 `{ } [ ] ( ) < > / * ; const let function if else return`）
- **风格**：柔和像素风，与现有粒子头像统一
- **性能**：单 Canvas 绘制，流畅动画

## 技术方案

### 架构

在 `ParticleBackground.jsx` 中新增 `CodeParticle` 类，与现有 `Particle` 类共存于同一 Canvas。

### CodeParticle 类

```
- originX, originY：初始位置（头像区域附近）
- x, y：当前位置
- codeText：字符内容（从 codePool 随机选取）
- opacity：透明度（0 ~ 0.6，柔和）
- floatSpeed：漂浮速度（0.3 ~ 0.8）
- amplitude：浮动幅度（20 ~ 60px）
- phase：相位（随机初始相位实现错落感）
```

### codePool 字符池

```js
const codePool = [
  '{', '}', '[', ']', '(', ')', '<', '>', '/', '*', ';',
  'const', 'let', 'var', 'function', 'if', 'else', 'return',
  '=>', '===', '!==', '&&', '||', '++', '--',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]
```

### 出现时机

- `shouldDisperseAvatar` 为 true 时开始计时
- 渐进 opacity 从 0 增长到 0.5（每帧 +0.008）
- 最大数量：桌面 25 个，平板 20 个，手机 15 个
- 字符大小：14px（等宽字体）

### 漂浮行为

- 正弦波上下浮动：`y += sin(phase) * 0.02`
- 水平缓慢漂移：`x += cos(phase * 0.5) * 0.3`
- phase 递增：`phase += floatSpeed * 0.05`

### 绘制

- 使用 `ctx.font = '14px monospace'`
- 使用 `ctx.fillText(codeText, x, y)`
- 颜色：`rgba(42, 42, 42, opacity)` 炭灰色
- 透明度低于 0.02 时跳过绘制

## 改动文件

- `frontend/src/components/ParticleBackground.jsx`
  - 新增 `codePool` 常量
  - 新增 `CodeParticle` 类
  - 新增 `codeParticles` 数组
  - 修改 `draw()` 函数，绘制 code 粒子
  - 修改 `resize()` / `handleResize()`，重置 code 粒子
  - 修改 `shouldDisperseAvatar` 逻辑，触发 code 出现

## 验收标准

1. 页面加载时无 code 漂浮
2. 滚动触发头像炸开后，code 字符渐进出现
3. code 字符柔和像素风（灰色调）
4. 漂浮动画流畅，无明显性能问题
5. 响应式：各屏幕尺寸均有合适数量
