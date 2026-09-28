# 小六壬 V2.2.0 开发指南

> 交付物：`dist/index.html`（明码）+ `release/index.html`（混淆保护版）  
> 环境要求：Node.js ≥ 14 LTS

---

## 1. 目录结构

```
.
├── index.html                 页面骨架（<script> 外链加载）
├── build-single.cjs           单文件打包脚本（Node 原生）
├── package.json               脚本入口
├── scripts/
│   └── build-protected.cjs    受保护发布（混淆 + XOR 编码）
│
├── styles/                    4 个 CSS（variables / base / feedback / template）
│
├── src/
│   ├── main.js                入口：事件绑定 + init()
│   ├── core/                  算法层（纯函数）
│   │   ├── lunar.js           农历库
│   │   ├── calculator.js      古法/江氏/道传排盘算法
│   │   ├── browser-core.js    公共领域核心（数字校验/余数/随机/日期）
│   │   └── domain-adapter.js  公共领域适配
│   ├── prompts/
│   │   └── canonical-prompt.js 标准提示词基线
│   ├── store/state.js         状态/存储/CRUD/safeLS
│   ├── utils/dom.js           DOM 工具
│   └── ui/                    表现层
│       ├── renderer.js        三宫/江氏/道传渲染 + 历史
│       ├── template.js        AI 模板管理
│       ├── feedback.js        解卦反馈弹窗
│       └── more.js            更多菜单
│
├── dist/index.html            🎯 明码交付物
├── release/index.html         🔒 混淆保护版
│
└── 测试文件（5 个核心脚本，267 项断言；保护版另有 7 项检查）
    ├── test-v22-calculator.mjs / test-v22-jiang-pai.mjs
    ├── test-v22-dao-pai.mjs / test-v22-lunar.mjs
    ├── test-v22-data.mjs / test-v22-protected-release.cjs
```

---

## 2. 分层职责

| 层 | 目录 | 可以做 | 不可以做 |
|----|------|--------|---------|
| 算法层 | `src/core/` | 纯函数 | 不访问 DOM/localStorage |
| 状态层 | `src/store/` | 变量/CRUD/safeLS | 不拼 HTML，不操作 classList |
| 表现层 | `src/ui/` | 渲染 DOM/绑定事件 | 不新增算法/持久化格式 |
| 工具层 | `src/utils/` | 纯工具函数 | 不含领域知识 |

---

## 3. 加载顺序（依赖链）

```
1. lunar.js             无依赖
2. calculator.js        依赖 lunar.js
3. browser-core.js      公共领域核心
4. domain-adapter.js    适配层
5. canonical-prompt.js  标准提示词
6. state.js             依赖 document
7. dom.js               依赖 state.js
8. template.js          依赖 state.js
9. feedback.js          依赖 state.js
10. more.js             依赖 state.js
11. renderer.js         依赖 calculator/state/dom/template
12. main.js             入口，依赖以上全部
```

> 顺序不可变。所有模块共享 Script scope（非 ES Module），file:// 直接可用。

---

## 4. 日常开发流程

### 4.1 改代码

常见改动：

| 需求 | 改哪个文件 |
|------|-----------|
| 新增面板/按钮 | `index.html` + `main.js` |
| 改排盘算法 | `calculator.js` |
| 修改样式 | `styles/` 对应文件 |
| 替换联系方式 | `more.js` 常量 |
| 新增子模块 | 同步改 index.html + package.json |

### 4.2 语法检查

```powershell
npm run check
```

无输出即通过。任何 `SyntaxError` 必须在此阶段修复。

### 4.3 测试

```powershell
npm run test:all
npm run test:protected
```

`test:all` 运行五个历史核心测试脚本；六亲和道传断言已按归档逻辑中的五行生克、活六神轮转与隔支公式校正。测试脚本是自包含的逻辑副本，不直接导入运行时模块，可能发生漂移；它们只提供规则回归参考，不代表真实页面或打包产物的完整行为验收。

### 4.4 构建

```powershell
# 明码版本（dist/index.html）
npm run build

# 混淆保护版（release/index.html）
npm run build:protected

# 验证保护版
npm run test:protected
```

### 4.5 验证清单

双击打开产物，依次检查：
1. 古法排盘（1/2/3）正常
2. 道传排盘 + 表格正常
3. 刷新后模式保持
4. 历史记录 + 模式标记
5. 更多菜单弹窗正常
6. AI 模板三套默认可用
7. 知识速查折叠正常
8. 控制台无 JS 错误

---

## 5. 构建原理

### build-single.cjs（明码版）

- 读取 `index.html`，用正则匹配 `<link>` 和 `<script src>` 
- 读取对应文件，内联为 `<style>` 和 `<script>` 
- 输出到 `dist/index.html`

### build-protected.cjs（混淆保护版）

1. 先调用 `build-single.cjs --out release/index.raw.html` 生成原始单文件
2. 提取所有内联 `<script>` 内容
3. 用 `javascript-obfuscator` 混淆（变量名十六进制 + 字符串 base64）
4. XOR 编码后嵌入 loader 脚本
5. 输出到 `release/index.html`，删除中间文件

---

## 6. 持久化 Key 清单

| Key | 形式 | 说明 |
|-----|------|------|
| `liuShenHistory_{userId}` | JSON 数组 | 历史记录 |
| `liuShenTemplates_{userId}` | JSON 对象 | 自定义模板 |
| `xll_divination_mode_{userId}` | 字符串 | 排盘模式 |
| `xll_ai_prompt_key` | 字符串 | AI 模板选择 |
| `xll_userId` | 字符串 | 用户身份 ID |

> 加载时始终加兜底：`|| []`、`|| {}`、`|| 'gufa'`

---

## 7. 新增子模块

必须同步修改：

1. **`index.html`**：在正确位置插入 `<script src="...">`  
2. **`package.json`**：`scripts.check` 追加 `&& node --check src/...`  

---

## 8. 排错速查

| 症状 | 原因 | 解决 |
|------|------|------|
| `xxx is not defined` | 加载顺序错误 | 对照 §3 检查 `<script>` 顺序 |
| 改源码后 dist 不变 | 未重新构建 | 执行 `npm run build` |
| 切换模式后渲染错误 | switchDivinationMode 参数错误 | 确认 `silent=false` |
| 新增 JS 不生效 | 未在 index.html 登记 | 按 §7 同步修改 |
| 打包报错 | CSS/JS 路径不对 | 确保使用相对路径 |

---

## 9. 最小可工作包

换电脑/换 IDE 只需带这些文件：
- `index.html` + `styles/` + `src/`  
- `build-single.cjs` + `scripts/`  
- `package.json`（可选）

不需要：`node_modules/`、`vite.config.js`、`docs/`
