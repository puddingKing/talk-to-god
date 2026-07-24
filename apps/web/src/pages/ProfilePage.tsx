import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, loading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(phone, password);
      } else {
        await register(phone, password, nickname || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-text-muted py-12">加载中…</p>;
  }

  if (user && !user.isGuest) {
    return (
      <div className="px-4 pt-6 pb-4">
        <header className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-primary">我的</h1>
        </header>

        <div className="bg-surface rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-serif text-primary">
              {(user.nickname || user.phone || "?").slice(0, 1)}
            </span>
          </div>
          <h2 className="text-center font-medium text-lg">{user.nickname || "哲学对话者"}</h2>
          <p className="text-center text-sm text-text-muted mt-1">{user.phone}</p>
          <p className="text-center text-xs text-text-muted/70 mt-4">
            登录后会话将长期保存，可在不同设备同步
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-text-muted text-sm"
        >
          退出登录
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-primary">我的</h1>
        <p className="text-sm text-text-muted mt-1">登录后保存对话，跨设备同步</p>
      </header>

      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-sm rounded-md ${
            mode === "login" ? "bg-surface shadow-sm text-primary font-medium" : "text-text-muted"
          }`}
        >
          登录
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-2 text-sm rounded-md ${
            mode === "register" ? "bg-surface shadow-sm text-primary font-medium" : "text-text-muted"
          }`}
        >
          注册
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">手机号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 位手机号"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-xs text-text-muted mb-1.5">昵称（可选）</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="如何称呼你"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-text-muted mb-1.5">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
            minLength={6}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
        >
          {submitting ? "处理中…" : mode === "login" ? "登录" : "注册"}
        </button>
      </form>

      <p className="text-xs text-text-muted/70 text-center mt-6">
        未登录时以游客身份体验，会话仅保存在当前浏览器
      </p>
    </div>
  );
}
