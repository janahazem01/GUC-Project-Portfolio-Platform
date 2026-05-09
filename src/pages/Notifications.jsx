import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, PageHeader } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import {
  getNotificationActionPath,
  getNotificationPresentation,
  getVisibleNotifications,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  subscribeDummyUpdates,
} from "../data/dummy";

function navigateStateForPath(path) {
  if (!path) return undefined;
  if (path.startsWith("/projects/")) return { activeNav: "/projects" };
  if (path.startsWith("/courses")) return { activeNav: "/courses" };
  if (path.startsWith("/internships/")) return { activeNav: "/internships" };
  if (path.startsWith("/messages")) return { activeNav: "/messages" };
  return { activeNav: path };
}

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeDummyUpdates(() =>
      setRevision((tick) => tick + 1)
    );
    return unsubscribe;
  }, []);

  const notifications = useMemo(() => getVisibleNotifications(user), [user, revision]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const bump = () => setRevision((tick) => tick + 1);

  const handleMarkSingle = (notificationId) => {
    markNotificationReadForUser(notificationId, user);
    bump();
  };

  const handleMarkAll = () => {
    markAllNotificationsReadForUser(user);
    bump();
  };

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => Number(b.id) - Number(a.id)),
    [notifications]
  );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle="Unread items stay highlighted. Instructor link and unlink requests appear here for admins; decisions go to the instructor’s inbox."
        action={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
              Back
            </Button>
            <Button variant="ghost" size="sm" onClick={handleMarkAll} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-text-secondary text-sm font-sans">
          {unreadCount === 0
            ? "You’re all caught up."
            : `${unreadCount} unread for your account`}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.length > 0 ? (
          sorted.map((notification) => {
            const vis = getNotificationPresentation(notification);
            const actionPath = getNotificationActionPath(notification);
            const interactive = Boolean(actionPath);
            return (
              <Card
                key={notification.id}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          markNotificationReadForUser(notification.id, user);
                          bump();
                          navigate(actionPath, { state: navigateStateForPath(actionPath) });
                        }
                      }
                    : undefined
                }
                onClick={
                  interactive
                    ? () => {
                        markNotificationReadForUser(notification.id, user);
                        bump();
                        navigate(actionPath, { state: navigateStateForPath(actionPath) });
                      }
                    : undefined
                }
                className={`p-0 overflow-hidden border ${
                  !notification.read ? "border-accent-blue/35 bg-accent-blue/[0.03]" : "border-border"
                } ${interactive ? "cursor-pointer hover:border-accent-blue/50 transition-colors" : ""}`}
              >
                <div className="flex gap-4 p-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg ${vis.bubble}`}
                    title={vis.label}
                  >
                    <span aria-hidden="true">{vis.glyph}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-sans text-sm font-semibold text-text-primary leading-normal break-words">
                          {notification.title || "Notification"}
                        </p>
                        <p className="font-sans text-sm text-text-secondary mt-1.5 leading-relaxed break-words">
                          {notification.text}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-accent-blue mt-1.5" aria-label="Unread" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                      <span className="text-[11px] font-mono text-text-secondary">{notification.time}</span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMarkSingle(notification.id);
                          }}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="py-12 text-center">
            <p className="text-text-secondary text-sm font-sans">No notifications yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
