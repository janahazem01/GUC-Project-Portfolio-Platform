// import { useEffect, useState, useContext, useRef, useMemo } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";
// import { useProjects } from "../../context/ProjectsContext";
// import { ConfirmActionModal } from "../ui";
// import { Card } from "../ui";
// import {
//   getNotificationActionPath,
//   getNotificationPresentation,
//   getUnreadNotificationCount,
//   getUnreadInboundThreadTotal,
//   getVisibleNotifications,
//   markAllNotificationsReadForUser,
//   markNotificationReadForUser,
//   subscribeDummyUpdates,
// } from "../../data/dummy";
// import { readDoNotDisturb, writeDoNotDisturb } from "../../utils/doNotDisturb";

// function navigateStateForPath(path) {
//   if (!path) return undefined;
//   if (path.startsWith("/projects/")) return { activeNav: "/projects" };
//   if (path.startsWith("/courses")) return { activeNav: "/courses" };
//   if (path.startsWith("/internships/")) return { activeNav: "/internships" };
//   if (path.startsWith("/messages")) return { activeNav: "/messages" };
//   return { activeNav: path };
// }

// function playNotificationChime() {
//   try {
//     const Ctx = window.AudioContext || window.webkitAudioContext;
//     if (!Ctx) return;
//     const ctx = new Ctx();
//     const osc = ctx.createOscillator();
//     const gain = ctx.createGain();
//     osc.type = "sine";
//     osc.frequency.value = 784;
//     gain.gain.setValueAtTime(0.001, ctx.currentTime);
//     gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
//     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);
//     osc.connect(gain);
//     gain.connect(ctx.destination);
//     osc.start(ctx.currentTime);
//     osc.stop(ctx.currentTime + 0.28);
//     osc.onended = () => ctx.close();
//   } catch {
//     /* ignore */
//   }
// }

// const allNavItems = [
//   { label: "Dashboard",   icon: "⊞", path: "/", roles: ["student", "instructor", "employer", "admin"] },
//   { label: (role) => (role === "student" ? "My Projects" : "Projects"), icon: "◈", path: "/projects", roles: ["student", "instructor"] },
//   { label: "Tasks",       icon: "T", path: "/tasks", roles: ["student", "instructor"] },
//   { label: "Explore",     icon: "◎", path: "/explore", roles: ["student", "instructor", "employer","admin"] },
//   { label: "Instructors", icon: "👨‍🏫", path: "/instructors", roles: ["student", "instructor", "employer", "admin"] },
//   { label: "Internships", icon: "◐", path: "/internships", roles: ["student", "instructor","employer"] },
//   { label: "Requests", icon: "✉", path: "/requests", roles: ["student", "instructor", "admin"] },
//   { label: "Courses",    icon: "▤", path: "/courses", roles: ["admin", "instructor"] },
//   { label: "Messages",    icon: "💬", path: "/messages", roles: ["student", "instructor", "employer"] },
//   { label: "Favorites",   icon: "★", path: "/favorites", roles: ["student", "employer"] },
// ];

// const getNavItemsForRole = (role) => {
//   return allNavItems.filter((item) => item.roles.includes(role));
// };

// function SidebarTooltip({ collapsed, label }) {
//   if (!collapsed) return null;

//   return (
//     <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-sans text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
//       {label}
//     </span>
//   );
// }

// function UserMenu({ collapsed }) {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const roleEmoji = {
//     student: "📚",
//     instructor: "🎓",
//     employer: "🏢",
//     admin: "👨‍💼"
//   };

//   const profileLabel = user?.role === "employer" ? "Profile" : "Portfolio";

//   return (
//     <div className={`shrink-0 border-t border-border flex flex-col gap-1.5 overflow-hidden ${collapsed ? "p-2" : "p-2.5"}`}>
//       <button
//         type="button"
//         onClick={() => navigate("/profile")}
//         className={`group relative flex min-h-10 items-center rounded-lg text-text-primary text-sm w-full hover:bg-bg-elevated transition-colors ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-1.5 text-left"}`}
//       >
//         <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 border border-accent-blue/20 overflow-hidden text-lg">
//           {(user?.avatar || user?.logo) ? (
//             <img src={user.avatar || user.logo} alt="Avatar" className="w-full h-full object-cover" />
//           ) : (
//             <span className="leading-none">{roleEmoji[user?.role] || "👤"}</span>
//           )}
//         </div>
//         {!collapsed && (
//           <div className="flex-1 text-left truncate min-w-0">
//             <div className="text-sm font-medium truncate">{user?.name}</div>
//             <div className="text-xs text-text-secondary capitalize">{user?.role}</div>
//           </div>
//         )}
//         <SidebarTooltip collapsed={collapsed} label={profileLabel} />
//       </button>
      
//       <button
//         type="button"
//         onClick={() => setShowLogoutConfirm(true)}
//         className={`group relative flex items-center rounded-lg text-xs transition-colors w-full text-left font-sans ${collapsed ? "justify-center px-0 py-2.5 text-text-secondary hover:text-danger hover:bg-danger/10" : "gap-3 px-3 py-1.5 text-danger hover:bg-danger/10"}`}
//       >
//         <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">⎋</span>
//         {!collapsed && <span className="truncate">Logout</span>}
//         <SidebarTooltip collapsed={collapsed} label="Logout" />
//       </button>

//       <ConfirmActionModal
//         isOpen={showLogoutConfirm}
//         action="log out of your account"
//         onClose={() => setShowLogoutConfirm(false)}
//         onConfirm={handleLogout}
//         variant="danger"
//       />
//     </div>
//   );
// }

// export function AppLayout({ children }) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const [notificationTick, setNotificationTick] = useState(0);
//   const { user } = useContext(AuthContext);
//   const { projectList } = useProjects();
//   const navigate = useNavigate();
//   const navItems = getNavItemsForRole(user?.role);
//   const location = useLocation();
//   const activeNavPath = location.state?.activeNav || (location.pathname.startsWith("/admin") ? "/" : location.pathname);

//   const bootstrapNotificationIdsRef = useRef(new Set());
//   const [, setDoNotDisturbBump] = useState(0);
//   const doNotDisturb = readDoNotDisturb();
//   const canUseDoNotDisturb = ["student", "employer", "instructor"].includes(user?.role);

//   // --- HEAD branch: project-invitation unread counts via localStorage read state ---
//   const notificationStateKey = `guc_notification_read_state_${user?.email || "guest"}`;
//   const readState = (() => {
//     try {
//       return JSON.parse(localStorage.getItem(notificationStateKey) || "{}");
//     } catch {
//       return {};
//     }
//   })();
//   const getEffectiveRead = (id, defaultRead) => readState[id] ?? defaultRead;

