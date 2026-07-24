import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAdminKey } from "../lib/admin";

const NAV = [
  { to: "/admin/philosophers", label: "哲学家" },
  { to: "/admin/users", label: "用户" },
];

export default function AdminLayout({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminKey();
    navigate("/admin");
  };

  return (
    <div className="min-h-dvh bg-bg max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-accent">后台管理</h1>
          <p className="text-xs text-text-muted mt-0.5">与哲对话</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-text-muted"
        >
          退出
        </button>
      </div>

      <nav className="flex gap-1 p-1 mb-6 bg-gray-100 rounded-lg">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 py-2 text-sm text-center rounded-md transition-colors ${
              location.pathname.startsWith(item.to)
                ? "bg-surface shadow-sm text-primary font-medium"
                : "text-text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>

      {children}
    </div>
  );
}
