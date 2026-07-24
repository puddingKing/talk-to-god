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
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-text-muted">加载中…</p>
      </div>
    );
  }

  if (user && !user.isGuest) {
    return (
      <div className="px-0 pt-5 pb-4 md:pt-8">
        <header className="mb-5">
          <h1 className="text-lg font-semibold text-text">我的</h1>
        </header>

        <div className="glass-card p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 shadow-fab">
            <span className="text-3xl font-serif text-white">
              {(user.nickname || user.phone || "?").slice(0, 1)}
            </span>
          </div>
          <h2 className="font-semibold text-lg text-text">{user.nickname || "哲学对话者"}</h2>
          <p className="text-sm text-text-muted mt-1">{user.phone}</p>
          <div className="mt-4 inline-flex status-running">已登录</div>
          <p className="text-xs text-text-light mt-4 leading-relaxed">
            登录后会话将长期保存，可在不同设备同步
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full mt-5 py-3 rounded-2xl border border-white/80 bg-white/60 text-text-muted text-sm hover:bg-white/80 transition-colors"
        >
          退出登录
        </button>
      </div>
    );
  }

  return (
    <div className="px-0 pt-5 pb-4 md:pt-8">
      <header className="mb-5">
        <h1 className="text-lg font-semibold text-text">我的</h1>
        <p className="text-xs text-text-muted mt-0.5">登录后保存对话，跨设备同步</p>
      </header>

      <div className="flex mb-5 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2.5 text-sm rounded-xl transition-all ${
            mode === "login" ? "bg-primary text-white shadow-sm font-medium" : "text-text-muted"
          }`}
        >
          登录
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-2.5 text-sm rounded-xl transition-all ${
            mode === "register" ? "bg-primary text-white shadow-sm font-medium" : "text-text-muted"
          }`}
        >
          注册
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5 font-medium">手机号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 位手机号"
            className="field-input"
            required
          />
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-xs text-text-muted mb-1.5 font-medium">昵称（可选）</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="如何称呼你"
              className="field-input"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-text-muted mb-1.5 font-medium">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className="field-input"
            required
            minLength={6}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full btn-primary !py-3.5 !rounded-2xl">
          {submitting ? "处理中…" : mode === "login" ? "登录" : "注册"}
        </button>
      </form>

      <p className="text-xs text-text-light text-center mt-5 leading-relaxed">
        未登录时以游客身份体验，会话仅保存在当前浏览器
      </p>
    </div>
  );
}
