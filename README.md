# 小六壬排盘 V2.2（简洁兼容版）

> **状态：已归档（2026-09-28）**——只读对照用途，仅接受安全与正确性修复；不新增功能、不跟进 V3。详见 [归档说明](归档说明.md)。
> 来源：由主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren) 的 `xiaoliuren-v2.2/` 目录迁移（快照提交 `ef750b9`，2026-09-28）。迁移后独立维护，**不随主项目自动同步**。
> 许可：本仓库新增内容按 [LICENSE](LICENSE)（BSD 3-Clause）；派生自主项目的部分保留原 MIT 许可，见 [LICENSE-MIT](LICENSE-MIT)；内嵌第三方库（lunar-javascript）许可见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)。
> 门禁：独立 CI（`.github/workflows/ci.yml`）：`npm ci → check → check:docs → test:all → test:compat → build → build:protected → test:protected`。每次提交前可照此逐条本地复跑（见[接手与重启](文档/治理/接手与重启.md)）。

## 🪞 多仓库镜像同步说明

本仓库采用 **一主两备** 架构托管：

| 平台 | 角色 | 仓库地址 |
|---|---|---|
| **GitHub** | 🟢 主仓库 | https://github.com/serried-ranges/xiaoliuren-v2.2 |
| **AtomGit** | 🟡 备份从库 | https://atomgit.com/serried-ranges/xiaoliuren-v2.2 |
| **Gitee** | 🟡 备份从库 | https://gitee.com/serried-ranges/xiaoliuren-v2.2 |

**同步机制（双保险）**：

1. 本地 `origin` 配置 3 个 push URL：一条 `git push` 按 GitHub → Gitee → AtomGit 顺序推送三仓；
2. GitHub Actions（`.github/workflows/mirror.yml`）在 `main` 更新时自动强制镜像两个备份，兜底补齐漏推；
3. 备份仓库仅作代码镜像与国内加速访问，**请勿在备份仓库直接提交**；Issue / PR 统一前往 GitHub 主仓库。

**常用命令**：

```powershell
git push                                                      # 日常推送：一条命令推三仓，并触发自动镜像兜底
git pull                                                      # 从 GitHub 主仓库拉取更新
git fetch --all                                               # 拉取三仓引用
git rev-parse origin/main backup-gitee/main backup-atom/main  # 校验三仓一致（三行输出应为同一 commit）

git push backup-atom main                                     # 单独补推 AtomGit
git push backup-gitee main                                    # 单独补推 Gitee
git pull backup-atom main                                     # GitHub 不可用时，从备份仓库恢复
```

> 完整方案、排错与迁移步骤见主项目[《多仓库托管与自动镜像操作指南》](https://github.com/serried-ranges/xiaoliuren/blob/main/文档/治理/多仓库托管与自动镜像操作指南.md)。

## 这是什么

V2.2 是 V3 之前的「简洁版」与历史兼容基线：外链 `<script>` 模块化（非 ES Module，`file://` 直接可用），保留三种排盘（古法 / 江氏 / 道传）、3 套 AI 提示词模板、历史记录与反馈。

**不包含**：V3 的 31 套皮肤、免费额度代理、一键解卦、复杂结果操作等扩展能力；不接入任何网络能力或 API Key。

## 快速开始

```powershell
npm ci                  # 安装依赖（Vite，仅开发/构建用）
npm run dev             # 本地开发（Vite HMR）
npm run check           # 语法检查（12 个模块）
npm run check:docs      # 文档链接检查
npm run test:all        # 5 个核心测试脚本（589 项断言，口径见 docs/版本说明.md）
npm run test:compat     # V2.2 ↔ V3.0 数据兼容（144 用例）
npm run build           # 构建 dist/index.html（明码单文件）
npm run build:protected # 构建 release/index.html（混淆保护版）
npm run test:protected  # 验证受保护发布包（8 条断言）
```

## 产物

| 产物 | 说明 |
|---|---|
| `dist/index.html` | 明码单文件，双击即用；可由源码逐字节复现（735,606 字节） |
| `release/index.html` | 混淆保护版；**只是源码可读性门槛，不是密钥保护**；每次构建字节不同（约 936,000 字节，验证用 `test:protected`） |

## 数据与边界

- 数据全部保存在浏览器本地存储，按身份命名空间隔离；键名、V3 导入与备份口径见 [数据兼容与迁移](docs/数据兼容与迁移.md)；
- 纯本地应用：应用自身不发起网络请求、不收集或上传数据、不含任何密钥；唯一外跳为「更多 → 切换标准」主动跳转 V3 站点（`x6ren.cn`）；
- 导入安全：用户输入与导入数据在渲染前统一 HTML 转义，可疑 JSON 不会执行脚本；仍建议只导入自己或可信来源的备份文件；
- 不发布到资料站：网页发布源只有主项目的 V3（`x6ren.cn`）；
- 已知行为差异与待办见[文档/治理/待办事项与方案进度.md](文档/治理/待办事项与方案进度.md)。

## 目录与文档

```text
docs/    维护者事实与开发说明（版本说明 / 开发者指南 / 数据兼容与迁移 / 使用说明）
文档/    治理 / 产品 / 质量与审计（与主项目 `文档/` 同构）
history/ V2.1 / V2.2 历史资料（非当前操作指南）
```

| 想了解 | 文档 |
|---|---|
| 接手、恢复验收与重启门槛 | [文档/治理/接手与重启.md](文档/治理/接手与重启.md) |
| 文档总索引（治理 / 产品 / 质量） | [文档/README.md](文档/README.md) |
| 当前定位、维护规则与发展路线 | [文档/治理/版本现状与发展路线.md](文档/治理/版本现状与发展路线.md) |
| 已知问题与修复状态 | [文档/治理/待办事项与方案进度.md](文档/治理/待办事项与方案进度.md) |
| 版本事实、功能与文件清单 | [docs/版本说明.md](docs/版本说明.md) |
| 开发者指南（结构 / 命令 / 排错） | [docs/开发者指南.md](docs/开发者指南.md) |
| 使用者操作 | [docs/使用说明_V2.2.md](docs/使用说明_V2.2.md) |
| 本地键名与导入导出 | [docs/数据兼容与迁移.md](docs/数据兼容与迁移.md) |
| 历史归档 | [history/README.md](history/README.md) |
| 变更 / 安全 / 贡献 | [CHANGELOG.md](CHANGELOG.md) ｜ [SECURITY.md](SECURITY.md) ｜ [CONTRIBUTING.md](CONTRIBUTING.md) |
| 许可与第三方声明 | [LICENSE](LICENSE) ｜ [LICENSE-MIT](LICENSE-MIT) ｜ [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) |

## 共同口径（三项目一致）

- **许可**：代码以 MIT / BSD 系许可发布，各仓保留派生来源与许可声明；
- **受保护构建**：只提高源码可读门槛，**不是**密钥保护或保密方案；
- **数据**：只保存在用户浏览器或容器本地，不上传；V2.2 与小红书版无联网能力，V3 的联网能力仅限用户主动使用 AI 时；
- **免责**：排盘与解读内容仅为传统民俗参考，不构成任何预测或决策依据。

> 迁仓前的完整项目历史见主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren)。
