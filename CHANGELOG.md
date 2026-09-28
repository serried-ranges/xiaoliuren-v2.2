# 变更日志（CHANGELOG）

> 本仓库的独立变更日志，最新在上。迁仓前的历史见主项目 [`serried-ranges/xiaoliuren`](https://github.com/serried-ranges/xiaoliuren) 的 CHANGELOG 与 `历史记录/`。

## [2026-09-28] — 迁仓与开源准备

- 从主项目 `xiaoliuren-v2.2/` 目录迁移为独立仓库（快照提交 `ef750b9`），保留源码、样式、5 个核心测试、构建脚本与两份交付物（`dist/`、`release/`）。
- 新增根 README（一页式项目契约）、独立 CI（`npm ci → check → test:all → build → build:protected → test:protected`）、`.gitignore`、`LICENSE-MIT`（保留原 MIT 声明）、`SECURITY.md`、`CONTRIBUTING.md`。
- 文档校正：目录树以本仓库根为基准；「历史记录」链接改指主项目。

## [2026-09-26 ~ 2026-09-27] — 兼容基线收口（迁仓前，主仓内）

- 明确 V2.2 为**冻结的简洁版 / 兼容基线**：只用于旧版行为、排盘结果与备份格式核对；
- 纳入主仓 CI 独立关卡（语法、5 个核心测试、明码与受保护构建、受保护包校验）。

## [2026-08-13] — V2.2.0 基线（历史）

- V2.1.2 的工程化拆分版：单 HTML → 12 个 JS 子模块 + 4 个 CSS；
- 增加道传小六壬（死活六神双轨）、3 套 AI 提示词模板；
- 移除收藏夹、时空八字、六十四卦等扩展，确立「简洁优先」定位。
