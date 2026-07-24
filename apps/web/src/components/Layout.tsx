import { NavLink, Outlet } from "react-router-dom";

function GalleryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9.5 12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 10h8M8 14h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.217-1.338A9.955 9.955 0 0012 22z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavItem({
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
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto bg-page-gradient">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/75 backdrop-blur-xl border-t border-white/60 shadow-nav flex items-end px-2 pb-safe">
        <NavItem to="/" end label="图鉴" icon={GalleryIcon} />
        <NavItem to="/conversations" label="会话" icon={ChatIcon} elevated />
        <NavItem to="/profile" label="我的" icon={ProfileIcon} />
      </nav>

      <p className="fixed bottom-[4.5rem] left-0 right-0 text-center text-[10px] text-text-light pointer-events-none">
        内容由 AI 生成，观点不代表平台立场
      </p>
    </div>
  );
}