//   // Refresh when storage or custom event fires (HEAD branch)
//   useEffect(() => {
//     const refreshNotificationState = () => setNotificationTick((value) => value + 1);
//     window.addEventListener("storage", refreshNotificationState);
//     window.addEventListener("guc-notifications-updated", refreshNotificationState);
//     return () => {
//       window.removeEventListener("storage", refreshNotificationState);
//       window.removeEventListener("guc-notifications-updated", refreshNotificationState);
//     };
//   }, []);

//   const unreadProjectInvitationCount = projectList.reduce((count, project) => {
//     const instructorCount = (project.instructorInvitations || []).filter((invite) =>
//       (invite.email === user?.email || invite.instructorName === user?.name) &&
//       !getEffectiveRead(`project-invite-instructor-${project.id}-${invite.id}`, invite.status !== "no reply")
//     ).length;
//     const collaboratorCount = (project.collaboratorInvitations || []).filter((invite) =>
//       (invite.email === user?.email || invite.collaboratorName === user?.name) &&
//       !getEffectiveRead(`project-invite-collaborator-${project.id}-${invite.id}`, invite.status !== "no reply")
//     ).length;

//     return count + instructorCount + collaboratorCount;
//   }, 0);

//   // --- Incoming branch: live subscription, DM badge, toast chimes ---
//   const [unreadNotificationCount, setUnreadNotificationCount] = useState(() =>
//     getUnreadNotificationCount(user)
//   );
//   const [unreadDmTotal, setUnreadDmTotal] = useState(() => getUnreadInboundThreadTotal(user));

//   useEffect(() => {
//     if (!user?.id) return undefined;

//     bootstrapNotificationIdsRef.current = new Set(
//       getVisibleNotifications(user).map((notification) => notification.id)
//     );

//     const syncUnread = () => {
//       const visibleNow = getVisibleNotifications(user);
//       setUnreadNotificationCount(
//         visibleNow.filter((notification) => !getEffectiveRead(notification.id, notification.read)).length
//       );
//       setUnreadDmTotal(getUnreadInboundThreadTotal(user));

//       const boot = bootstrapNotificationIdsRef.current;
//       const fresh = visibleNow.filter((notification) => !boot.has(notification.id));
//       if (fresh.length === 0) return;

//       fresh.forEach((notification) => {
//         boot.add(notification.id);
//       });

//       const pick = [...fresh]
//         .reverse()
//         .find(
//           (notification) =>
//             !getEffectiveRead(notification.id, notification.read) &&
//             notification.audience?.includes(user.role)
//         );

//       const mutePopups =
//         ["student", "employer", "instructor"].includes(user?.role) && readDoNotDisturb();

//       if (pick && !mutePopups) {
//         window.dispatchEvent(
//           new CustomEvent("portfolio-toast-notification", {
//             detail: {
//               title: pick.title || "New notification",
//               body: pick.text,
//               dismissSessionKey: `portfolio-notif-toast-${pick.id}`,
//             },
//           })
//         );
//         playNotificationChime();
//       }
//     };

//     syncUnread();
//     return subscribeDummyUpdates(syncUnread);
//   }, [user, notificationTick]); // notificationTick re-syncs when storage/custom events fire

//   const toggleDoNotDisturb = () => {
//     const next = !readDoNotDisturb();
//     writeDoNotDisturb(next);
//     setDoNotDisturbBump((value) => value + 1);
//   };

//   // Combined unread count: live base count + project invitation count
//   const totalUnreadNotificationCount = unreadNotificationCount + unreadProjectInvitationCount;

//   const unreadBadgeLabel = useMemo(() => {
//     if (doNotDisturb) return null;
//     if (totalUnreadNotificationCount <= 0) return null;
//     if (totalUnreadNotificationCount > 99) return "99+";
//     return String(totalUnreadNotificationCount);
//   }, [totalUnreadNotificationCount, doNotDisturb]);

//   return (
//     <div className="flex min-h-screen bg-bg-base">
//       <aside
//         className={`fixed inset-y-0 left-0 h-screen overflow-hidden bg-bg-surface border-r border-border flex flex-col z-40 select-none
//           transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
//       >
//         {/* Logo */}
//         <div className="shrink-0 flex items-center gap-3 px-4 py-5 border-b border-border overflow-hidden">
//           <span className="text-accent-gold font-mono text-lg font-medium shrink-0">GP</span>
//           {!collapsed && (
//             <span className="font-display text-sm text-text-primary truncate min-w-0">GUC Portal</span>
//           )}
//         </div>

//         {/* Nav */}
//         <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-4 flex flex-col gap-1 px-2">
//           {navItems.map((item) => {
//             const active = activeNavPath === item.path ||
//               (item.path !== "/" && activeNavPath.startsWith(item.path));
//             const showUnreadDmCue =
//               item.path === "/messages" && unreadDmTotal > 0 && !(canUseDoNotDisturb && doNotDisturb);
//             const labelText = typeof item.label === "function" ? item.label(user?.role) : item.label;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`group relative flex items-center rounded-lg text-sm font-sans transition-colors ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
//                   ${active
//                     ? "bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold"
//                     : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
//                   }`}
//               >
//                 <span className="relative flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">
//                   <span aria-hidden="true">{item.icon}</span>
//                   {showUnreadDmCue && (
//                     <abbr
//                       title="Unread messages"
//                       className="absolute -top-1.5 -right-0 text-[13px] font-bold text-danger no-underline leading-none"
//                       aria-label="Unread messages"
//                     >
//                       !
//                     </abbr>
//                   )}
//                 </span>
//                 {!collapsed && <span className="truncate">{labelText}</span>}
//                 <SidebarTooltip collapsed={collapsed} label={labelText} />
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Do not disturb + Notifications + Collapse */}
//         <div className="shrink-0 border-t border-border p-2 flex flex-col gap-1 overflow-hidden">
//           {canUseDoNotDisturb && (
//             <button
//               type="button"
//               onClick={toggleDoNotDisturb}
//               aria-pressed={doNotDisturb}
//               title={doNotDisturb ? "Turn off Do not disturb" : "Do not disturb — mute notification pop-ups and sounds"}
//               className={`group relative flex items-center rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2.5 w-full text-left font-sans" : "gap-3 px-3 py-2.5 w-full text-left font-sans"} ${
//                 doNotDisturb
//                   ? "text-accent-gold bg-accent-gold/10 border border-accent-gold/35"
//                   : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
//               }`}
//             >
//               <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
//                 {doNotDisturb ? "🌙" : "☾"}
//               </span>
//               {!collapsed && (
//                 <span className="truncate">{doNotDisturb ? "Do not disturb on" : "Do not disturb"}</span>
//               )}
//               <SidebarTooltip collapsed={collapsed} label={doNotDisturb ? "Notifications muted" : "Mute notifications"} />
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={() => setNotificationsOpen((open) => !open)}
//             className={`group relative flex items-center rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors ${collapsed ? "justify-center px-0 py-2.5 w-full text-left font-sans" : "gap-3 px-3 py-2.5 w-full text-left font-sans"} ${
//               doNotDisturb && canUseDoNotDisturb ? "opacity-60" : ""
//             }`}
//             title={doNotDisturb && canUseDoNotDisturb ? "Notifications muted (Do not disturb)" : undefined}
//           >
//             <span className="relative flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">
//               <span aria-hidden="true">🔔</span>
//               {unreadBadgeLabel !== null && (
//                 <span
//                   className="absolute -top-1 -right-1 min-h-3.5 min-w-[0.875rem] px-[3px] bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono leading-none"
//                   aria-live="polite"
//                 >
//                   {unreadBadgeLabel}
//                 </span>
//               )}
//             </span>
//             {!collapsed && <span>Notifications</span>}
//             <SidebarTooltip collapsed={collapsed} label="Notifications" />
//           </button>

