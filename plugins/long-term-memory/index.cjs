"use strict";
/** 每个会话保留最近几条摘要。 */
const MAX_MEMORIES_PER_CONVERSATION = 5;
let deps = {};
/** conversationId → 最近摘要（最新在后）。 */
let memories = new Map();
/** 把一轮对话压缩成一句话摘要；LLM 失败时降级为截断原文。 */
async function summarize(messages) {
    if (messages.length === 0)
        return null;
    const transcript = messages
        .map((m) => `${m.role === "user" ? "用户" : "助手"}: ${m.text}`)
        .join("\n")
        .slice(0, 4000);
    try {
        return await deps.llm.generateText([
            { role: "system", content: "用一句不超过 50 字的中文总结这轮对话的关键事实或决定。" },
            { role: "user", content: transcript },
        ], { maxTokens: 128, purpose: "summarize-turn" });
    }
    catch {
        // LLM 不可用时降级：保留用户消息前 50 字
        const firstUser = messages.find((m) => m.role === "user");
        return firstUser ? `（未摘要）${firstUser.text.slice(0, 50)}` : null;
    }
}
function remember(conversationId, summary) {
    const list = memories.get(conversationId) ?? [];
    list.push(summary);
    while (list.length > MAX_MEMORIES_PER_CONVERSATION)
        list.shift();
    memories.set(conversationId, list);
}
const recallTool = {
    id: "long-term-memory_recall",
    name: "回忆最近对话",
    description: "查看指定会话的最近记忆摘要。参数 conversationId 为会话 id；省略时查看所有会话的记忆条数。",
    enabled: true,
    risk: "safe",
    effectKind: "read",
    inputSchema: {
        type: "object",
        properties: {
            conversationId: { type: "string", description: "会话 id，省略时返回全部会话的记忆统计" },
        },
    },
    async execute(args) {
        const conversationId = String(args.conversationId ?? "");
        if (conversationId) {
            const list = memories.get(conversationId) ?? [];
            if (list.length === 0)
                return "该会话暂无记忆";
            return list.map((s, i) => `${i + 1}. ${s}`).join("\n");
        }
        const stats = [...memories.entries()].map(([id, list]) => `${id}: ${list.length} 条`);
        return stats.length > 0 ? stats.join("\n") : "暂无任何记忆";
    },
};
const plugin = {
    async register(ctx) {
        deps = ctx.deps;
        // 恢复历史记忆（storage 演示：跨启停持久化）
        memories = ctx.storage.get("memories") ?? new Map();
        ctx.onDispose(() => {
            ctx.storage.set("memories", memories);
        });
        // 轮次结束：冻结边界读取本轮消息并生成摘要
        ctx.events.on("host:turn:finished", async (event) => {
            if (event.source !== "desktop" || event.status !== "success")
                return;
            const conversations = deps.conversations;
            if (!conversations || !event.inputMessageId)
                return;
            // 用 inputMessageId / finalMessageId 冻结读取范围：翻页不会混入后续轮次
            const page = await conversations.getMessages({
                conversationId: event.conversationId,
                fromMessageId: event.inputMessageId,
                throughMessageId: event.finalMessageId,
                limit: 50,
            });
            const summary = await summarize(page.items);
            if (summary)
                remember(event.conversationId, summary);
        });
        // 动态提示词：只注入事实性状态，不写指令性内容
        ctx.registerPromptProvider({
            id: "recent-memories",
            provide(input) {
                if (input.source !== "conversation")
                    return "";
                const list = memories.get(input.conversationId ?? "");
                if (!list || list.length === 0)
                    return "";
                const recent = list.slice(-3).map((s) => `- ${s}`).join("\n");
                return `[长期记忆] 该会话最近摘要:\n${recent}`;
            },
        });
        ctx.registerTool(recallTool);
    },
    unregister() {
        memories = new Map();
    },
};
module.exports = plugin;
