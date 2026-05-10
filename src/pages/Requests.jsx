import { useContext, useEffect, useMemo, useState } from "react";
import { Card, Button, PageHeader, Badge, Modal } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";

const statusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

const requestFilters = [
  { value: "all", label: "All" },
  { value: "no reply", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function getStatusLabel(status) {
  return status === "no reply" ? "pending" : status;
}

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [responseConfirm, setResponseConfirm] = useState(null);
  const [notice, setNotice] = useState("");
  const incomingRequests = getIncomingRequests(projectList, user);
  const outgoingRequests = getOutgoingRequests(projectList, user);
  const filteredIncoming = useMemo(
    () => incomingRequests.filter((request) => statusFilter === "all" || request.status === statusFilter),
    [incomingRequests, statusFilter]
  );
  const filteredOutgoing = useMemo(
    () => outgoingRequests.filter((request) => statusFilter === "all" || request.status === statusFilter),
    [outgoingRequests, statusFilter]
  );

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

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
    setResponseConfirm(null);
    setNotice(`Request ${status === "accepted" ? "accepted" : "rejected"} successfully.`);
  };

  const requestResponseConfirmation = (request, status) => {
    setResponseConfirm({
      request,
      status,
      title: status === "accepted" ? "Accept Request" : "Reject Request",
      message: `Are you sure you want to ${status === "accepted" ? "accept" : "reject"} this ${request.type} request for ${request.project.title}?`,
      confirmLabel: status === "accepted" ? "Accept Request" : "Reject Request",
      variant: status === "accepted" ? "secondary" : "danger",
    });
  };

  const cancelRequest = (request) => {
    const key = request.type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";

    updateProject(request.project.id, {
      [key]: (request.project[key] || []).filter((invite) => invite.id !== request.id),
    });
    setCancelConfirm(null);
    setNotice("Request cancelled successfully.");
  };

  return (
    <div>
      <PageHeader
        title="Invitations"
        subtitle="Review incoming invitations and track the requests you sent."
      />

      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {requestFilters.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={statusFilter === filter.value ? "gold" : "secondary"}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <Badge variant="blue">
            {filteredIncoming.length + filteredOutgoing.length} shown
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Incoming</h2>
          {filteredIncoming.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {filteredIncoming.map((request) => (
                <div key={`${request.type}-${request.project.id}-${request.id}`} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-sans truncate">{request.project.title}</p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {request.type} request from {request.project.owner} - sent {request.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[request.status] || "default"}>{getStatusLabel(request.status)}</Badge>
                    {request.status === "no reply" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => requestResponseConfirmation(request, "accepted")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => requestResponseConfirmation(request, "rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm font-sans">No incoming invitations yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Sent</h2>
          {filteredOutgoing.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {filteredOutgoing.map((request) => (
                <div key={`${request.type}-${request.project.id}-${request.id}`} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-sans truncate">{request.recipientName}</p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {request.type} request for {request.project.title} - sent {request.sentAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[request.status] || "default"}>{getStatusLabel(request.status)}</Badge>
                    {request.status === "no reply" && (
                      <Button size="sm" variant="danger" onClick={() => setCancelConfirm(request)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm font-sans">No sent invitations yet.</p>
          )}
        </Card>
      </div>

      <Modal
        isOpen={Boolean(cancelConfirm)}
        onClose={() => setCancelConfirm(null)}
        title="Cancel Request"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">
            Are you sure you want to cancel the request sent to{" "}
            <span className="text-text-primary font-semibold">{cancelConfirm?.recipientName}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelConfirm(null)}>Keep Request</Button>
            <Button variant="danger" onClick={() => cancelRequest(cancelConfirm)}>Cancel Request</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(responseConfirm)}
        onClose={() => setResponseConfirm(null)}
        title={responseConfirm?.title || "Confirm Request"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">{responseConfirm?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResponseConfirm(null)}>Cancel</Button>
            <Button
              variant={responseConfirm?.variant || "secondary"}
              onClick={() => respondToRequest(responseConfirm.request, responseConfirm.status)}
            >
              {responseConfirm?.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      {notice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{notice}</p>
            <button type="button" className="text-success text-xs font-semibold" onClick={() => setNotice("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