//           {notificationsOpen && (
//             <NotificationsDock
//               collapsed={collapsed}
//               user={user}
//               navigate={navigate}
//               onClose={() => setNotificationsOpen(false)}
//               onOpenFull={() => {
//                 navigate("/notifications");
//                 setNotificationsOpen(false);
//               }}
//               markRead={(notificationId) => {
//                 markNotificationReadForUser(notificationId, user);
//               }}
//               markAllRead={() => {
//                 markAllNotificationsReadForUser(user);
//               }}
//               blurContent={Boolean(canUseDoNotDisturb && doNotDisturb)}
//             />
//           )}
//           <button
//             onClick={() => setCollapsed(!collapsed)}
//             className={`group relative flex items-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm w-full ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
//           >
//             <span className="flex h-5 w-7 shrink-0 items-center justify-center leading-none">{collapsed ? "→" : "←"}</span>
//             {!collapsed && <span>Collapse</span>}
//             <SidebarTooltip collapsed={collapsed} label={collapsed ? "Expand" : "Collapse"} />
//           </button>
//         </div>

//         {/* User Profile */}
//         <UserMenu collapsed={collapsed} />
//       </aside>

//       <main
//         className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-56"} p-8 min-h-screen`}
//       >
//         <LiveNotificationToastBoundary />
//         {children}
//       </main>
//     </div>
//   );
// }

// function NotificationsDock({ collapsed, user, navigate, onClose, onOpenFull, markRead, markAllRead, blurContent }) {
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "Escape") onClose?.();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose]);

//   const leftOffsetPx = collapsed ? 72 : 224;
//   const items = user ? getVisibleNotifications(user) : [];

//   return (
//     <>
//       <button
//         type="button"
//         aria-label="Close notifications overlay"
//         className="fixed inset-0 z-[42] bg-black/35 lg:bg-black/25"
//         onClick={onClose}
//       />
//       <div
//         className="fixed z-[52]"
//         style={{
//           left: `max(14px, ${leftOffsetPx}px)`,
//           top: "clamp(112px, 18vh, 180px)",
//           width: "min(22rem,calc(100vw - 1.75rem))",
//           maxHeight: "min(28rem,calc(100vh - 6rem))",
//         }}
//       >
//         <Card className="shadow-2xl border-accent-gold/30 p-0 overflow-hidden">
//           <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-bg-elevated/70">
//             <div>
//               <p className="font-display text-sm text-text-primary">Notifications</p>
//               <p className="text-text-secondary text-[11px] font-sans leading-snug">
//                 Link and unlink requests, moderation, and account activity — same idea as your usual social feed.
//               </p>
//             </div>
//             <button
//               type="button"
//               aria-label="Close notifications window"
//               onClick={onClose}
//               className="shrink-0 rounded-md px-2 py-1 text-xl leading-none text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
//             >
//               ×
//             </button>
//           </div>

//           <div
//             className={`max-h-[20rem] overflow-y-auto divide-y divide-border ${
//               blurContent ? "blur-md pointer-events-none select-none opacity-70" : ""
//             }`}
//           >
//             {items.length === 0 ? (
//               <div className="px-4 py-10 text-center text-sm text-text-secondary font-sans">
//                 You&apos;re caught up.
//               </div>
//             ) : (
//               items.map((notification) => {
//                 const vis = getNotificationPresentation(notification);
//                 const actionPath = getNotificationActionPath(notification);
//                 const rowInteractive = Boolean(actionPath);
//                 return (
//                   <div
//                     key={notification.id}
//                     role={rowInteractive ? "link" : undefined}
//                     tabIndex={rowInteractive ? 0 : undefined}
//                     onKeyDown={
//                       rowInteractive
//                         ? (event) => {
//                             if (event.key === "Enter" || event.key === " ") {
//                               event.preventDefault();
//                               markRead(notification.id);
//                               navigate(actionPath, { state: navigateStateForPath(actionPath) });
//                               onClose?.();
//                             }
//                           }
//                         : undefined
//                     }
//                     onClick={
//                       rowInteractive
//                         ? () => {
//                             markRead(notification.id);
//                             navigate(actionPath, { state: navigateStateForPath(actionPath) });
//                             onClose?.();
//                           }
//                         : undefined
//                     }
//                     className={`flex items-start gap-3 px-4 py-3 ${!notification.read ? "bg-accent-blue/[0.04]" : ""} ${
//                       rowInteractive ? "cursor-pointer hover:bg-bg-elevated/80" : ""
//                     }`}
//                   >
//                     <div
//                       className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base leading-none ${vis.bubble}`}
//                       title={vis.label}
//                     >
//                       <span aria-hidden="true">{vis.glyph}</span>
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-sm font-semibold font-sans text-text-primary leading-normal break-words">
//                         {notification.title || "Notification"}
//                       </p>
//                       <p className="text-sm font-sans text-text-secondary mt-1 leading-relaxed break-words">
//                         {notification.text}
//                       </p>
//                       <p className="text-[11px] font-mono text-text-secondary mt-1.5">{notification.time}</p>
//                     </div>
//                     {!notification.read && (
//                       <button
//                         type="button"
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           markRead(notification.id);
//                         }}
//                         className="shrink-0 text-[11px] font-sans uppercase tracking-wide text-accent-blue hover:underline self-center"
//                       >
//                         Mark read
//                       </button>
//                     )}
//                   </div>
//                 );
//               })
//             )}
//           </div>

