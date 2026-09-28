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
npm run test:all
npm run build
npm run build:protected
npm run test:protected
```

## 约束

- 不引入运行时网络依赖与 API Key；保持纯本地应用；
- 不改变 `dist/`、`release/` 的生成方式（分别由 `npm run build` 与 `npm run build:protected` 产出，不手工编辑）；
- 保持与 V2.1.2 的存储键名兼容（`liuShenHistory` / `liuShenTemplates`）与 V3 数据导入兼容；
- 跨版本功能迁移请遵循主项目的「功能迁移单」流程，不直接复制 V3 代码。
