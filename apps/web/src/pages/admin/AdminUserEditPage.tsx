import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { UserAdmin } from "@talk-to-god/shared";
import AdminLayout from "../../components/AdminLayout";
import { getAdminKey } from "../../lib/admin";
import { fetchAdminUser, updateAdminUser } from "../../lib/admin-api";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-text-muted shrink-0">{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
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
      <AdminLayout title="用户详情" backTo="/admin/users">
        <p className="text-center text-text-muted py-12">加载中…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="编辑用户"
      subtitle={user.phone || user.guestId || user.id}
      backTo="/admin/users"
    >
      <div className="admin-form-grid">
        <section className="admin-form-section">
          <h3 className="text-sm font-medium text-accent mb-2">账户信息</h3>
          <div className="text-sm space-y-0">
            <InfoRow label="用户 ID" value={<span className="font-mono text-xs">{user.id}</span>} />
            <InfoRow label="类型" value={user.isGuest ? "游客" : "注册用户"} />
            {user.phone && <InfoRow label="手机号" value={user.phone} />}
            {user.guestId && (
              <InfoRow label="游客 ID" value={<span className="font-mono text-xs">{user.guestId}</span>} />
            )}
            {user.lastIp && <InfoRow label="最近 IP" value={<span className="font-mono text-xs">{user.lastIp}</span>} />}
            {user.region && <InfoRow label="所属区域" value={user.region} />}
            {user.lastSeenAt && <InfoRow label="最近访问" value={formatTime(user.lastSeenAt)} />}
            <InfoRow label="会话数" value={user.conversationCount} />
            <InfoRow label="注册时间" value={formatTime(user.createdAt)} />
          </div>
        </section>

        <form onSubmit={handleSubmit} className="admin-form-section">
          <h3 className="text-sm font-medium text-accent mb-2">编辑资料</h3>

          <div className="space-y-4">
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

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="admin-btn-ghost py-2.5 sm:px-6 order-2 sm:order-1"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 order-1 sm:order-2"
              >
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
