import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAdminKey } from "../lib/admin";

const NAV = [
  { to: "/admin/philosophers", label: "哲学家", match: "/admin/philosophers" },
  { to: "/admin/users", label: "用户", match: "/admin/users" },
];

export default function AdminLayout({
  title,
  subtitle,
  children,
  action,
  backTo,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  backTo?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminKey();
    navigate("/admin");
  };

  const isActive = (match: string) =>
    location.pathname === match || location.pathname.startsWith(`${match}/`);

  return (
    <div className="min-h-dvh bg-page-gradient flex">
      {/* PC 侧栏 */}
      <aside className="admin-sidebar">
        <div className="px-2 mb-8">
          <p className="font-semibold text-accent text-lg">后台管理</p>
          <p className="text-xs text-text-muted mt-1">与哲对话 CMS</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive(item.match)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-muted hover:bg-white/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 pt-4 border-t border-white/60">
          <Link to="/" className="block px-3 py-2 text-sm text-text-muted hover:text-primary">
            ← 返回前台
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-left text-text-muted hover:text-red-500"
          >
            退出登录
          </button>
        </div>
      </aside>

      <div className="admin-main">
        {/* 移动端顶栏 */}
        <div className="admin-mobile-header md:hidden">
          <div>
            <h1 className="text-lg font-bold text-accent">后台管理</h1>
            <p className="text-xs text-text-muted">与哲对话</p>
          </div>
          <button onClick={handleLogout} className="admin-btn-ghost">
            退出
          </button>
        </div>

        {/* 移动端 Tab */}
        <nav className="admin-mobile-tabs md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 py-2 text-sm text-center rounded-lg ${
                isActive(item.match) ? "bg-surface shadow-sm text-primary font-medium" : "text-text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* PC 顶栏 */}
        <header className="admin-desktop-header">
          <div>
            {backTo && (
              <Link to={backTo} className="text-sm text-text-muted hover:text-primary mb-1 inline-block">
                ← 返回列表
              </Link>
            )}
            <h2 className="text-xl font-semibold text-text">{title}</h2>
            {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </header>

        {/* 移动端页面标题 */}
        <div className="admin-mobile-title md:hidden">
          {backTo && (
            <Link to={backTo} className="text-sm text-text-muted mb-2 inline-block">
              ← 返回
            </Link>
          )}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text">{title}</h2>
              {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            {action}
          </div>
        </div>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
