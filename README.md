# Cyrene-Plugins

Cyrene 昔涟官方插件收录仓库：开发者通过 Pull Request 提交插件，审核通过后收录进本仓库，供用户下载安装。

- 主程序：[Cyrene-Agent](https://github.com/Playa-0v0/Cyrene-Agent)
- SDK：[@playa0v0/cyrene-plugin-sdk](https://www.npmjs.com/package/@playa0v0/cyrene-plugin-sdk)
- 开发指南：[docs/plugins/plugin-dev-guide.md](https://github.com/Playa-0v0/Cyrene-Agent/blob/master/docs/plugins/plugin-dev-guide.md)

---

## 已收录插件

| 插件 | 版本 | 简介 | 宿主能力 |
| --- | --- | --- | --- |
| [weather-tool](./plugins/weather-tool) | 0.1.0 | 查询城市天气：优先使用用户配置的 OpenWeather 密钥，未配置时自动降级到免密钥的 Open-Meteo | secrets |
| [long-term-memory](./plugins/long-term-memory) | 0.1.0 | 监听轮次结束事件，自动摘要对话并存档，把长期记忆注入下一轮上下文 | llm、conversations |
| [scheduled-automation](./plugins/scheduled-automation) | 0.1.0 | 通过对话创建、管理自己的定时任务（创建后需在宿主界面确认启用） | scheduler |
| [local-asr-contract](./plugins/local-asr-contract) | 0.1.0 | 本地语音识别契约示例：演示语音输入租约的获取、提交与释放 | speech-input |

---

## 用户：如何安装插件

1. 打开插件目录（如 [plugins/weather-tool](./plugins/weather-tool)）
2. 点击页面右上角绿色 **Code** 按钮 → **Download ZIP**；或直接下载 `manifest.json` 与 `index.cjs` 两个文件后自行压缩为 ZIP
3. 在 Cyrene 中打开 **设置 → 插件 → 导入 ZIP**，选择下载的压缩包
4. 安装完成后在插件列表中**手动启用**

说明：

- ZIP 内应是插件目录本身（包含 `manifest.json` 和入口文件），不要多层嵌套
- 用户插件首次安装后默认停用，启用后才会生效
- 插件更新：重新导入新版 ZIP 即可，插件数据（存储、密钥）不会丢失

---

## 开发者：如何提交插件

简述流程（详见 [CONTRIBUTING.md](./CONTRIBUTING.md)）：

1. 用 `npm install @playa0v0/cyrene-plugin-sdk` 开发与测试插件
2. 把**可直接安装的产物**（`manifest.json` + 编译后的入口文件）放进 `plugins/<你的插件id>/` 目录
3. 在 `registry.json` 中登记插件信息
4. 提交 Pull Request，等待安全审核（审核标准见 [review-checklist.md](./review-checklist.md)）

---

## 安全说明

- 本仓库所有插件经过人工安全审核后才收录，但**审核不构成担保**，请只安装你信任的插件
- 插件与 Cyrene 运行在同一进程，拥有完整 Node.js 权限（可读写文件、联网、启动子进程）
- 所有用户插件首次安装后默认停用；定时任务、密钥写入等敏感操作需你在宿主界面二次确认

---

## 目录结构

```text
Cyrene-Plugins/
├── plugins/              # 已收录插件（每个子目录一个插件，可直接安装）
│   └── <插件id>/
│       ├── manifest.json # 插件清单
│       ├── index.cjs     # 编译后的入口
│       └── README.md     # 插件说明
├── registry.json         # 收录索引（插件元数据登记处）
├── CONTRIBUTING.md       # 提交规范（面向插件开发者）
└── review-checklist.md   # 审核清单（面向维护者，也可供提交者自查）
```
