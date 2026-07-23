import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Conversation } from "@talk-to-god/shared";
import { fetchConversations, deleteConversation } from "../lib/api";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此会话？")) return;
    await deleteConversation(id);
    load();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    return d.toLocaleDateString("zh-CN");
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-primary">我的会话</h1>
        <p className="text-sm text-text-muted mt-1">与哲学家的对话记录</p>
      </header>

      {loading ? (
        <p className="text-center text-text-muted py-12">加载中…</p>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted mb-4">还没有对话记录</p>
          <Link to="/" className="text-primary text-sm underline">
            去图鉴选择哲学家 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-gray-100">
              <Link to={`/chat/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-serif text-primary">{c.philosopherName.slice(0, 1)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate">{c.philosopherName}</h3>
                    <span className="text-[10px] text-text-muted shrink-0 ml-2">{formatTime(c.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">{c.lastMessage || "开始对话吧"}</p>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-text-muted/50 text-xs px-2 shrink-0"
                aria-label="删除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
