import { useContext, useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import { Card, Button, PageHeader, Badge, Modal } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { getVisibleNotifications } from "../data/dummy";
import { useProjects } from "../context/ProjectsContext";

const statusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

const getNotificationStateKey = (user) => `guc_notification_read_state_${user?.email || "guest"}`;

function loadReadState(user) {
  try {
    return JSON.parse(localStorage.getItem(getNotificationStateKey(user)) || "{}");
  } catch {
    return {};
  }
=======
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
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
}

export default function Notifications() {
  const { user } = useContext(AuthContext);
<<<<<<< HEAD
  const { projectList, updateProject } = useProjects();
  const [readState, setReadState] = useState(() => loadReadState(user));
  const [responseConfirm, setResponseConfirm] = useState(null);
  const [toast, setToast] = useState("");
  const baseNotifications = getVisibleNotifications(user);
  const projectInvitations = projectList.flatMap((project) =>
    (project.instructorInvitations || [])
      .filter((invite) => invite.email === user?.email || invite.instructorName === user?.name)
      .map((invite) => ({
        ...invite,
        projectId: project.id,
        projectTitle: project.title,
        course: project.course,
        owner: project.owner,
        type: "instructor",
      }))
  );
  const collaboratorInvitations = projectList.flatMap((project) =>
    (project.collaboratorInvitations || [])
      .filter((invite) => invite.email === user?.email || invite.collaboratorName === user?.name)
      .map((invite) => ({
        ...invite,
        projectId: project.id,
        projectTitle: project.title,
        course: project.course,
        owner: project.owner,
        type: "collaborator",
      }))
  );
  const allInvitations = [...projectInvitations, ...collaboratorInvitations];
  const invitationNotifications = allInvitations.map((invite) => ({
    id: `project-invite-${invite.type}-${invite.projectId}-${invite.id}`,
    read: invite.status !== "no reply",
    text: `${invite.owner} invited you to join ${invite.projectTitle}`,
    time: invite.sentAt,
    invitation: invite,
  }));
  const notifications = useMemo(
    () => [...invitationNotifications, ...baseNotifications].map((notification) => ({
      ...notification,
      read: readState[notification.id] ?? notification.read,
    })),
    [baseNotifications, invitationNotifications, readState]
  );
  const allRead = notifications.length > 0 && notifications.every((notification) => notification.read);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const saveReadState = (nextState) => {
    setReadState(nextState);
    localStorage.setItem(getNotificationStateKey(user), JSON.stringify(nextState));
    window.dispatchEvent(new Event("guc-notifications-updated"));
  };

  const setNotificationRead = (notificationId, read) => {
    saveReadState({ ...readState, [notificationId]: read });
  };

  const setAllNotificationsRead = (read) => {
    const nextState = { ...readState };
    notifications.forEach((notification) => {
      nextState[notification.id] = read;
    });
    saveReadState(nextState);
  };

  const respondToInvitation = (projectId, invitationId, status, type = "instructor") => {
    const project = projectList.find((item) => item.id === projectId);
    if (!project) return;
    const key = type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";
    const invitation = (project[key] || []).find((invite) => invite.id === invitationId);

    updateProject(projectId, {
      [key]: (project[key] || []).map((invite) =>
        invite.id === invitationId ? { ...invite, status } : invite
      ),
      supervisor:
        type === "instructor" && status === "accepted"
          ? invitation?.instructorName || project.supervisor
          : project.supervisor,
      team:
        type === "collaborator" && status === "accepted" && project.courseCode !== "BP" && invitation?.collaboratorName
          ? Array.from(new Set([...(project.team || []), invitation.collaboratorName]))
          : project.team,
    });
    setResponseConfirm(null);
    setToast(`Invitation ${status === "accepted" ? "accepted" : "rejected"} successfully.`);
  };

  const requestInvitationConfirmation = (invitation, status) => {
    setResponseConfirm({
      invitation,
      status,
      title: status === "accepted" ? "Accept Invitation" : "Reject Invitation",
      message: `Are you sure you want to ${status === "accepted" ? "accept" : "reject"} the invitation to join ${invitation.projectTitle}?`,
      confirmLabel: status === "accepted" ? "Accept Invitation" : "Reject Invitation",
      variant: status === "accepted" ? "secondary" : "danger",
    });
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="All notifications for your role"
        action={
          notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setAllNotificationsRead(!allRead)}>
              {allRead ? "Mark all unread" : "Mark all read"}
            </Button>
          )
        }
      />
      <Card>
        <div className="flex flex-col divide-y divide-border">
          {notifications.length > 0 ? notifications.map((n) => (
            <div key={n.id} className={`py-4 flex items-start gap-3 ${!n.read ? "opacity-100" : "opacity-50"}`}>
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-accent-blue" : "bg-transparent border border-border"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-sans text-text-primary">{n.text}</p>
                  {n.invitation && (
                    <>
                      <Badge variant={statusVariant[n.invitation.status] || "default"}>{n.invitation.status === "no reply" ? "pending" : n.invitation.status}</Badge>
                      {n.invitation.status === "no reply" && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => requestInvitationConfirmation(n.invitation, "accepted")}>
                            Accept
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => requestInvitationConfirmation(n.invitation, "rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs font-mono text-text-secondary mt-1">{n.time}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setNotificationRead(n.id, !n.read)}>
                {n.read ? "Mark unread" : "Mark read"}
              </Button>
            </div>
          )) : (
            <div className="py-4 text-sm text-text-secondary font-sans">
              No notifications for your role yet.
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(responseConfirm)}
        onClose={() => setResponseConfirm(null)}
        title={responseConfirm?.title || "Confirm Invitation"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">{responseConfirm?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResponseConfirm(null)}>Cancel</Button>
            <Button
              variant={responseConfirm?.variant || "secondary"}
              onClick={() => respondToInvitation(
                responseConfirm.invitation.projectId,
                responseConfirm.invitation.id,
                responseConfirm.status,
                responseConfirm.invitation.type
              )}
            >
              {responseConfirm?.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{toast}</p>
            <button type="button" className="text-success text-xs font-semibold" onClick={() => setToast("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}
=======
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
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
    </div>
  );
}
