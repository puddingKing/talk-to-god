import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { UserAdmin } from "@talk-to-god/shared";
import AdminLayout from "../../components/AdminLayout";
import { getAdminKey } from "../../lib/admin";
import { deleteAdminUser, fetchAdminUsers } from "../../lib/admin-api";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "registered" | "guest">("all");

  const load = () => {
    if (!getAdminKey()) {
      navigate("/admin");
      return;
    }
    setLoading(true);
    fetchAdminUsers()
      .then(setList)
      .catch((err) => {
        if (err.message.includes("无效") || err.message.includes("401")) navigate("/admin");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [navigate]);

  const filtered = list.filter((u) => {
    if (filter === "registered") return !u.isGuest;
    if (filter === "guest") return u.isGuest;
    return true;
  });

  const registeredCount = list.filter((u) => !u.isGuest).length;
  const guestCount = list.filter((u) => u.isGuest).length;

  const handleDelete = async (user: UserAdmin) => {
    const label = user.nickname || user.phone || user.guestId || user.id.slice(0, 8);
    if (!confirm(`确定删除用户「${label}」？其 ${user.conversationCount} 条会话将一并删除。`)) return;
    await deleteAdminUser(user.id);
    load();
  };

  return (
    <AdminLayout
      title="用户管理"
      subtitle={`共 ${list.length} 个账号 · 注册 ${registeredCount} · 游客 ${guestCount}`}
    >
      <div className="flex gap-2 mb-4">
        {(
          [
            ["all", "全部"],
            ["registered", "注册用户"],
            ["guest", "游客"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs ${
              filter === key ? "bg-primary text-white" : "bg-surface border border-gray-200 text-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-12">加载中…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-text-muted py-12">暂无用户</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 bg-surface rounded-xl border border-gray-100 p-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-serif text-primary">
                  {(u.nickname || u.phone || "游").slice(0, 1)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {u.nickname || (u.isGuest ? "游客" : u.phone)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      u.isGuest ? "bg-gray-100 text-text-muted" : "bg-green-50 text-green-600"
                    }`}
                  >
                    {u.isGuest ? "游客" : "注册"}
                  </span>
                </div>
                <div className="text-xs text-text-muted truncate mt-0.5">
                  {u.phone || u.guestId || u.id} · {u.conversationCount} 会话 · {formatTime(u.createdAt)}
                </div>
              </div>
              <Link
                to={`/admin/users/${u.id}`}
                className="px-3 py-1.5 text-sm text-primary border border-primary/20 rounded-lg shrink-0"
              >
                编辑
              </Link>
              <button
                onClick={() => handleDelete(u)}
                className="px-3 py-1.5 text-sm text-red-500 border border-red-100 rounded-lg shrink-0"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
