import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Conversation } from "@talk-to-god/shared";
import { fetchConversations, deleteConversation } from "../lib/api";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDeleteClick = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setPendingDelete(conv);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError("");
    try {
      await deleteConversation(pendingDelete.id);
      setConversations((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
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
    <div className="px-4 pt-5 pb-4">
      <header className="mb-5">
        <h1 className="text-lg font-semibold text-text">我的会话</h1>
        <p className="text-xs text-text-muted mt-0.5">与哲学家的对话记录</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-text-muted">加载中…</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="glass-card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M8 10h8M8 14h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.217-1.338A9.955 9.955 0 0012 22z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-text-muted mb-4">还没有对话记录</p>
          <Link to="/" className="btn-primary inline-block">
            去图鉴选择哲学家
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="section-title">最近对话</h2>
            <span className="text-[11px] text-text-light">{conversations.length} 条</span>
          </div>
          {conversations.map((c) => (
            <div key={c.id} className="glass-card-hover flex items-center gap-3 p-3.5">
              <Link to={`/chat/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0 shadow-sm">
                  <span className="font-serif text-white text-sm">{c.philosopherName.slice(0, 1)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="font-semibold text-sm truncate text-text">{c.philosopherName}</h3>
                    <span className="status-running shrink-0">进行中</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <p className="text-xs text-text-muted truncate flex-1">{c.lastMessage || "开始对话吧"}</p>
                    <span className="text-[10px] text-text-light shrink-0 ml-2">{formatTime(c.updatedAt)}</span>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => handleDeleteClick(e, c)}
                className="w-8 h-8 rounded-full bg-red-50 text-red-400 text-xs shrink-0 flex items-center justify-center hover:bg-red-100 transition-colors"
                aria-label="删除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto text-center text-sm text-red-500 bg-red-50 rounded-xl py-2 px-3">
          {error}
        </p>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-8 shadow-card">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="font-semibold text-center mb-2">删除会话</h3>
            <p className="text-sm text-text-muted text-center mb-5">
              确定删除与 {pendingDelete.philosopherName} 的对话？此操作不可恢复。
            </p>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="w-full py-3.5 mb-2 bg-red-500 text-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {deleting ? "删除中…" : "确认删除"}
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="w-full py-2.5 text-text-muted text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
