import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ConfirmActionModal } from "../ui";
import { Card } from "../ui";
import {
  getNotificationPresentation,
  getUnreadNotificationCount,
  getVisibleNotifications,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  subscribeDummyUpdates,
} from "../../data/dummy";

function playNotificationChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 784;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
    osc.onended = () => ctx.close();
  } catch {
    /* ignore */
  }
}

const allNavItems = [
  { label: "Dashboard",   icon: "⊞", path: "/", roles: ["student", "instructor", "employer", "admin"] },
  { label: "Projects",    icon: "◈", path: "/projects", roles: ["student", "instructor"] },
  { label: "Explore",     icon: "◎", path: "/explore", roles: ["student", "instructor", "employer","admin"] },
  { label: "Courses",    icon: "▤", path: "/courses", roles: ["admin", "instructor"] },
  { label: "Requests",    icon: "◧", path: "/admin/requests", roles: ["admin"] },
  { label: "Portfolio",   icon: "◉", path: "/profile", roles: ["student", "instructor", "employer"] },
  { label: "Internships", icon: "◐", path: "/internships", roles: ["student", "instructor", "employer"] },
  { label: "Messages",    icon: "◇", path: "/messages", roles: ["student", "instructor", "employer", "admin"] },
  { label: "Favorites",   icon: "★", path: "/favorites", roles: ["student", "employer"] },
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    <div className={`shrink-0 border-t border-border flex flex-col gap-1.5 ${collapsed ? "p-2" : "p-2.5"}`}>
      <div className={`group relative flex min-h-10 items-center rounded-lg text-text-primary text-sm w-full ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-1.5"}`}>
        <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">{roleEmoji[user?.role] || "👤"}</span>
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
          onClick={() => setShowLogoutConfirm(true)}
          className="flex min-h-9 items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors w-full text-left font-sans"
        >
          <span>⎋</span>
          <span>Logout</span>
        </button>
      )}

      <ConfirmActionModal
        isOpen={showLogoutConfirm}
        action="log out of your account"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        variant="danger"
      />
    </div>
  );
}

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const navItems = getNavItemsForRole(user?.role);
  const location = useLocation();
  const activeNavPath = location.state?.activeNav || location.pathname;
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(() =>
    getUnreadNotificationCount(user)
  );
  const bootstrapNotificationIdsRef = useRef(new Set());

  useEffect(() => {
    setUnreadNotificationCount(getUnreadNotificationCount(user));
  }, [user]);

  useEffect(() => {
    if (!user?.id) return undefined;

    bootstrapNotificationIdsRef.current = new Set(
      getVisibleNotifications(user).map((notification) => notification.id)
    );

    const syncUnread = () => {
      const visibleNow = getVisibleNotifications(user);
      setUnreadNotificationCount(
        visibleNow.filter((notification) => !notification.read).length
      );

      const boot = bootstrapNotificationIdsRef.current;

      const fresh = visibleNow.filter((notification) => !boot.has(notification.id));
      if (fresh.length === 0) return;

      fresh.forEach((notification) => {
        boot.add(notification.id);
      });

      const pick = [...fresh]
        .reverse()
        .find(
          (notification) =>
            !notification.read && notification.audience?.includes(user.role)
        );

      if (pick) {
        window.dispatchEvent(
          new CustomEvent("portfolio-toast-notification", {
            detail: {
              title: pick.title || "New notification",
              body: pick.text,
            },
          })
        );
        playNotificationChime();
      }
    };

    syncUnread();
    return subscribeDummyUpdates(syncUnread);
  }, [user?.id]);

  const unreadBadgeLabel = useMemo(() => {
    if (unreadNotificationCount <= 0) return null;
    if (unreadNotificationCount > 99) return "99+";
    return String(unreadNotificationCount);
  }, [unreadNotificationCount]);

  return (
    <div className="flex min-h-screen bg-bg-base">
      <aside
        className={`fixed inset-y-0 left-0 h-screen overflow-hidden bg-bg-surface border-r border-border flex flex-col z-40
          transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
      >
        {/* Logo */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-5 border-b border-border">
          <span className="text-accent-gold font-mono text-lg font-medium shrink-0">GP</span>
          {!collapsed && (
            <span className="font-display text-sm text-text-primary truncate">GUC Portfolio</span>
          )}
        </div>

        {/* Nav */}
        <nav className="min-h-0 flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2">
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
                <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                <SidebarTooltip collapsed={collapsed} label={item.label} />
              </Link>
            );
          })}
        </nav>

        {/* Notifications + Collapse */}
        <div className="shrink-0 border-t border-border p-2 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className={`group relative flex items-center rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors ${collapsed ? "justify-center px-0 py-2.5 w-full text-left font-sans" : "gap-3 px-3 py-2.5 w-full text-left font-sans"}`}
          >
            <span className="relative flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">
              <span aria-hidden="true">🔔</span>
              {unreadBadgeLabel !== null && (
                <span
                  className="absolute -top-1 -right-1 min-h-3.5 min-w-[0.875rem] px-[3px] bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono leading-none"
                  aria-live="polite"
                >
                  {unreadBadgeLabel}
                </span>
              )}
            </span>
            {!collapsed && <span>Notifications</span>}
            <SidebarTooltip collapsed={collapsed} label="Notifications" />
          </button>

          {notificationsOpen && (
            <NotificationsDock
              collapsed={collapsed}
              user={user}
              onClose={() => setNotificationsOpen(false)}
              onOpenFull={() => {
                navigate("/notifications");
                setNotificationsOpen(false);
              }}
              markRead={(notificationId) => {
                markNotificationReadForUser(notificationId, user);
              }}
              markAllRead={() => {
                markAllNotificationsReadForUser(user);
              }}
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`group relative flex items-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm w-full ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
          >
            <span className="flex h-5 w-7 shrink-0 items-center justify-center leading-none">{collapsed ? "→" : "←"}</span>
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
        <LiveNotificationToastBoundary />
        {children}
      </main>
    </div>
  );
}

