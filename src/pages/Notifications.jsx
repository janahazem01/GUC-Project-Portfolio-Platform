import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Modal, PageHeader, Toast } from "../components/ui";
import { ProjectTitleLink } from "../components/ProjectTitleLink";
import { AuthContext } from "../context/AuthContext";
import { useDoNotDisturb } from "../hooks/useDoNotDisturb";
import { useProjects } from "../context/ProjectsContext";
import {
  getNotificationActionPath,
  getNotificationPresentation,
  sortNotificationsNewestFirst,
  getVisibleNotifications,
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  subscribeDummyUpdates,
} from "../data/dummy";

// ─── helpers ────────────────────────────────────────────────────────────────

const statusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

const getNotificationStateKey = (user) =>
  `guc_notification_read_state_${user?.email || "guest"}`;

function loadReadState(user) {
  try {
    return JSON.parse(
      localStorage.getItem(getNotificationStateKey(user)) || "{}"
    );
  } catch {
    return {};
  }
}

function navigateStateForPath(path) {
  if (!path) return undefined;
  if (path.startsWith("/projects/")) return { activeNav: "/projects" };
  if (path.startsWith("/courses")) return { activeNav: "/courses" };
  if (path.startsWith("/internships/")) return { activeNav: "/internships" };
  if (path.startsWith("/messages")) return { activeNav: "/messages" };
  return { activeNav: path };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dndBlur = useDoNotDisturb(user);
  const { projectList, updateProject } = useProjects();

  const [readState, setReadState] = useState(() => loadReadState(user));
  const [responseConfirm, setResponseConfirm] = useState(null);
  const [toast, setToast] = useState("");
  const [revision, setRevision] = useState(0);

  // Subscribe to dummy data updates (for real-time-like refresh)
  useEffect(() => {
    const unsubscribe = subscribeDummyUpdates(() =>
      setRevision((tick) => tick + 1)
    );
    return unsubscribe;
  }, []);

  // ── Invitation notifications derived from projectList ──────────────────────

  const projectInvitations = projectList.flatMap((project) =>
    (project.instructorInvitations || [])
      .filter(
        (invite) =>
          invite.email === user?.email || invite.instructorName === user?.name
      )
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
      .filter(
        (invite) =>
          invite.email === user?.email ||
          invite.collaboratorName === user?.name
      )
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
    title: `Project Invitation`,
    text: `${invite.owner} invited you to join ${invite.projectTitle}`,
    time: invite.sentAt,
    invitation: invite,
  }));

  // ── Base notifications from dummy data ─────────────────────────────────────

  const baseNotifications = useMemo(
    () => getVisibleNotifications(user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, revision]
  );

  // ── Merge all notifications, apply local read state ────────────────────────

  const notifications = useMemo(
    () =>
      [...invitationNotifications, ...baseNotifications]
        .map((n) => ({ ...n, read: readState[n.id] ?? n.read }))
        .sort(sortNotificationsNewestFirst),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseNotifications, invitationNotifications, readState]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const allRead =
    notifications.length > 0 && notifications.every((n) => n.read);

  // ── Read-state helpers ─────────────────────────────────────────────────────

  const saveReadState = (nextState) => {
    setReadState(nextState);
    localStorage.setItem(
      getNotificationStateKey(user),
      JSON.stringify(nextState)
    );
    window.dispatchEvent(new Event("guc-notifications-updated"));
  };

  const setNotificationRead = (notificationId, read) => {
    saveReadState({ ...readState, [notificationId]: read });
  };

  const setAllNotificationsRead = (read) => {
    const nextState = { ...readState };
    notifications.forEach((n) => {
      nextState[n.id] = read;
    });
    saveReadState(nextState);
    // Also sync dummy-data layer for base notifications
    if (read) markAllNotificationsReadForUser(user);
    setRevision((tick) => tick + 1);
  };

  const handleMarkSingle = (notificationId) => {
    setNotificationRead(notificationId, true);
    markNotificationReadForUser(notificationId, user);
    setRevision((tick) => tick + 1);
  };

  // ── Invitation response ────────────────────────────────────────────────────

  const respondToInvitation = (projectId, invitationId, status, type = "instructor") => {
    const project = projectList.find((item) => item.id === projectId);
    if (!project) return;
    const key =
      type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";
    const invitation = (project[key] || []).find(
      (invite) => invite.id === invitationId
    );

    updateProject(projectId, {
      [key]: (project[key] || []).map((invite) =>
        invite.id === invitationId ? { ...invite, status } : invite
      ),
      supervisor:
        type === "instructor" && status === "accepted"
          ? invitation?.instructorName || project.supervisor
          : project.supervisor,
      team:
        type === "collaborator" &&
        status === "accepted" &&
        project.courseCode !== "BP" &&
        invitation?.collaboratorName
          ? Array.from(
              new Set([...(project.team || []), invitation.collaboratorName])
            )
          : project.team,
    });

    setResponseConfirm(null);
    setToast(
      `Invitation ${status === "accepted" ? "accepted" : "rejected"} successfully.`
    );
  };

  const requestInvitationConfirmation = (invitation, status) => {
    setResponseConfirm({
      invitation,
      status,
      title: status === "accepted" ? "Accept Invitation" : "Reject Invitation",
      message: `Are you sure you want to ${
        status === "accepted" ? "accept" : "reject"
      } the invitation to join ${invitation.projectTitle}?`,
      confirmLabel:
        status === "accepted" ? "Accept Invitation" : "Reject Invitation",
      variant: status === "accepted" ? "secondary" : "danger",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle="Unread items stay highlighted. Invitation requests appear here; respond directly from this page."
        action={
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAllNotificationsRead(!allRead)}
              disabled={notifications.length === 0}
            >
              {allRead ? "Mark all unread" : "Mark all read"}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-text-secondary text-sm font-sans">
          {unreadCount === 0
            ? "You're all caught up."
            : `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div
        className={`flex flex-col gap-3 transition-[filter] ${
          dndBlur ? "blur-[11px] saturate-50 opacity-85 pointer-events-none select-none" : ""
        }`}
      >
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const vis = getNotificationPresentation(n);
            const actionPath = getNotificationActionPath(n);
            const interactive = Boolean(actionPath) && !n.invitation;

            return (
              <Card
                key={n.id}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleMarkSingle(n.id);
                          navigate(actionPath, {
                            state: navigateStateForPath(actionPath),
                          });
                        }
                      }
                    : undefined
                }
                onClick={
                  interactive
                    ? () => {
                        handleMarkSingle(n.id);
                        navigate(actionPath, {
                          state: navigateStateForPath(actionPath),
                        });
                      }
                    : undefined
                }
                className={`p-0 overflow-hidden border ${
                  !n.read
                    ? "border-accent-blue/35 bg-accent-blue/[0.03]"
                    : "border-border"
                } ${
                  interactive
                    ? "cursor-pointer hover:border-accent-blue/50 transition-colors"
                    : ""
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Icon bubble */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg ${vis?.bubble ?? ""}`}
                    title={vis?.label}
                  >
                    <span aria-hidden="true">{vis?.glyph ?? "🔔"}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-semibold text-text-primary leading-normal break-words">
                          {n.targetProjectId != null ? (
                            <ProjectTitleLink
                              projectId={n.targetProjectId}
                              className="font-sans text-sm font-semibold text-text-primary leading-normal break-words"
                              navState={navigateStateForPath(`/projects/${n.targetProjectId}`)}
                            >
                              {n.title || "Notification"}
                            </ProjectTitleLink>
                          ) : (
                            n.title || "Notification"
                          )}
                        </p>
                        <p className="font-sans text-sm text-text-secondary mt-1.5 leading-relaxed break-words">
                          {n.text}
                        </p>

                        {/* Invitation actions */}
                        {n.invitation && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge
                              variant={
                                statusVariant[n.invitation.status] || "default"
                              }
                            >
                              {n.invitation.status === "no reply"
                                ? "pending"
                                : n.invitation.status}
                            </Badge>
                            {n.invitation.status === "no reply" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    requestInvitationConfirmation(
                                      n.invitation,
                                      "accepted"
                                    )
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    requestInvitationConfirmation(
                                      n.invitation,
                                      "rejected"
                                    )
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {!n.read && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-accent-blue mt-1.5"
                          aria-label="Unread"
                        />
                      )}
                    </div>

                    {/* Footer: timestamp + mark read */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                      <span className="text-[11px] font-mono text-text-secondary">
                        {n.time}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotificationRead(n.id, !n.read);
                        }}
                      >
                        {n.read ? "Mark unread" : "Mark read"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="py-12 text-center">
            <p className="text-text-secondary text-sm font-sans">
              No notifications yet.
            </p>
          </Card>
        )}
      </div>

      {/* Invitation confirm modal */}
      <Modal
        isOpen={Boolean(responseConfirm)}
        onClose={() => setResponseConfirm(null)}
        title={responseConfirm?.title || "Confirm Invitation"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">
            {responseConfirm?.message}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setResponseConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant={responseConfirm?.variant || "secondary"}
              onClick={() =>
                respondToInvitation(
                  responseConfirm.invitation.projectId,
                  responseConfirm.invitation.id,
                  responseConfirm.status,
                  responseConfirm.invitation.type
                )
              }
            >
              {responseConfirm?.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast("")} durationMs={4000} variant="success" />
    </div>
  );
}

