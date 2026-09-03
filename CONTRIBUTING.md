# 贡献指南（CONTRIBUTING）

欢迎为 Cyrene 编写插件！本仓库收录经审核的插件，供用户直接下载安装。提交前请通读本文件，能大幅提高一次通过率。

---

## 一、收录格式要求

你的 PR 必须包含一个**可直接安装**的插件目录，放在 `plugins/<插件id>/` 下：

```text
plugins/
└── my-plugin/
    ├── manifest.json   # 必需：插件清单
    ├── index.cjs       # 必需：入口（编译后的 CommonJS，或 .js/.mjs）
    └── README.md       # 必需：插件说明（做什么用、怎么配置、有什么风险）
```

硬性规则：

1. **产物自包含**：入口文件不得 `require`/`import` 任何未打包进目录的 npm 包。运行时依赖宿主 API 通过 `ctx.deps` 获取，类型依赖请在构建阶段消除（TypeScript 用 `import type`，运行时函数自己实现）
2. **不收录源码工程**：`node_modules/`、`tsconfig.json`、`src/`、构建脚本等一律不要进仓库；README 里给出你的源码仓库链接即可
3. **manifest 必须通过校验**：用 SDK 自带的 `validateManifest` 校验（见下文「开发流程」第 3 步）
4. **目录名 = manifest 的 `id`**：全小写连字符，如 `weather-tool`
5. **单插件单 PR**：一个 PR 只收录一个插件；已有插件的版本更新也单独提 PR
6. **不要上传 ZIP**：`zips/` 由维护者在合并后从审核过的源码统一打包，提交者上传的 ZIP 不会被采用

---

## 二、开发流程

```bash
# 1. 初始化项目
mkdir my-plugin && cd my-plugin
npm init -y
npm install @playa0v0/cyrene-plugin-sdk

# 2. 开发：用 SDK 的 Mock Context 写测试，不需要安装 Cyrene
#    （参考 SDK 文档的 testing 子路径）

# 3. 校验 manifest
node -e "const { validateManifest } = require('@playa0v0/cyrene-plugin-sdk'); console.log(validateManifest(require('./manifest.json')))"

# 4. 编译为 CommonJS 产物（示例：tsc）
npx tsc index.ts --module commonjs --target node18 --outDir .
mv index.js index.cjs
```

完整开发教程：[插件开发指南](https://github.com/Playa-0v0/Cyrene-Agent/blob/master/docs/plugins/plugin-dev-guide.md)
接口规范：[plugin-authoring.md](https://github.com/Playa-0v0/Cyrene-Agent/blob/master/docs/plugins/plugin-authoring.md)

---

## 三、PR 流程

1. Fork 本仓库
2. 在 `plugins/` 下新建你的插件目录（自包含产物）
3. 在 `registry.json` 的 `plugins` 数组中登记：

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "一句话说明插件做什么",
  "author": "你的名字或 GitHub ID",
  "deps": ["llm"],
  "homepage": "https://github.com/you/my-plugin-src"
}
```

4. 在 [README.md](./README.md) 的「已收录插件」表格末尾添加一行：填写插件链接（`./plugins/<你的插件id>`）、版本、一句话简介与开发者（你的名字或 GitHub ID）；「直接下载」列留空，由维护者合并打包后补上 ZIP 链接
5. PR 标题格式：`[插件] <插件id> <版本>`（新收录）或 `[更新] <插件id> <旧版本> → <新版本>`
6. PR 描述请包含：
   - 插件功能与使用方式
   - 申明的宿主能力（`deps`）及各自用途
   - 是否访问网络、读写哪些文件、是否启动子进程
   - 源码仓库链接（如有）
7. 等待审核。审核会按 [review-checklist.md](./review-checklist.md) 逐项检查，发现问题会在 PR 里留言

---

## 四、审核关注点（提交前自查）

以下任何一条不过，PR 会被直接退回：

- 入口产物 `require` 了目录外的包（自包含检查）
- `manifest.json` 校验失败、`id` 与目录名不一致、version 不是严格 SemVer
- 工具 id 未以 `<插件id>_` 为前缀
- 代码里有 `eval`、动态 `require`（拼接变量）、混淆/压缩到不可读
- 声明了用不到的 `deps`（最小权限原则）
- README 缺失，或没有说明网络访问与数据存储行为

---

## 五、版本更新

- 已收录插件发新版：更新插件目录内产物 + `manifest.json` 的 `version` + `registry.json` 对应条目（ZIP 由维护者重新打包）
- 同步更新 README「已收录插件」表格中该插件的版本与简介
- version 必须递增（SemVer），同名同版本不可重复收录
- 行为有破坏性变化（配置格式、工具参数变更）请在 README 顶部的更新说明中写清迁移方法
