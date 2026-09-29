# 小六壬排盘 V2.2（简洁兼容版）

> **状态：已归档（2026-09-28）**——只读对照用途，仅接受安全与正确性修复；不新增功能、不跟进 V3。详见 [归档说明](docs/归档说明.md)。
> 来源：由主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren) 的 `xiaoliuren-v2.2/` 目录迁移（快照提交 `ef750b9`，2026-09-28）。迁移后独立维护，**不自动同步**。
> 许可：本仓库新增内容按 [LICENSE](LICENSE)（BSD 3-Clause）；派生自主项目的部分保留原 MIT 许可，见 [LICENSE-MIT](LICENSE-MIT)。
> 门禁：独立 CI（`.github/workflows/ci.yml`）：`npm ci → check → check:docs → test:all → test:compat → build → build:protected → test:protected`。每次提交前可照此逐条本地复跑（见[重启与接手指南](docs/重启与接手指南.md)）。

## 这是什么

V2.2 是 V3 之前的「简洁版」与历史兼容基线：外链 `<script>` 模块化（非 ES Module，`file://` 直接可用），保留三种排盘（古法 / 江氏 / 道传）、3 套 AI 提示词模板、历史记录与反馈。

**不包含**：V3 的 31 套皮肤、免费额度代理、一键解卦、复杂结果操作等扩展能力；不接入任何网络能力或 API Key。

## 快速开始

```powershell
npm ci                  # 安装依赖（Vite，仅开发/构建用）
npm run dev             # 本地开发（Vite HMR）
npm run check           # 语法检查（12 个模块）
npm run check:docs      # 文档链接检查
npm run test:all        # 5 个核心测试脚本（当前 571 项断言，口径见 docs/版本说明.md）
npm run test:compat     # V2.2 ↔ V3.0 数据兼容（144 用例）
npm run build           # 构建 dist/index.html（明码单文件）
npm run build:protected # 构建 release/index.html（混淆保护版）
npm run test:protected  # 验证受保护发布包（7 项检查）
```

## 产物

| 产物 | 说明 |
|---|---|
| `dist/index.html` | 明码单文件，双击即用 |
| `release/index.html` | 混淆保护版；**只是源码可读性门槛，不是密钥保护** |

## 数据与边界

- 数据全部保存在浏览器本地存储，按身份命名空间隔离；键名、V3 导入与备份口径见 [数据兼容与迁移](docs/数据兼容与迁移.md)；
- 纯本地应用：应用自身不发起网络请求、不收集或上传数据、不含任何密钥；唯一外跳为「更多 → 切换标准」主动跳转 V3 站点（`x6ren.cn`）；
- 不发布到资料站：网页发布源只有主项目的 V3（`x6ren.cn`）。

## 文档

| 文档 | 说明 |
|---|---|
| [文档索引](docs/README.md) | 全部文档与阅读顺序 |
| [重启与接手指南](docs/重启与接手指南.md) | 恢复环境、验收命令、已知事项与重启门槛 |
| [归档说明](docs/归档说明.md) | 归档状态与维护边界 |
| [版本说明](docs/版本说明.md) | 版本事实、功能与文件清单 |
| [使用说明](docs/使用说明_V2.2.md) | 使用者操作（起卦、排盘、记录、导出） |
| [开发者指南](docs/DEVELOPER_GUIDE_V2.2.0.md) | 环境、模块结构、构建与测试 |
| [数据兼容与迁移](docs/数据兼容与迁移.md) | 本地键名、V3 导入、备份建议 |
| [历史归档](history/README.md) | V2.1 / V2.2 历史版本与审计资料（非当前操作指南） |
| [CHANGELOG](CHANGELOG.md) ｜ [SECURITY](SECURITY.md) ｜ [CONTRIBUTING](CONTRIBUTING.md) | 变更 / 安全 / 贡献 |

## 共同口径（三项目一致）

- **许可**：代码以 MIT / BSD 系许可发布，各仓保留派生来源与许可声明；
- **受保护构建**：只提高源码可读门槛，**不是**密钥保护或保密方案；
- **数据**：只保存在用户浏览器或容器本地，不上传；V2.2 与小红书版无联网能力，V3 的联网能力仅限用户主动使用 AI 时；
- **免责**：排盘与解读内容仅为传统民俗参考，不构成任何预测或决策依据。

> 迁仓前的完整项目历史见主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren)。