//           <div
//             className={`flex flex-wrap gap-2 border-t border-border bg-bg-base/95 px-3 py-3 ${
//               blurContent ? "blur-md pointer-events-none select-none opacity-70" : ""
//             }`}
//           >
//             <button
//               type="button"
//               onClick={(event) => {
//                 event.stopPropagation();
//                 markAllRead?.();
//               }}
//               className="flex-1 min-w-[7rem] rounded-lg border border-border px-3 py-2 text-xs font-sans text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
//             >
//               Mark all read
//             </button>
//             <button
//               type="button"
//               onClick={onOpenFull}
//               className="flex-1 min-w-[7rem] rounded-lg border border-accent-blue/60 px-3 py-2 text-xs font-sans text-accent-blue hover:bg-accent-blue/10 transition-colors"
//             >
//               Full inbox →
//             </button>
//           </div>
//         </Card>
//       </div>
//     </>
//   );
// }

// function toastSessionStorageKey(title, body) {
//   const s = `${title}|${body}`;
//   let hash = 0;
//   for (let i = 0; i < s.length; i += 1) {
//     hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
//   }
//   return `portfolio-toast-${hash}`;
// }

// function LiveNotificationToastBoundary() {
//   const { user } = useContext(AuthContext);
//   const [toast, setToast] = useState(null);
//   const dndApplies = ["student", "employer", "instructor"].includes(user?.role);

//   const clearToast = (persistDismiss) => {
//     setToast((current) => {
//       if (persistDismiss && current?.dismissSessionKey) {
//         try {
//           sessionStorage.setItem(current.dismissSessionKey, "1");
//         } catch {
//           /* ignore */
//         }
//       }
//       return null;
//     });
//   };

//   useEffect(() => {
//     const handler = (event) => {
//       if (readDoNotDisturb()) return;
//       const payload = event?.detail || {};
//       const title = payload.title || "New notification";
//       const body = payload.body || "";
//       const sessionKey = payload.dismissSessionKey || toastSessionStorageKey(title, body);
//       if (typeof window !== "undefined") {
//         try {
//           if (window.sessionStorage.getItem(sessionKey)) return;
//         } catch {
//           /* ignore */
//         }
//       }
//       setToast({
//         id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
//         title,
//         body,
//         dismissSessionKey: sessionKey,
//       });
//     };
//     window.addEventListener("portfolio-toast-notification", handler);
//     return () => window.removeEventListener("portfolio-toast-notification", handler);
//   }, [dndApplies]);

//   if (!toast) return null;

//   return (
//     <div className="pointer-events-none fixed bottom-6 right-6 z-[60] w-full max-w-md px-4">
//       <Card className="pointer-events-auto border-accent-blue/40 shadow-2xl p-4 max-h-[min(22rem,50vh)] overflow-y-auto">
//         <div className="flex items-start gap-3">
//           <div className="mt-0.5 text-lg shrink-0" aria-hidden="true">
//             🔔
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-sm font-display text-text-primary leading-normal break-words">{toast.title}</p>
//             <p className="text-sm font-sans text-text-secondary mt-1.5 leading-relaxed break-words">{toast.body}</p>
//             <button
//               type="button"
//               onClick={() => clearToast(true)}
//               className="pointer-events-auto mt-3 text-xs font-sans font-medium text-accent-blue hover:underline"
//             >
//               Dismiss
//             </button>
//           </div>
//           <button
//             type="button"
//             aria-label="Close notification"
//             onClick={() => clearToast(true)}
//             className="shrink-0 rounded-md px-2 py-1 text-text-secondary hover:bg-bg-elevated hover:text-text-primary text-lg leading-none"
//           >
//             ×
//           </button>
//         </div>
//       </Card>
//     </div>
//   );
// }

import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useProjects } from "../../context/ProjectsContext";
import { ConfirmActionModal, Toast } from "../ui";
import { Card } from "../ui";
import {
  getNotificationActionPath,
  getNotificationPresentation,
  getUnreadNotificationCount,
  getUnreadInboundThreadTotal,
  sortNotificationsNewestFirst,
  getVisibleNotifications,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  subscribeDummyUpdates,
  portfolios,
  instructorDirectory,
} from "../../data/dummy";
import { readDoNotDisturb, writeDoNotDisturb } from "../../utils/doNotDisturb";
import { ProjectTitleLink } from "../ProjectTitleLink";

function navigateStateForPath(path) {
  if (!path) return undefined;
  if (path.startsWith("/projects/")) return { activeNav: "/projects" };
  if (path.startsWith("/courses")) return { activeNav: "/courses" };
  if (path.startsWith("/internships/")) return { activeNav: "/internships" };
  if (path.startsWith("/messages")) return { activeNav: "/messages" };
  return { activeNav: path };
}

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

const navCategories = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", icon: "⊞", path: "/", roles: ["student", "instructor", "employer", "admin"] },
      { label: "Statistics", icon: "📊", path: "/admin/statistics", roles: ["admin"] },
    ],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { label: (role) => (role === "student" ? "My Projects" : "Projects"), icon: "◈", path: "/projects", roles: ["student", "instructor"] },
      { label: "Tasks", icon: "T", path: "/tasks", roles: ["student"] },
      { label: "Courses", icon: "▤", path: "/courses", roles: ["instructor"] },
    ],
  },
  {
    id: "discover",
    label: "Discover",
    items: [
      { label: "Explore", icon: "◎", path: "/explore", roles: ["student", "instructor", "employer", "admin"] },
      { label: "Instructors", icon: "👨‍🏫", path: "/instructors", roles: ["student", "instructor", "employer", "admin"] },
      { label: "Internships", icon: "◐", path: "/internships", roles: ["student", "employer"] },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    items: [
      { label: "Messages", icon: "💬", path: "/messages", roles: ["student", "instructor", "employer"] },
      { label: (role) => (role === "admin" ? "Requests" : "Invitations"), icon: "✉", path: "/requests", roles: ["student", "instructor", "admin"] },
      { label: "Favorites", icon: "★", path: "/favorites", roles: ["student", "employer"] },
    ],
  },
  {
    id: "admin-catalog",
    label: "Catalog",
    items: [
      { navId: "admin-users", label: "Users", icon: "👥", path: "/admin/users", roles: ["admin"] },
      { navId: "admin-courses", label: "Courses", icon: "▤", path: "/courses", roles: ["admin"] },
      { navId: "admin-projects-data", label: "Projects", icon: "🖥", path: "/admin/projects", roles: ["admin"] },
    ],
  },
  {
    id: "admin-employers",
    label: "Employers",
    items: [
      { navId: "admin-employer-accounts", label: "Employers", icon: "💼", path: "/admin/employers", roles: ["admin"] },
      { navId: "admin-approvals", label: "Approvals", icon: "✓", path: "/admin/approvals", roles: ["admin"] },
    ],
  },
  {
    id: "admin-review",
    label: "Review",
    items: [
      { navId: "admin-appeals", label: "Appeals", icon: "✉", path: "/admin/appeals", roles: ["admin"] },
      { navId: "admin-flagged", label: "Flagged", icon: "!", path: "/admin/flagged", roles: ["admin"] },
    ],
  },
  {
    id: "admin-access",
    label: "Administrators",
    items: [
      { navId: "admin-create", label: "Create Admin", icon: "➕", path: "/admin", search: "modal=create", roles: ["admin"] },
      { navId: "admin-account-mgmt", label: "Account Management", icon: "🔒", path: "/admin/account-management", roles: ["admin"] },
    ],
  },
];

