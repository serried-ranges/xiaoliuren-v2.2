# 小六壬排盘 V2.2（简洁兼容版）

> 状态：**冻结维护**——作为历史兼容基线，只修复正确性、安全与浏览器兼容问题，不新增功能。
> 来源：由主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren) 的 `xiaoliuren-v2.2/` 目录迁移（快照提交 `ef750b9`，2026-09-28）。迁移后两边各自维护，**不自动同步**。
> 许可：本仓库新增内容按 [LICENSE](LICENSE)（BSD 3-Clause）；派生自主项目的部分保留原 MIT 许可，见 [LICENSE-MIT](LICENSE-MIT)。
> 门禁：独立 CI（`.github/workflows/ci.yml`）：`npm ci → check → test:all → build → build:protected → test:protected`。

## 这是什么

V2.2 是 V3 之前的「简洁版」与历史兼容基线：外链 `<script>` 模块化（非 ES Module，`file://` 直接可用），保留三种排盘（古法 / 江氏 / 道传）、3 套 AI 提示词模板、历史记录与反馈。

**不包含**：V3 的 31 套皮肤、免费额度代理、一键解卦、复杂结果操作、知识速查面板；不接入任何网络能力或 API Key。

## 快速开始

```powershell
npm ci                  # 安装依赖（Vite，仅开发/构建用）
npm run dev             # 本地开发（Vite HMR）
npm run check           # 语法检查（12 个模块）
npm run test:all        # 5 个核心测试脚本
npm run build           # 构建 dist/index.html（明码单文件）
npm run build:protected # 构建 release/index.html（混淆保护版）
npm run test:protected  # 验证受保护发布包
```

## 产物

| 产物 | 说明 |
|---|---|
| `dist/index.html` | 明码单文件，双击即用 |
| `release/index.html` | 混淆保护版；**只是源码可读性门槛，不是密钥保护** |

## 数据与边界

- 数据全部保存在浏览器本地存储，按身份命名空间隔离；支持导入 V3 格式数据（自动转换结构）；
- 与 V2.1.2 共享 `liuShenHistory` / `liuShenTemplates` 键名；
- 不发布到资料站：网页发布源只有主项目的 V3（`x6ren.cn`）。

## 文档

- [版本说明](版本说明.md)｜[使用说明](使用说明_V2.2.md)｜[开发者指南](DEVELOPER_GUIDE_V2.2.0.md)｜[变更日志](CHANGELOG.md)
- 迁仓前的完整项目历史见主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren)。
