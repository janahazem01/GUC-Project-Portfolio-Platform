import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { notifications } from "../../data/dummy";

const navItems = [
  { label: "Dashboard",   icon: "⊞", path: "/" },
  { label: "Projects",    icon: "◈", path: "/projects" },
  { label: "Explore",     icon: "◎", path: "/explore" },
  { label: "Portfolio",   icon: "◉", path: "/profile" },
  { label: "Internships", icon: "◐", path: "/internships" },
  { label: "Messages",    icon: "◇", path: "/messages" },
  { label: "Admin",       icon: "◆", path: "/admin" },
];

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-bg-surface border-r border-border flex flex-col z-40
        transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <span className="text-accent-gold font-mono text-lg font-medium shrink-0">GP</span>
        {!collapsed && (
          <span className="font-display text-sm text-text-primary truncate">GUC Portfolio</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors
                ${active
                  ? "bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: notifications + collapse */}
      <div className="border-t border-border p-2 flex flex-col gap-1">
        <Link
          to="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <span className="relative shrink-0">
            <span>🔔</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono">
                {unread}
              </span>
            )}
          </span>
          {!collapsed && <span>Notifications</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm w-full"
        >
          <span className="shrink-0">{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-56"} p-8 min-h-screen`}
      >
        {children}
      </main>
    </div>
  );
}