function getNavGroupsForRole(role) {
  if (!role) return [];
  return navCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((cat) => cat.items.length > 0);
}

function normalizePathname(pathname) {
  if (!pathname) return "/";
  return pathname.replace(/\/$/, "") || "/";
}

function searchParamsMatchAll(locationSearch, itemSearch) {
  if (!itemSearch) return true;
  const loc = new URLSearchParams(locationSearch.startsWith("?") ? locationSearch.slice(1) : locationSearch);
  const want = new URLSearchParams(itemSearch.startsWith("?") ? itemSearch.slice(1) : itemSearch);
  for (const [key, value] of want.entries()) {
    if (loc.get(key) !== value) return false;
  }
  return true;
}

function isNavItemActive(item, location, activeNavPath) {
  const pathname = normalizePathname(location.pathname);
  const itemPath = normalizePathname(item.path);
  const locQs = new URLSearchParams(location.search);

  if (item.search) {
    return pathname === itemPath && searchParamsMatchAll(location.search, item.search);
  }

  if (item.exact) {
    if (pathname !== itemPath) return false;
    if (item.skipActiveIfSearch) {
      for (const [key, value] of Object.entries(item.skipActiveIfSearch)) {
        if (locQs.get(key) === value) return false;
      }
    }
    return true;
  }

  return (
    activeNavPath === itemPath ||
    (itemPath !== "/" && activeNavPath.startsWith(`${itemPath}/`))
  );
}

function navItemToLocationDescriptor(item) {
  if (item.search) {
    const search = item.search.startsWith("?") ? item.search : `?${item.search}`;
    return { pathname: item.path, search };
  }
  return item.path;
}

/** Sidebar caret → public portfolio (or /profile fallback). Admins have no caret in the sidebar. */
function getPortfolioCaretPath(user) {
  if (!user?.role) return "/profile";
  if (user.role === "admin" && user.id != null) return `/explore/portfolio/admin-${user.id}`;
  if (user.role === "student") {
    const portfolio = portfolios.find(
      (p) =>
        p.studentEmail === user.email ||
        p.owner === user.name ||
        p.studentName === user.name
    );
    return portfolio ? `/explore/portfolio/${portfolio.id}` : "/profile";
  }
  if (user.role === "instructor") {
    const row = instructorDirectory.find(
      (i) => i.email === user.email || i.name === user.name
    );
    return row ? `/explore/portfolio/instructor-${row.id}` : "/profile";
  }
  return "/profile";
}

function SidebarTooltip({ collapsed, label }) {
  if (!collapsed) return null;
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-sans text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );
}

/** Snoozed bell: standard bell silhouette + offset “Zz” (clear at small size). */
function DndNavCornerBadge() {
  return (
    <span
      className="pointer-events-none absolute -right-1 -top-1 z-[1] flex h-[17px] w-[17px] items-center justify-center rounded-[4px] bg-[#2a2633] shadow-md ring-1 ring-white/20"
      aria-hidden
    >
      <svg width="15" height="15" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
        {/* Bell (material-style — very recognizable) */}
        <g transform="translate(0, 0.5) scale(0.78) translate(2.7, 1.2)">
          <path
            fill="white"
            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
          />
        </g>
        {/* Z (sleep) + smaller z — offset like “Zz” */}
        <g fill="white" transform="translate(12.6, 1.6) scale(0.48)">
          <path d="M1 1h6.2v1.45H2.4L5.8 5.4H8.2v1.55H0.9V5.5h3.4L1.1 2.45H1V1z" />
          <path
            d="M3.8 7.2h5.4v1.15H4.6l2.1 2.9h4.1v1.2H2.5v-1.15h3.1l-2.1-2.9H3.8V7.2z"
            opacity="0.92"
          />
        </g>
      </svg>
    </span>
  );
}

/** First given name (skips Dr., Prof., …). */
function sidebarFirstName(name) {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  const honorific = /^(dr|prof|professor|mr|mrs|ms)\.?$/i;
  let i = 0;
  while (i < parts.length) {
    const normalized = parts[i].replace(/\.$/, "").toLowerCase();
    if (honorific.test(normalized)) {
      i += 1;
      continue;
    }
    break;
  }
  return parts[i] || parts[0];
}

