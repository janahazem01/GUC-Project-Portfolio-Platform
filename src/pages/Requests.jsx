import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, PageHeader, Badge, Modal, ConfirmActionModal, Toast } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";
import {
  applyInstructorCourseRequestDecision,
  instructorCourseRequests,
  subscribeDummyUpdates,
} from "../data/dummy";
import { UserProfileLink } from "../components/UserProfileLink";
import { ProjectTitleLink } from "../components/ProjectTitleLink";

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
  const navigate = useNavigate();
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
        subtitle="Review invitations you received and track the invitations you sent."
        action={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
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
                    <p className="text-text-primary text-sm font-sans truncate">
                      <ProjectTitleLink project={request.project} className="text-text-primary font-sans" navState={{ activeNav: "/requests" }} stopPropagation={false} />
                    </p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {request.type} request from{" "}
                      <UserProfileLink ownerName={request.project.owner} className="text-text-secondary font-mono">
                        {request.project.owner}
                      </UserProfileLink>{" "}
                      - sent {request.sentAt}
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
                    <p className="text-text-primary text-sm font-sans truncate">
                      <UserProfileLink ownerName={request.recipientName} className="text-text-primary">
                        {request.recipientName}
                      </UserProfileLink>
                    </p>
                    <p className="text-text-secondary text-xs font-mono mt-1">
                      {request.type} request for{" "}
                      <ProjectTitleLink
                        project={request.project}
                        className="text-text-secondary font-mono text-xs"
                        navState={{ activeNav: "/requests" }}
                        stopPropagation={false}
                      />{" "}
                      - sent {request.sentAt}
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

      <Toast message={notice} onClose={() => setNotice("")} durationMs={4000} variant="success" />
    </div>
  );
}

function AdminCourseRequestsQueue() {
  const navigate = useNavigate();
  const [, setRev] = useState(0);
  const [instructorReqConfirm, setInstructorReqConfirm] = useState(null);
  const [adminNotice, setAdminNotice] = useState("");

  useEffect(() => subscribeDummyUpdates(() => setRev((r) => r + 1)), []);

  return (
    <div>
      <PageHeader
        title="Requests"
        subtitle="Review instructor requests to link or unlink courses from their profiles. Accept applies catalog changes; reject dismisses the request."
        action={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
        }
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
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-base">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal whitespace-nowrap">
                  Instructor
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal whitespace-nowrap">
                  Course
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[6rem] whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[7rem] whitespace-nowrap">
                  Requested
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center whitespace-nowrap">
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
                    <td className="px-4 py-2.5 align-middle max-w-[12rem]">
                      <div className="min-w-0 text-sm font-semibold text-text-primary" title={request.instructorName}>
                        <UserProfileLink
                          participant={{ name: request.instructorName, email: request.instructorEmail }}
                          className="font-semibold text-text-primary inline-block max-w-full truncate align-bottom"
                        >
                          {request.instructorName}
                        </UserProfileLink>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 align-middle max-w-[14rem]">
                      <div
                        className="min-w-0 truncate text-sm text-text-secondary font-sans whitespace-nowrap"
                        title={request.instructorEmail}
                      >
                        {request.instructorEmail}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 align-middle min-w-0 max-w-[20rem]">
                      <div className="flex flex-nowrap items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-text-primary font-sans shrink-0 tabular-nums">
                          {request.courseCode}
                        </span>
                        <span className="text-text-secondary shrink-0" aria-hidden>
                          ·
                        </span>
                        <span className="text-sm text-text-secondary font-sans truncate min-w-0">{request.courseName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 align-middle text-center whitespace-nowrap">
                      <Badge variant={request.type === "unlink" ? "warning" : "success"}>
                        {request.type === "unlink" ? "Unlink" : "Link"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 align-middle text-center text-sm font-mono text-text-secondary whitespace-nowrap">
                      {request.requestedAt}
                    </td>
                    <td className="px-4 py-2.5 align-middle text-center whitespace-nowrap">
                      <div className="inline-flex flex-nowrap items-center justify-center gap-2">
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

      <Toast message={adminNotice} onClose={() => setAdminNotice("")} durationMs={4000} variant="success" />
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
