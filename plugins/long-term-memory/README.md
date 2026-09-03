# 长期记忆（long-term-memory）

监听每轮对话结束事件，自动把对话摘要存档，并在后续对话中把长期记忆注入上下文，让昔涟「记住」更早之前聊过的内容。

## 使用方式

启用插件后自动工作，无需额外操作。随着对话积累，昔涟会逐渐记住你的偏好与历史话题。

## 行为说明

- 使用宿主 LLM 生成对话摘要（消耗模型调用量）
- 摘要存储在插件私有存储中，卸载插件即删除
- 只读访问会话历史（冻结分页），不修改任何对话数据
- 源码：[Cyrene-Agent 示例](https://github.com/Playa-0v0/Cyrene-Agent/tree/master/examples/long-term-memory)