/** Main line next to avatar: role-specific label. */
function sidebarUserLabel(user) {
  if (!user) return "";
  const name = typeof user.name === "string" ? user.name.trim() : "";

  if (user.role === "admin") {
    return "Admin";
  }

  if (user.role === "employer") {
    const company = typeof user.companyName === "string" ? user.companyName.trim() : "";
    return company || name || "Company";
  }

  if (user.role === "student") {
    return sidebarFirstName(name) || name;
  }

  if (user.role === "instructor") {
    if (!name) return "";
    const parts = name.split(/\s+/);
    const firstTok = parts[0]?.replace(/\.$/, "").toLowerCase();
    const first = firstTok === "professor" ? "prof" : firstTok;
    if (first === "dr") {
      return `Dr. ${sidebarFirstName(name)}`.trim();
    }
    if (first === "prof") {
      return `Prof. ${sidebarFirstName(name)}`.trim();
    }
    return sidebarFirstName(name) || name;
  }

  return name;
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

  const caretPath = getPortfolioCaretPath(user);
  const caretNavState = navigateStateForPath(caretPath);
  const showPortfolioCaret = user?.role && user.role !== "admin";

  return (
    <div
      className={`shrink-0 border-t border-border flex flex-col gap-1.5 ${collapsed ? "overflow-hidden p-2" : "overflow-visible p-2.5"}`}
    >
      <div
        className={`flex min-h-10 w-full min-w-0 items-center rounded-lg hover:bg-bg-elevated transition-colors ${collapsed ? "justify-center py-2" : "gap-1 pr-2 pl-1"}`}
      >
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className={`group relative flex min-h-10 min-w-0 flex-1 items-center rounded-lg text-text-primary text-sm text-left transition-colors hover:bg-transparent ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-2 py-1.5"}`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 border border-accent-blue/20 overflow-hidden text-lg">
            {(user?.avatar || user?.logo) ? (
              <img src={user.avatar || user.logo} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="leading-none">{roleEmoji[user?.role] || "👤"}</span>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left truncate min-w-0">
              <div className="text-sm font-medium truncate">{sidebarUserLabel(user)}</div>
              <div className="text-xs text-text-secondary capitalize">
                {user?.role === "admin" ? "Administrator" : user?.role}
              </div>
            </div>
          )}
          <SidebarTooltip collapsed={collapsed} label="Profile" />
        </button>
        {!collapsed && showPortfolioCaret && (
          <button
            type="button"
            onClick={() => navigate(caretPath, { state: caretNavState })}
            className="flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-md pl-1 pr-0.5 text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
            aria-label="Open public portfolio"
            title="Portfolio"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="shrink-0 opacity-80"
              aria-hidden
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6l6 6-6 6"
              />
            </svg>
          </button>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className={`group relative flex items-center rounded-lg text-xs transition-colors w-full text-left font-sans ${collapsed ? "justify-center px-0 py-2.5 text-text-secondary hover:text-danger hover:bg-danger/10" : "gap-3 px-3 py-1.5 text-danger hover:bg-danger/10"}`}
      >
        <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">⎋</span>
        {!collapsed && <span className="truncate">Logout</span>}
        <SidebarTooltip collapsed={collapsed} label="Logout" />
      </button>

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

/* ─── GP Logo mark (solid, no gradients) ─────────────────────────────────── */
function GpMark() {
  return (
    <div
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-gold"
      aria-hidden
    >
      <span className="font-display text-xs font-bold tracking-tight text-bg-base leading-none">GP</span>
    </div>
  );
}

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationTick, setNotificationTick] = useState(0);
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { projectList } = useProjects();
  const navigate = useNavigate();
  const navGroups = getNavGroupsForRole(user?.role);
  const location = useLocation();
  const activeNavPath = location.state?.activeNav ?? normalizePathname(location.pathname);

  const bootstrapNotificationIdsRef = useRef(new Set());
  const [, setDoNotDisturbBump] = useState(0);
  const doNotDisturb = readDoNotDisturb();
  const canUseDoNotDisturb = ["student", "employer", "instructor"].includes(user?.role);

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

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(() =>
    getUnreadNotificationCount(user)
  );
  const [unreadDmTotal, setUnreadDmTotal] = useState(() => getUnreadInboundThreadTotal(user));

  useEffect(() => {
    if (!user?.id) return undefined;

    bootstrapNotificationIdsRef.current = new Set(
      getVisibleNotifications(user).map((notification) => notification.id)
    );

    const syncUnread = () => {
      const visibleNow = getVisibleNotifications(user);
      setUnreadNotificationCount(
        visibleNow.filter((notification) => !getEffectiveRead(notification.id, notification.read)).length
      );
      setUnreadDmTotal(getUnreadInboundThreadTotal(user));

      const boot = bootstrapNotificationIdsRef.current;
      const fresh = visibleNow.filter((notification) => !boot.has(notification.id));
      if (fresh.length === 0) return;

      fresh.forEach((notification) => { boot.add(notification.id); });

      const pick = [...fresh]
        .reverse()
        .find(
          (notification) =>
            !getEffectiveRead(notification.id, notification.read) &&
            notification.audience?.includes(user.role)
        );

      const mutePopups =
        ["student", "employer", "instructor"].includes(user?.role) && readDoNotDisturb();

      if (pick && !mutePopups) {
        window.dispatchEvent(
          new CustomEvent("portfolio-toast-notification", {
            detail: {
              title: pick.title || "New notification",
              body: pick.text,
              dismissSessionKey: `portfolio-notif-toast-${pick.id}`,
            },
          })
        );
        playNotificationChime();
      }
    };

    syncUnread();
    return subscribeDummyUpdates(syncUnread);
  }, [user, notificationTick]);

  const toggleDoNotDisturb = () => {
    const next = !readDoNotDisturb();
    writeDoNotDisturb(next);
    setDoNotDisturbBump((value) => value + 1);
  };

  useEffect(() => {
    const sync = () => setDoNotDisturbBump((value) => value + 1);
    window.addEventListener("guc-dnd-changed", sync);
    return () => window.removeEventListener("guc-dnd-changed", sync);
  }, []);

  const dndHidesBadges = canUseDoNotDisturb && doNotDisturb;

  const totalUnreadNotificationCount = unreadNotificationCount + unreadProjectInvitationCount;

  const unreadBadgeLabel = useMemo(() => {
    if (totalUnreadNotificationCount <= 0) return null;
    if (totalUnreadNotificationCount > 99) return "99+";
    return String(totalUnreadNotificationCount);
  }, [totalUnreadNotificationCount]);

  const unreadMessagesBadgeLabel = useMemo(() => {
    if (unreadDmTotal <= 0) return null;
    if (unreadDmTotal > 99) return "99+";
    return String(unreadDmTotal);
  }, [unreadDmTotal]);

  const isDark = theme === "dark";

  return (
    <div className="flex min-h-screen bg-bg-base">
      <aside
        className={`fixed inset-y-0 left-0 h-screen overflow-x-clip overflow-y-auto bg-bg-surface border-r border-border flex flex-col z-40 select-none
          transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
      >
        {/* Logo */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-5 border-b border-border overflow-hidden">
          <GpMark />
          {!collapsed && (
            <span className="font-display text-sm text-text-primary truncate min-w-0">GUC Portal</span>
          )}
        </div>

        {/* Nav */}
        <nav
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-4 flex flex-col px-2"
          aria-label="Main navigation"
        >
          {navGroups.map((group, groupIndex) => (
            <div key={group.id} className="flex flex-col gap-1">
              {collapsed && groupIndex > 0 && (
                <div className="mx-1.5 my-1.5 border-t border-border/50" aria-hidden />
              )}
              {!collapsed && (
                <p
                  className={`px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted/90 ${
                    groupIndex === 0 ? "pt-0" : "pt-3"
                  }`}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = isNavItemActive(item, location, activeNavPath);
                const showUnreadDmCount =
                  item.path === "/messages" &&
                  unreadMessagesBadgeLabel !== null &&
                  !dndHidesBadges;
                const labelText =
                  typeof item.label === "function" ? item.label(user?.role) : item.label;
                const linkKey = item.navId ?? `${item.path}${item.search ? `?${item.search}` : ""}`;
                return (
                  <Link
                    key={linkKey}
                    to={navItemToLocationDescriptor(item)}
                    className={`group relative flex items-center rounded-lg text-sm font-sans transition-colors ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                  ${active
                    ? "bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
                  >
                    <span className="relative flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">
                      <span aria-hidden="true">{item.icon}</span>
                      {showUnreadDmCount && (
                        <span
                          title="Unread messages"
                          className="absolute -top-1 -right-1 min-h-3.5 min-w-[0.875rem] px-[3px] bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono leading-none"
                          aria-label="Unread messages"
                        >
                          {unreadMessagesBadgeLabel}
                        </span>
                      )}
                      {dndHidesBadges && item.path === "/messages" && <DndNavCornerBadge />}
                    </span>
                    {!collapsed && <span className="truncate">{labelText}</span>}
                    <SidebarTooltip collapsed={collapsed} label={labelText} />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="shrink-0 border-t border-border p-2 flex flex-col gap-1 overflow-hidden">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={!isDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`group relative flex items-center rounded-lg text-sm transition-colors w-full text-left font-sans
              ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
              text-text-secondary hover:text-text-primary hover:bg-bg-elevated`}
          >
            <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
              {isDark ? "☀" : "☽"}
            </span>
            {!collapsed && (
              <span className="truncate">{isDark ? "Light mode" : "Dark mode"}</span>
            )}
            <SidebarTooltip collapsed={collapsed} label={isDark ? "Light mode" : "Dark mode"} />
          </button>

          {canUseDoNotDisturb && (
            <button
              type="button"
              onClick={toggleDoNotDisturb}
              aria-pressed={doNotDisturb}
              title={doNotDisturb ? "Turn off Do not disturb" : "Do not disturb — mute notification pop-ups and sounds"}
              className={`group relative flex items-center rounded-lg text-sm transition-colors ${collapsed ? "justify-center px-0 py-2.5 w-full text-left font-sans" : "gap-3 px-3 py-2.5 w-full text-left font-sans"} ${
                doNotDisturb
                  ? "text-accent-gold bg-accent-gold/10 border border-accent-gold/35"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <span className="flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
                {doNotDisturb ? "🌙" : "☾"}
              </span>
              {!collapsed && (
                <span className="truncate">{doNotDisturb ? "Do not disturb on" : "Do not disturb"}</span>
              )}
              <SidebarTooltip collapsed={collapsed} label={doNotDisturb ? "Notifications muted" : "Mute notifications"} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((open) => !open);
            }}
            className={`group relative flex items-center rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors ${collapsed ? "justify-center px-0 py-2.5 w-full text-left font-sans" : "gap-3 px-3 py-2.5 w-full text-left font-sans"} ${
              doNotDisturb && canUseDoNotDisturb ? "opacity-60" : ""
            }`}
            title={doNotDisturb && canUseDoNotDisturb ? "Notifications muted (Do not disturb)" : undefined}
          >
            <span className="relative flex h-5 w-7 shrink-0 items-center justify-center text-base leading-none">
              <span aria-hidden="true">🔔</span>
              {unreadBadgeLabel !== null && !dndHidesBadges && (
                <span
                  className="absolute -top-1 -right-1 min-h-3.5 min-w-[0.875rem] px-[3px] bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-mono leading-none"
                  aria-live="polite"
                >
                  {unreadBadgeLabel}
                </span>
              )}
              {dndHidesBadges && <DndNavCornerBadge />}
            </span>
            {!collapsed && <span>Notifications</span>}
            <SidebarTooltip collapsed={collapsed} label="Notifications" />
          </button>

          {notificationsOpen && (
            <NotificationsDock
              collapsed={collapsed}
              user={user}
              navigate={navigate}
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
              blurContent={Boolean(canUseDoNotDisturb && doNotDisturb)}
            />
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="group relative flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <span className="flex h-5 w-7 shrink-0 items-center justify-center leading-none" aria-hidden>
              {collapsed ? "→" : "←"}
            </span>
            {!collapsed && <span className="min-w-0 truncate">Collapse</span>}
            <SidebarTooltip collapsed={collapsed} label={collapsed ? "Expand" : "Collapse"} />
          </button>
        </div>

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

function NotificationsDock({ collapsed, user, navigate, onClose, onOpenFull, markRead, markAllRead, blurContent }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const leftOffsetPx = collapsed ? 72 : 224;
  const items = user ? [...getVisibleNotifications(user)].sort(sortNotificationsNewestFirst) : [];

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
                Link and unlink requests, moderation, and account activity.
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

          <div
            className={`max-h-[20rem] overflow-y-auto divide-y divide-border ${
              blurContent ? "blur-md pointer-events-none select-none opacity-70" : ""
            }`}
          >
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-text-secondary font-sans">
                You&apos;re caught up.
              </div>
            ) : (
              items.map((notification) => {
                const vis = getNotificationPresentation(notification);
                const actionPath = getNotificationActionPath(notification);
                const rowInteractive = Boolean(actionPath);
                return (
                  <div
                    key={notification.id}
                    role={rowInteractive ? "link" : undefined}
                    tabIndex={rowInteractive ? 0 : undefined}
                    onKeyDown={
                      rowInteractive
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              markRead(notification.id);
                              navigate(actionPath, { state: navigateStateForPath(actionPath) });
                              onClose?.();
                            }
                          }
                        : undefined
                    }
                    onClick={
                      rowInteractive
                        ? () => {
                            markRead(notification.id);
                            navigate(actionPath, { state: navigateStateForPath(actionPath) });
                            onClose?.();
                          }
                        : undefined
                    }
                    className={`flex items-start gap-3 px-4 py-3 ${!notification.read ? "bg-accent-blue/[0.04]" : ""} ${
                      rowInteractive ? "cursor-pointer hover:bg-bg-elevated/80" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base leading-none ${vis.bubble}`}
                      title={vis.label}
                    >
                      <span aria-hidden="true">{vis.glyph}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold font-sans text-text-primary leading-normal break-words">
                        {notification.targetProjectId != null ? (
                          <ProjectTitleLink
                            projectId={notification.targetProjectId}
                            className="text-sm font-semibold font-sans text-text-primary leading-normal break-words"
                            navState={navigateStateForPath(`/projects/${notification.targetProjectId}`)}
                          >
                            {notification.title || "Notification"}
                          </ProjectTitleLink>
                        ) : (
                          notification.title || "Notification"
                        )}
                      </p>
                      <p className="text-sm font-sans text-text-secondary mt-1 leading-relaxed break-words">
                        {notification.text}
                      </p>
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

          <div
            className={`flex flex-wrap gap-2 border-t border-border bg-bg-base/95 px-3 py-3 ${
              blurContent ? "blur-md pointer-events-none select-none opacity-70" : ""
            }`}
          >
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

const favoritesNavStateProject = { activeNav: "/favorites" };
const favoritesNavStatePortfolio = { activeNav: "/favorites", fromExploreMode: "portfolios" };

function FavoritesDock({
  collapsed,
  favoriteProjectIds,
  favoritePortfolioIds,
  projectList,
  navigate,
  onClose,
  onOpenAll,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const resolvedProjects = useMemo(
    () =>
      favoriteProjectIds
        .map((id) => projectList.find((p) => Number(p.id) === Number(id)))
        .filter(Boolean),
    [favoriteProjectIds, projectList]
  );

  const resolvedPortfolios = useMemo(
    () =>
      favoritePortfolioIds
        .map((id) => portfolios.find((p) => Number(p.id) === Number(id)))
        .filter(Boolean),
    [favoritePortfolioIds]
  );

  const leftOffsetPx = collapsed ? 72 : 224;

  const goProject = (projectId) => {
    navigate(`/projects/${projectId}`, { state: favoritesNavStateProject });
    onClose?.();
  };

  const goPortfolio = (portfolioId) => {
    navigate(`/explore/portfolio/${portfolioId}`, { state: favoritesNavStatePortfolio });
    onClose?.();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close favorites overlay"
        className="fixed inset-0 z-[42] bg-black/35 lg:bg-black/25"
        onClick={onClose}
      />
      <div
        className="fixed z-[52]"
        style={{
          left: `max(14px, ${leftOffsetPx}px)`,
          top: "clamp(160px, 22vh, 220px)",
          width: "min(22rem,calc(100vw - 1.75rem))",
          maxHeight: "min(28rem,calc(100vh - 6rem))",
        }}
      >
        <Card className="shadow-2xl border-accent-gold/30 p-0 overflow-hidden flex flex-col max-h-[inherit]">
          <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-bg-elevated/70 shrink-0">
            <div>
              <p className="font-display text-sm text-text-primary">Favorites</p>
              <p className="text-text-secondary text-[11px] font-sans leading-snug">
                Saved projects and portfolios — View opens the full page.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close favorites window"
              onClick={onClose}
              className="shrink-0 rounded-md px-2 py-1 text-xl leading-none text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            >
              ×
            </button>
          </div>

          <div className="max-h-[18rem] overflow-y-auto divide-y divide-border">
            {resolvedProjects.length === 0 && resolvedPortfolios.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-text-secondary font-sans">
                Nothing saved yet. Star items from Explore or the Favorites page.
              </div>
            ) : (
              <>
                {resolvedProjects.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-1 mb-2">
                      Projects
                    </p>
                    <ul className="flex flex-col gap-1">
                      {resolvedProjects.map((project) => (
                        <li
                          key={`fav-proj-${project.id}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-bg-elevated/50 px-2 py-2"
                        >
                          <span className="min-w-0 text-sm font-sans text-text-primary truncate" title={project.title}>
                            {project.title}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 rounded-md border border-accent-blue/50 px-2 py-1 text-xs font-sans text-accent-blue hover:bg-accent-blue/10"
                            onClick={() => goProject(project.id)}
                          >
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {resolvedPortfolios.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-1 mb-2">
                      Portfolios
                    </p>
                    <ul className="flex flex-col gap-1">
                      {resolvedPortfolios.map((pf) => (
                        <li
                          key={`fav-port-${pf.id}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-bg-elevated/50 px-2 py-2"
                        >
                          <span
                            className="min-w-0 text-sm font-sans text-text-primary truncate"
                            title={pf.title || pf.studentName}
                          >
                            {pf.studentName || pf.owner}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 rounded-md border border-accent-blue/50 px-2 py-1 text-xs font-sans text-accent-blue hover:bg-accent-blue/10"
                            onClick={() => goPortfolio(pf.id)}
                          >
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border bg-bg-base/95 px-3 py-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAll}
              className="flex-1 min-w-[7rem] rounded-lg border border-accent-gold/60 px-3 py-2 text-xs font-sans text-accent-gold hover:bg-accent-gold/10 transition-colors"
            >
              Open favorites page →
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function toastSessionStorageKey(title, body) {
  const s = `${title}|${body}`;
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
  }
  return `portfolio-toast-${hash}`;
}

function LiveNotificationToastBoundary() {
  const { user } = useContext(AuthContext);
  const [toast, setToast] = useState(null);
  const dndApplies = ["student", "employer", "instructor"].includes(user?.role);

  const clearToast = (persistDismiss) => {
    setToast((current) => {
      if (persistDismiss && current?.dismissSessionKey) {
        try {
          sessionStorage.setItem(current.dismissSessionKey, "1");
        } catch {
          /* ignore */
        }
      }
      return null;
    });
  };

  useEffect(() => {
    const handler = (event) => {
      if (readDoNotDisturb()) return;
      const payload = event?.detail || {};
      const title = payload.title || "New notification";
      const body = payload.body || "";
      const sessionKey = payload.dismissSessionKey || toastSessionStorageKey(title, body);
      if (typeof window !== "undefined") {
        try {
          if (window.sessionStorage.getItem(sessionKey)) return;
        } catch {
          /* ignore */
        }
      }
      setToast({
        id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
        title,
        body,
        dismissSessionKey: sessionKey,
      });
    };
    window.addEventListener("portfolio-toast-notification", handler);
    return () => window.removeEventListener("portfolio-toast-notification", handler);
  }, [dndApplies]);

  if (!toast) return null;

  return (
    <Toast
      variant="info"
      title={toast.title}
      description={toast.body}
      onClose={() => clearToast(true)}
      durationMs={0}
    />
  );
}