# 参与贡献

感谢你改进“今天吃什么”。这个项目的第一原则是：**少做选择，快速开饭**。

## 开始之前

1. Fork 仓库并从 `main` 创建功能分支。
2. 使用 Node.js 22.13+（22 LTS）或 24 LTS 与 pnpm 11.24.0（`.nvmrc` 默认 Node.js 24）。
3. 运行 `pnpm install --frozen-lockfile`。
4. 项目无需环境变量或 API Key，直接运行 `pnpm dev`。

## 开发约定

- 只增加与午餐决策核心流程直接相关的功能。
- 新增推荐规则时必须补充单元测试，并解释权重或降级逻辑。
- 保持移动端优先、键盘可操作，并支持 `prefers-reduced-motion`。
- 不得引入位置、地图或外卖平台数据依赖；价格和准备时间必须表述为本地常见参考。
- 禁止抓取美团网页、绕过权限或提交未授权数据。

## 提交前检查

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Pull Request 请说明：变更目的、用户影响、验证方式，以及涉及界面时的手机端/桌面端截图。
