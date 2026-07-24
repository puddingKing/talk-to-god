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
      <div className="flex flex-wrap gap-2 mb-4">
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
        <>
          <div className="admin-card-list">
            {filtered.map((u) => (
              <UserRowMobile key={u.id} user={u} onDelete={handleDelete} formatTime={formatTime} />
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>类型</th>
                  <th>IP</th>
                  <th>区域</th>
                  <th>会话</th>
                  <th>创建时间</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="font-medium">{u.nickname || (u.isGuest ? "游客" : u.phone)}</div>
                      <div className="text-xs text-text-muted font-mono truncate max-w-[180px]">
                        {u.phone || u.guestId || u.id}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          u.isGuest ? "bg-gray-100 text-text-muted" : "bg-green-50 text-green-600"
                        }`}
                      >
                        {u.isGuest ? "游客" : "注册"}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-text-muted">{u.lastIp || "—"}</td>
                    <td className="text-text-muted">{u.region || "—"}</td>
                    <td>{u.conversationCount}</td>
                    <td className="text-text-muted text-xs whitespace-nowrap">{formatTime(u.createdAt)}</td>
                    <td className="text-right whitespace-nowrap">
                      <Link to={`/admin/users/${u.id}`} className="text-primary hover:underline mr-4">
                        编辑
                      </Link>
                      <button onClick={() => handleDelete(u)} className="text-red-500 hover:underline">
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function UserRowMobile({
  user: u,
  onDelete,
  formatTime,
}: {
  user: UserAdmin;
  onDelete: (user: UserAdmin) => void;
  formatTime: (iso: string) => string;
}) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-xl border border-gray-100 p-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-serif text-primary">{(u.nickname || u.phone || "游").slice(0, 1)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{u.nickname || (u.isGuest ? "游客" : u.phone)}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
              u.isGuest ? "bg-gray-100 text-text-muted" : "bg-green-50 text-green-600"
            }`}
          >
            {u.isGuest ? "游客" : "注册"}
          </span>
        </div>
        <div className="text-xs text-text-muted truncate mt-0.5">
          {u.phone || u.guestId || u.id}
          {u.lastIp ? ` · ${u.lastIp}` : ""}
          {u.region ? ` · ${u.region}` : ""}
          {" · "}
          {u.conversationCount} 会话 · {formatTime(u.createdAt)}
        </div>
      </div>
      <Link to={`/admin/users/${u.id}`} className="admin-btn-ghost !text-primary !border-primary/20 shrink-0">
        编辑
      </Link>
      <button
        onClick={() => onDelete(u)}
        className="admin-btn-ghost !text-red-500 !border-red-100 shrink-0"
      >
        删除
      </button>
    </div>
  );
}
