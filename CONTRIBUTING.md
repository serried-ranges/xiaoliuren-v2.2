# 贡献说明

## 维护范围（冻结）

本仓库是**兼容基线**，只接受：

- 正确性修复（排盘结果、农历/节气、数据兼容）；
- 安全与隐私修复；
- 浏览器兼容与可访问性修复；
- 测试与文档补充（不改变既有行为）。

**不接受**：新功能、新皮肤、新入口、依赖升级类重构（如需升级，请先开 Issue 说明收益与回归方案）。

## 提交前运行

```powershell
npm ci
npm run check
npm run check:docs
npm run test:all
npm run test:compat
npm run build
npm run build:protected
npm run test:protected
```

## 约束

- 不引入运行时网络依赖与 API Key；保持纯本地应用；
- 不改变 `dist/`、`release/` 的生成方式（分别由 `npm run build` 与 `npm run build:protected` 产出，不手工编辑；`release/index.html` 每次构建字节不同属正常，验证用 `npm run test:protected`）；
- 移动 / 重命名文档后必须运行 `npm run check:docs`（CI 也会检查），确保没有死链；
- 旧版无命名空间键（`liuShenHistory` / `liuShenTemplates` / `xll_divination_mode`）**不自动认领**，需在旧页面导出后显式导入迁移；保持与 V3 数据导入 / 导出的互认关系；
- 仓库采用**一主两备**托管（GitHub 主仓库 + AtomGit / Gitee 备份从库）：一次 `git push` 三仓同步，Actions 自动镜像兜底；备份仓只读，Issue / PR 统一在 GitHub 主仓库（见[根 README](README.md)）；
- 跨版本功能迁移请遵循主项目的「功能迁移单」流程，不直接复制 V3 代码。
