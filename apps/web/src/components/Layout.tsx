import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto bg-bg">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface border-t border-gray-200 flex">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-sm ${isActive ? "text-primary font-medium" : "text-text-muted"}`
          }
        >
          图鉴
        </NavLink>
        <NavLink
          to="/conversations"
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-sm ${isActive ? "text-primary font-medium" : "text-text-muted"}`
          }
        >
          会话
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-sm ${isActive ? "text-primary font-medium" : "text-text-muted"}`
          }
        >
          我的
        </NavLink>
      </nav>

      <p className="fixed bottom-16 left-0 right-0 text-center text-[10px] text-text-muted/60 pointer-events-none">
        内容由 AI 生成，观点不代表平台立场
      </p>
    </div>
  );
}
