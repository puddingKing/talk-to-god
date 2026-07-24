import { NavLink, Outlet } from "react-router-dom";
import AppSidebar, { ChatIcon, GalleryIcon, ProfileIcon } from "./AppSidebar";

function MobileNavItem({
  to,
  end,
  label,
  icon: Icon,
  elevated,
}: {
  to: string;
  end?: boolean;
  label: string;
  icon: React.ComponentType<{ active: boolean }>;
  elevated?: boolean;
}) {
  if (elevated) {
    return (
      <NavLink to={to} className="relative -mt-5 flex flex-col items-center">
        {({ isActive }) => (
          <>
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-fab transition-transform ${
                isActive ? "bg-primary scale-105" : "bg-primary/90"
              } text-white`}
            >
              <Icon active />
            </div>
            <span className={`text-[10px] mt-1 ${isActive ? "text-primary font-medium" : "text-text-muted"}`}>
              {label}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${
          isActive ? "text-primary font-medium" : "text-text-muted"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="min-h-dvh bg-page-gradient">
      <AppSidebar />

      <div className="app-main">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="app-container">
            <Outlet />
          </div>
        </main>

        <nav className="app-mobile-nav md:hidden">
          <MobileNavItem to="/" end label="图鉴" icon={GalleryIcon} />
          <MobileNavItem to="/conversations" label="会话" icon={ChatIcon} elevated />
          <MobileNavItem to="/profile" label="我的" icon={ProfileIcon} />
        </nav>

        <p className="app-mobile-disclaimer md:hidden">
          内容由 AI 生成，观点不代表平台立场
        </p>
      </div>
    </div>
  );
}
