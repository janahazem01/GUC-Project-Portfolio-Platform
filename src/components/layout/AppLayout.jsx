import { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getVisibleNotifications } from "../../data/dummy";
import { useProjects } from "../../context/ProjectsContext";

const allNavItems = [
  { label: "Dashboard",   icon: "⊞", path: "/", roles: ["student", "instructor", "employer", "admin"] },
  { label: "Projects",    icon: "◈", path: "/projects", roles: ["student", "instructor"] },
  { label: "Explore",     icon: "◎", path: "/explore", roles: ["student", "instructor", "employer","admin"] },
  { label: "Portfolio",   icon: "◉", path: "/profile", roles: ["student", "instructor", "employer"] },
  { label: "Internships", icon: "◐", path: "/internships", roles: ["student", "instructor"] },
  { label: "Requests",    icon: "R", path: "/requests", roles: ["student", "instructor"] },
  { label: "Messages",    icon: "◇", path: "/messages", roles: ["student", "instructor", "employer", "admin"] },
];

// Helper to get nav items for a specific role
const getNavItemsForRole = (role) => {
  return allNavItems.filter((item) => item.roles.includes(role));
};

function SidebarTooltip({ collapsed, label }) {
  if (!collapsed) return null;

  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-sans text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );
}

function UserMenu({ collapsed }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className={`border-t border-border flex flex-col gap-2 ${collapsed ? "p-2" : "p-3"}`}>
      <div className={`group relative flex items-center rounded-lg text-text-primary text-sm w-full ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"}`}>
        <span className="w-7 shrink-0 text-center text-base">{roleEmoji[user?.role] || "👤"}</span>
        {!collapsed && (
          <div className="flex-1 text-left truncate">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-text-secondary capitalize">{user?.role}</div>
          </div>
        )}
        <SidebarTooltip collapsed={collapsed} label={user?.name || "Profile"} />
      </div>
      
      {!collapsed && (
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
  const [notificationTick, setNotificationTick] = useState(0);
  const { user } = useContext(AuthContext);
  const { projectList } = useProjects();
  const navItems = getNavItemsForRole(user?.role);
  const notificationStateKey = `guc_notification_read_state_${user?.email || "guest"}`;
  const readState = (() => {
    try {
      return JSON.parse(localStorage.getItem(notificationStateKey) || "{}");
    } catch {
      return {};
    }
  })();
  const getEffectiveRead = (id, defaultRead) => readState[id] ?? defaultRead;

  useEffect(() => {
    const refreshNotificationState = () => setNotificationTick((value) => value + 1);
    window.addEventListener("storage", refreshNotificationState);
    window.addEventListener("guc-notifications-updated", refreshNotificationState);
    return () => {
      window.removeEventListener("storage", refreshNotificationState);
      window.removeEventListener("guc-notifications-updated", refreshNotificationState);
    };
  }, []);

  const unreadProjectInvitationCount = projectList.reduce((count, project) => {
    const instructorCount = (project.instructorInvitations || []).filter((invite) =>
      (invite.email === user?.email || invite.instructorName === user?.name) &&
      !getEffectiveRead(`project-invite-instructor-${project.id}-${invite.id}`, invite.status !== "no reply")
    ).length;
    const collaboratorCount = (project.collaboratorInvitations || []).filter((invite) =>
      (invite.email === user?.email || invite.collaboratorName === user?.name) &&
      !getEffectiveRead(`project-invite-collaborator-${project.id}-${invite.id}`, invite.status !== "no reply")
    ).length;

    return count + instructorCount + collaboratorCount;
  }, 0);
  const unreadBaseNotificationCount = getVisibleNotifications(user).filter((notification) =>
    !getEffectiveRead(notification.id, notification.read)
  ).length;
  void notificationTick;
  const unreadNotificationCount = unreadBaseNotificationCount + unreadProjectInvitationCount;
  const location = useLocation();
  const activeNavPath = location.state?.activeNav || (location.pathname.startsWith("/admin") ? "/" : location.pathname);

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
            const active = activeNavPath === item.path ||
              (item.path !== "/" && activeNavPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center rounded-lg text-sm font-sans transition-colors ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                  ${active
                    ? "bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
              >
                <span className="w-7 shrink-0 text-center text-base">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                <SidebarTooltip collapsed={collapsed} label={item.label} />
              </Link>
            );
          })}
        </nav>

        {/* Notifications + Collapse */}
        <div className="border-t border-border p-2 flex flex-col gap-1">
          <Link
            to="/notifications"
            className={`group relative flex items-center rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
          >
            <span className="relative w-7 shrink-0 text-center">
              <span>🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono">
                  {unreadNotificationCount}
                </span>
              )}
            </span>
            {!collapsed && <span>Notifications</span>}
            <SidebarTooltip collapsed={collapsed} label="Notifications" />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`group relative flex items-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm w-full ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
          >
            <span className="w-7 shrink-0 text-center">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
            <SidebarTooltip collapsed={collapsed} label={collapsed ? "Expand" : "Collapse"} />
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

