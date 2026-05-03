import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../data/dummy";

const allNavItems = [
  { label: "Dashboard",   icon: "⊞", path: "/", roles: ["student", "instructor", "employer", "admin"] },
  { label: "Projects",    icon: "◈", path: "/projects", roles: ["student", "instructor"] },
  { label: "Explore",     icon: "◎", path: "/explore", roles: ["student", "instructor", "employer"] },
  { label: "Portfolio",   icon: "◉", path: "/profile", roles: ["student", "instructor", "employer"] },
  { label: "Internships", icon: "◐", path: "/internships", roles: ["student", "instructor"] },
  { label: "Messages",    icon: "◇", path: "/messages", roles: ["student", "instructor", "employer", "admin"] },
  { label: "Admin",       icon: "◆", path: "/admin", roles: ["admin"] },
];

// Helper to get nav items for a specific role
const getNavItemsForRole = (role) => {
  return allNavItems.filter((item) => item.roles.includes(role));
};

function UserMenu({ collapsed }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleEmoji = {
    student: "📚",
    instructor: "🎓",
    employer: "🏢",
    admin: "👨‍💼"
  };

  return (
    <div className="border-t border-border p-3 flex flex-col gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors text-text-primary text-sm w-full"
      >
        <span className="text-base">{roleEmoji[user?.role] || "👤"}</span>
        {!collapsed && (
          <div className="flex-1 text-left truncate">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-text-secondary capitalize">{user?.role}</div>
          </div>
        )}
        {!collapsed && <span className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>}
      </button>
      
      {isOpen && !collapsed && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors w-full text-left font-sans"
        >
          <span>⎋</span>
          <span>Logout</span>
        </button>
      )}
    </div>
  );
}

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useContext(AuthContext);
  const navItems = getNavItemsForRole(user?.role);
  const unreadNotificationCount = getUnreadNotificationCount(user);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-bg-base">
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

        {/* Notifications + Collapse */}
        <div className="border-t border-border p-2 flex flex-col gap-1">
          <Link
            to="/notifications"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <span className="relative shrink-0">
              <span>🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono">
                  {unreadNotificationCount}
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

        {/* User Profile */}
        <UserMenu collapsed={collapsed} />
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-56"} p-8 min-h-screen`}
      >
        {children}
      </main>
    </div>
  );
}
