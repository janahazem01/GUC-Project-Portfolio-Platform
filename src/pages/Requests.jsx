import { useContext } from "react";
import { Card, Button, PageHeader, Badge } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";

const statusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

function getIncomingRequests(projectList, user) {
  return projectList.flatMap((project) => [
    ...(project.instructorInvitations || [])
      .filter((invite) => invite.email === user?.email || invite.instructorName === user?.name)
      .map((invite) => ({ ...invite, type: "instructor", project })),
    ...(project.collaboratorInvitations || [])
      .filter((invite) => invite.email === user?.email || invite.collaboratorName === user?.name)
      .map((invite) => ({ ...invite, type: "collaborator", project })),
  ]);
}

function getOutgoingRequests(projectList, user) {
  return projectList
    .filter((project) => project.owner === user?.name)
    .flatMap((project) => [
      ...(project.instructorInvitations || []).map((invite) => ({
        ...invite,
        recipientName: invite.instructorName,
        type: "instructor",
        project,
      })),
      ...(project.collaboratorInvitations || []).map((invite) => ({
        ...invite,
        recipientName: invite.collaboratorName,
        type: "collaborator",
        project,
      })),
    ]);
}

export default function Requests() {
  const { user } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
  const incomingRequests = getIncomingRequests(projectList, user);
  const outgoingRequests = getOutgoingRequests(projectList, user);

  const respondToRequest = (request, status) => {
    const key = request.type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";
    const invitation = (request.project[key] || []).find((invite) => invite.id === request.id);

    updateProject(request.project.id, {
      [key]: (request.project[key] || []).map((invite) =>
        invite.id === request.id ? { ...invite, status } : invite
      ),
      supervisor:
        request.type === "instructor" && status === "accepted"
          ? invitation?.instructorName || request.project.supervisor
          : request.project.supervisor,
      team:
        request.type === "collaborator" && status === "accepted" && request.project.courseCode !== "BP" && invitation?.collaboratorName
          ? Array.from(new Set([...(request.project.team || []), invitation.collaboratorName]))
          : request.project.team,
    });
  };

  const cancelRequest = (request) => {
    const key = request.type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";

    updateProject(request.project.id, {
      [key]: (request.project[key] || []).filter((invite) => invite.id !== request.id),
    });
  };

  return (
    <div>
      <PageHeader
        title="Requests"
        subtitle="Review incoming invitations and track the requests you sent."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Incoming</h2>
          {incomingRequests.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {incomingRequests.map((request) => (
                <div key={`${request.type}-${request.project.id}-${request.id}`} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-sans truncate">{request.project.title}</p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {request.type} request from {request.project.owner} - sent {request.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[request.status] || "default"}>{request.status}</Badge>
                    {request.status === "no reply" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => respondToRequest(request, "accepted")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => respondToRequest(request, "rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm font-sans">No incoming requests yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Sent</h2>
          {outgoingRequests.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {outgoingRequests.map((request) => (
                <div key={`${request.type}-${request.project.id}-${request.id}`} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-sans truncate">{request.recipientName}</p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {request.type} request for {request.project.title} - sent {request.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[request.status] || "default"}>{request.status}</Badge>
                    {request.status === "no reply" && (
                      <Button size="sm" variant="danger" onClick={() => cancelRequest(request)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm font-sans">No sent requests yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
