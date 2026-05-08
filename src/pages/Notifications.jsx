import { useContext } from "react";
import { Card, Button, PageHeader, Badge } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { getVisibleNotifications } from "../data/dummy";
import { useProjects } from "../context/ProjectsContext";

const statusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
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
      }))
  );
  const invitationNotifications = projectInvitations.map((invite) => ({
    id: `project-invite-${invite.projectId}-${invite.id}`,
    read: invite.status !== "no reply",
    text: `${invite.owner} invited you to join ${invite.projectTitle}`,
    time: invite.sentAt,
  }));
  const notifications = [...invitationNotifications, ...baseNotifications];

  const respondToInvitation = (projectId, invitationId, status) => {
    const project = projectList.find((item) => item.id === projectId);
    if (!project) return;

    updateProject(projectId, {
      instructorInvitations: (project.instructorInvitations || []).map((invite) =>
        invite.id === invitationId ? { ...invite, status } : invite
      ),
      supervisor:
        status === "accepted"
          ? project.instructorInvitations?.find((invite) => invite.id === invitationId)?.instructorName || project.supervisor
          : project.supervisor,
    });
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        action={<Button variant="ghost" size="sm">Mark all as read</Button>}
      />
      <Card>
        <div className="flex flex-col divide-y divide-border">
          {notifications.length > 0 ? notifications.map((n) => (
            <div key={n.id} className={`py-4 flex items-start gap-3 ${!n.read ? "opacity-100" : "opacity-50"}`}>
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-accent-blue" : "bg-transparent border border-border"}`} />
              <div className="flex-1">
                <p className="text-sm font-sans text-text-primary">{n.text}</p>
                <p className="text-xs font-mono text-text-secondary mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm">Mark read</Button>
              )}
            </div>
          )) : (
            <div className="py-4 text-sm text-text-secondary font-sans">
              No notifications for your role yet.
            </div>
          )}
        </div>
      </Card>

      <div className="mt-6">
        <PageHeader title="Project Invitations" />
        <Card>
          {projectInvitations.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {projectInvitations.map((invite) => (
                <div key={`${invite.projectId}-${invite.id}`} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-sans">{invite.projectTitle}</p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {invite.course} - from {invite.owner} - sent {invite.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[invite.status] || "default"}>{invite.status}</Badge>
                    {invite.status === "no reply" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => respondToInvitation(invite.projectId, invite.id, "accepted")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => respondToInvitation(invite.projectId, invite.id, "rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm font-sans">No project invitations yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
