import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { UserAdmin } from "@talk-to-god/shared";
import AdminLayout from "../../components/AdminLayout";
import { getAdminKey } from "../../lib/admin";
import { fetchAdminUser, updateAdminUser } from "../../lib/admin-api";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN");
}

export default function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserAdmin | null>(null);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !getAdminKey()) {
      navigate("/admin");
      return;
    }
    fetchAdminUser(id)
      .then((u) => {
        setUser(u);
        setNickname(u.nickname || "");
      })
      .catch(() => navigate("/admin/users"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");
    setSaving(true);
    try {
      const updated = await updateAdminUser(id, {
        nickname,
        password: password || undefined,
      });
      setUser(updated);
      setPassword("");
      navigate("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <AdminLayout title="用户详情">
        <p className="text-center text-text-muted py-12">加载中…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="编辑用户"
      subtitle={user.phone || user.guestId || user.id}
      action={
        <Link to="/admin/users" className="text-sm text-text-muted">
          ← 返回列表
        </Link>
      }
    >
      <div className="bg-surface rounded-xl border border-gray-100 p-4 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">用户 ID</span>
          <span className="font-mono text-xs truncate max-w-[200px]">{user.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">类型</span>
          <span>{user.isGuest ? "游客" : "注册用户"}</span>
        </div>
        {user.phone && (
          <div className="flex justify-between">
            <span className="text-text-muted">手机号</span>
            <span>{user.phone}</span>
          </div>
        )}
        {user.guestId && (
          <div className="flex justify-between">
            <span className="text-text-muted">游客 ID</span>
            <span className="font-mono text-xs truncate max-w-[200px]">{user.guestId}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-muted">会话数</span>
          <span>{user.conversationCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">注册时间</span>
          <span>{formatTime(user.createdAt)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-gray-100 p-4 space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="用户昵称"
            className="field-input"
          />
        </div>

        {!user.isGuest && (
          <div>
            <label className="block text-xs text-text-muted mb-1.5">重置密码（留空则不修改）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className="field-input"
              minLength={6}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </form>
    </AdminLayout>
  );
}
