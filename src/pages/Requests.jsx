import { useContext, useEffect, useMemo, useState } from "react";
import { Card, Button, PageHeader, Badge, Modal, ConfirmActionModal } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";
import {
  applyInstructorCourseRequestDecision,
  instructorCourseRequests,
  subscribeDummyUpdates,
} from "../data/dummy";

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

function StudentAndInstructorRequests() {
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
        title="Requests"
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

function AdminCourseRequestsQueue() {
  const [, setRev] = useState(0);
  const [instructorReqConfirm, setInstructorReqConfirm] = useState(null);
  const [adminNotice, setAdminNotice] = useState("");

  useEffect(() => subscribeDummyUpdates(() => setRev((r) => r + 1)), []);

  useEffect(() => {
    if (!adminNotice) return undefined;
    const t = window.setTimeout(() => setAdminNotice(""), 3500);
    return () => window.clearTimeout(t);
  }, [adminNotice]);

  return (
    <div>
      <PageHeader
        title="Requests"
        subtitle="Review instructor requests to link or unlink courses from their profiles. Accept applies catalog changes; reject dismisses the request."
      />

      <Card className="p-0 overflow-hidden mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-border bg-bg-elevated/40">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">{instructorCourseRequests.length} pending</Badge>
            <p className="text-text-secondary text-sm font-sans">
              Accept to apply course links. Reject to decline without linking changes.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-base">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal">
                  Instructor
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal">
                  Email
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal">
                  Course
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[6rem]">
                  Type
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[7rem]">
                  Requested
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-right w-[11rem]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {instructorCourseRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-sm font-sans text-text-secondary text-center">
                    No pending instructor requests.
                  </td>
                </tr>
              ) : (
                instructorCourseRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border last:border-0 hover:bg-bg-elevated/20">
                    <td className="px-4 py-4 text-sm font-semibold text-text-primary">{request.instructorName}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary font-sans break-all">{request.instructorEmail}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-text-primary font-sans">{request.courseCode}</p>
                      <p className="text-xs text-text-secondary font-sans mt-0.5">{request.courseName}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={request.type === "unlink" ? "warning" : "success"}>
                        {request.type === "unlink" ? "Unlink" : "Link"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-mono text-text-secondary">{request.requestedAt}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" onClick={() => setInstructorReqConfirm({ id: request.id, accept: true })}>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setInstructorReqConfirm({ id: request.id, accept: false })}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmActionModal
        isOpen={instructorReqConfirm !== null}
        action={
          instructorReqConfirm?.accept
            ? "accept this instructor course request"
            : "reject this instructor course request"
        }
        variant={instructorReqConfirm?.accept ? "gold" : "danger"}
        onClose={() => setInstructorReqConfirm(null)}
        onConfirm={() => {
          if (!instructorReqConfirm) return;
          applyInstructorCourseRequestDecision(instructorReqConfirm.id, instructorReqConfirm.accept);
          setInstructorReqConfirm(null);
          setAdminNotice("Request processed successfully.");
        }}
      />

      {adminNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{adminNotice}</p>
            <button type="button" className="text-success text-xs font-semibold" onClick={() => setAdminNotice("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Requests() {
  const { user } = useContext(AuthContext);
  if (user?.role === "admin") {
    return <AdminCourseRequestsQueue />;
  }
  return <StudentAndInstructorRequests />;
}
