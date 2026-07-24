import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAdminKey } from "../../lib/admin";
import { verifyAdminKey } from "../../lib/admin-api";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await verifyAdminKey(key.trim());
      if (!ok) {
        setError("管理员密钥无效");
        return;
      }
      setAdminKey(key.trim());
      navigate("/admin/philosophers");
    } catch {
      setError("验证失败，请检查后台是否已配置 ADMIN_SECRET");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface rounded-xl border border-gray-100 p-6 shadow-sm">
        <h1 className="font-serif text-xl font-bold text-accent text-center mb-1">后台管理</h1>
        <p className="text-xs text-text-muted text-center mb-6">与哲对话 · 哲学家与用户配置</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">管理员密钥</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请输入 ADMIN_SECRET"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? "验证中…" : "进入后台"}
          </button>
        </form>
      </div>
    </div>
  );
}