function NotificationsDock({ collapsed, user, onClose, onOpenFull, markRead, markAllRead }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const leftOffsetPx = collapsed ? 72 : 224;
  const items = user ? getVisibleNotifications(user) : [];

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications overlay"
        className="fixed inset-0 z-[42] bg-black/35 lg:bg-black/25"
        onClick={onClose}
      />
      <div
        className="fixed z-[52]"
        style={{
          left: `max(14px, ${leftOffsetPx}px)`,
          top: "clamp(112px, 18vh, 180px)",
          width: "min(22rem,calc(100vw - 1.75rem))",
          maxHeight: "min(28rem,calc(100vh - 6rem))",
        }}
      >
        <Card className="shadow-2xl border-accent-gold/30 p-0 overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-bg-elevated/70">
            <div>
              <p className="font-display text-sm text-text-primary">Notifications</p>
              <p className="text-text-secondary text-[11px] font-sans leading-snug">
                Link and unlink requests, moderation, and account activity — same idea as your usual social feed.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close notifications window"
              onClick={onClose}
              className="shrink-0 rounded-md px-2 py-1 text-xl leading-none text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            >
              ×
            </button>
          </div>

          <div className="max-h-[20rem] overflow-y-auto divide-y divide-border">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-text-secondary font-sans">
                You&apos;re caught up.
              </div>
            ) : (
              items.map((notification) => {
                const vis = getNotificationPresentation(notification);
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 ${!notification.read ? "bg-accent-blue/[0.04]" : ""}`}
                  >
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base leading-none ${vis.bubble}`}
                      title={vis.label}
                    >
                      <span aria-hidden="true">{vis.glyph}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold font-sans text-text-primary leading-snug">
                        {notification.title || "Notification"}
                      </p>
                      <p className="text-sm font-sans text-text-secondary mt-1 leading-relaxed">{notification.text}</p>
                      <p className="text-[11px] font-mono text-text-secondary mt-1.5">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markRead(notification.id);
                        }}
                        className="shrink-0 text-[11px] font-sans uppercase tracking-wide text-accent-blue hover:underline self-center"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border bg-bg-base/95 px-3 py-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                markAllRead?.();
              }}
              className="flex-1 min-w-[7rem] rounded-lg border border-border px-3 py-2 text-xs font-sans text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onOpenFull}
              className="flex-1 min-w-[7rem] rounded-lg border border-accent-blue/60 px-3 py-2 text-xs font-sans text-accent-blue hover:bg-accent-blue/10 transition-colors"
            >
              Full inbox →
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function LiveNotificationToastBoundary() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      const payload = event?.detail || {};
      setToast({
        id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
        title: payload.title || "New notification",
        body: payload.body || "",
      });
    };
    window.addEventListener("portfolio-toast-notification", handler);
    return () => window.removeEventListener("portfolio-toast-notification", handler);
  }, []);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] w-full max-w-sm px-4">
      <Card className="pointer-events-auto border-accent-blue/40 shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-lg shrink-0" aria-hidden="true">
            🔔
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-display text-text-primary">{toast.title}</p>
            <p className="text-sm font-sans text-text-secondary mt-1 leading-snug">{toast.body}</p>
          </div>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToast(null)}
            className="shrink-0 rounded-md px-2 py-1 text-text-secondary hover:bg-bg-elevated hover:text-text-primary text-lg leading-none"
          >
            ×
          </button>
        </div>
      </Card>
    </div>
  );
}
