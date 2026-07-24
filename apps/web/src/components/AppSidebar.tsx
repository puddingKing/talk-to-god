import { NavLink } from "react-router-dom";

const LOGO_URL =
  "https://lhcos-bc64d-1325353783.cos.ap-beijing.myqcloud.com/talk-to-god/logo_min.png";

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

function SidebarNavItem({
  to,
  end,
  label,
  icon: Icon,
}: {
  to: string;
  end?: boolean;
  label: string;
  icon: React.ComponentType<{ active: boolean }>;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
          isActive ? "bg-primary/10 text-primary font-medium" : "text-text-muted hover:bg-white/60"
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

export default function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <div className="flex items-center gap-3 px-2 mb-8">
        <img src={LOGO_URL} alt="与哲对话" className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
        <div>
          <p className="font-semibold text-accent leading-tight">与哲对话</p>
          <p className="text-[11px] text-text-muted">哲学思辨 AI</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <SidebarNavItem to="/" end label="哲学家图鉴" icon={GalleryIcon} />
        <SidebarNavItem to="/conversations" label="我的会话" icon={ChatIcon} />
        <SidebarNavItem to="/profile" label="我的" icon={ProfileIcon} />
      </nav>

      <p className="text-[10px] text-text-light leading-relaxed px-2 mt-6">
        内容由 AI 生成，观点不代表平台立场
      </p>
    </aside>
  );
}

export { GalleryIcon, ChatIcon, ProfileIcon };
