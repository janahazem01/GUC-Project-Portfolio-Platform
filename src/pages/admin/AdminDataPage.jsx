import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, Modal, PageHeader } from "../../components/ui";
import {
  adminClearProjectFlag,
  adminHideFlaggedProject,
  applyInstructorCourseRequestDecision,
  dummyUsers,
  employerApplications,
  getFlaggedProjects,
  getProjectAppeals,
  instructorCourseRequests,
  projects,
  setProjectPlatformActive,
  subscribeDummyUpdates,
} from "../../data/dummy";

const roleLabels = {
  student: "Student",
  instructor: "Course Instructor",
  employer: "Employer",
  admin: "Administrator",
};

const pageTitles = {
  users: ["Users", "Full name, email, and role for all platform users."],
  courses: ["Courses", "All courses currently available on the platform."],
  projects: ["Projects", "All submitted projects and their owners."],
  employers: ["Employers", "Employer accounts registered on the platform."],
  approvals: ["Approvals", "Employer verification requests and statuses."],
  flagged: ["Flagged Projects", "Reported or flagged project records."],
  requests: ["Instructor Requests", "Link and unlink requests from course instructors."],
  appeals: ["Student Appeals", "Short appeals submitted after projects are flagged for review."],
};

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Course Instructor" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Administrator" },
];

function DataHeader({ columns, style, alignments = [] }) {
  return (
    <div className="grid gap-4 border-b border-border px-4 py-4 items-center" style={style ?? { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((column, index) => (
        <p
          key={column}
          className={`font-mono text-[11px] uppercase tracking-widest text-text-secondary ${alignments[index] || "text-left"}`}
        >
          {column}
        </p>
      ))}
    </div>
  );
}

function DataRow({ children, columns, style }) {
  return (
    <div className="grid gap-4 px-4 py-5 items-center border-b border-border last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}>
      {children}
    </div>
  );
}

function isPlatformProjectActive(project) {
  return project.platformActive !== false;
}

export default function AdminDataPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersAddedOpen, setFiltersAddedOpen] = useState(false);
  const [, bumpDummyRevision] = useState(0);
  const [actionFeedbackOpen, setActionFeedbackOpen] = useState(false);
  const [actionFeedbackMessage, setActionFeedbackMessage] = useState("");
  const [projectDeactivateTarget, setProjectDeactivateTarget] = useState(null);
  const page = pageTitles[section];

  useEffect(() => {
    const unsubscribe = subscribeDummyUpdates(() =>
      bumpDummyRevision((revision) => revision + 1)
    );
    return unsubscribe;
  }, []);

  const employerUsers = dummyUsers.filter((user) => user.role === "employer");
  const isFiltered = Boolean(selectedRole);
  const filteredUsers = useMemo(() => {
    const availableRoles = roleOptions.map((option) => option.value);
    const visibleRoles = selectedRole ? [selectedRole] : availableRoles;
    return dummyUsers.filter((user) => visibleRoles.includes(user.role));
  }, [selectedRole]);
  const groupedUsers = useMemo(() => (
    selectedRole
      ? [{ role: selectedRole, users: dummyUsers.filter((user) => user.role === selectedRole) }]
      : []
  ), [selectedRole]);

  if (!page) return <Navigate to="/" replace />;
  if (section === "courses") return <Navigate to="/courses" replace />;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <PageHeader
        title={page[0]}
        subtitle={page[1]}
        action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
      />

      {section === "users" && (
        <>
          <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-start lg:justify-between relative">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="blue">{filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}</Badge>
              </div>
            </div>

            <div className="relative">
              <Button variant="secondary" className="inline-flex items-center gap-2" onClick={() => setFilterOpen((open) => !open)}>
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                  </svg>
                </span>
                {selectedRole ? `Filter: ${roleLabels[selectedRole]}` : "Filter by role"}
              </Button>
              {filterOpen && (
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-bg-base p-3 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-display text-text-primary">Select role</p>
                    <button
                      type="button"
                      onClick={() => setFilterOpen(false)}
                      className="text-sm text-text-secondary hover:text-text-primary"
                    >
                      Close
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("");
                      setFilterOpen(false);
                    }}
                    className="mb-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-left text-sm font-sans text-text-secondary hover:border-text-primary hover:text-text-primary"
                  >
                    Clear filter
                  </button>
                  <div className="grid gap-2">
                    {roleOptions.map((roleOption) => (
                      <button
                        key={roleOption.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(roleOption.value);
                          setFilterOpen(false);
                          setFiltersAddedOpen(true);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-sans transition-colors ${
                          selectedRole === roleOption.value
                            ? "border-accent-blue bg-accent-blue/10 text-text-primary"
                            : "border-border bg-bg-elevated text-text-secondary hover:border-text-primary hover:text-text-primary"
                        }`}
                      >
                        {roleOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          <Card className="p-0 overflow-hidden">
            <div className="grid gap-4 border-b border-border px-4 py-4 bg-bg-elevated/50 items-center" style={{ gridTemplateColumns: "2.6fr 2.3fr 1.4fr 1.1fr" }}>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Full Name</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Email</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Role</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Status</p>
            </div>
            {isFiltered ? (
              groupedUsers.map(({ role, users }) => (
                <div key={role}>
                  <div className="bg-bg-elevated border-b border-border px-4 py-3">
                    <p className="font-display text-sm text-text-primary">
                      {roleLabels[role]} ({users.length})
                    </p>
                  </div>
                  {users.map((user) => (
                    <DataRow key={`${role}-${user.id}`} columns={4} style={{ gridTemplateColumns: "2.6fr 2.3fr 1.4fr 1.1fr" }}>
                      <div className="truncate text-left">
                        <p className="text-sm text-text-primary font-semibold truncate">{user.name}</p>
                      </div>
                      <div className="truncate text-left">
                        <p className="text-sm text-text-secondary font-sans truncate">{user.email}</p>
                      </div>
                      <div className="truncate text-left">
                        <Badge variant="blue">{roleLabels[user.role]}</Badge>
                      </div>
                      <div className="flex items-center justify-start">
                        <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
                      </div>
                    </DataRow>
                  ))}
                </div>
              ))
            ) : (
              filteredUsers.map((user) => (
                <DataRow key={user.id} columns={4} style={{ gridTemplateColumns: "2.6fr 2.3fr 1.4fr 1.1fr" }}>
                  <div className="truncate text-left">
                    <p className="text-sm text-text-primary font-semibold truncate">{user.name}</p>
                  </div>
                  <div className="truncate text-left">
                    <p className="text-sm text-text-secondary font-sans truncate">{user.email}</p>
                  </div>
                  <div className="truncate text-left">
                    <Badge variant="blue">{roleLabels[user.role]}</Badge>
                  </div>
                  <div className="flex items-center justify-start">
                    <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
                  </div>
                </DataRow>
              ))
            )}
          </Card>

          <Modal
            isOpen={filtersAddedOpen}
            onClose={() => setFiltersAddedOpen(false)}
            title="Filters were added successfully"
          >
            <p className="text-text-secondary text-sm mb-6">Your filter selection has been applied.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setFiltersAddedOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setFiltersAddedOpen(false)}>Okay</Button>
            </div>
          </Modal>
        </>
      )}

      {section === "projects" && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-bg-elevated/40">
            <p className="text-sm font-sans text-text-secondary">
              All projects in one place. Scroll horizontally on smaller screens; columns stay aligned.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal min-w-[14rem]">
                    Project
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal min-w-[8.5rem]">
                    Owner
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[6.5rem]">
                    Code
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[7.5rem]">
                    Platform
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[8.5rem]">
                    Created
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-right w-[12rem]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const active = isPlatformProjectActive(project);
                  const vis =
                    project.visibility === "public" ? "Public" : project.visibility === "private" ? "Private" : project.visibility;
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border last:border-0 hover:bg-bg-elevated/20 transition-colors align-middle"
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-text-primary font-sans leading-snug">{project.title}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.flagged && <Badge variant="danger">Flagged</Badge>}
                            <Badge variant="default">{vis}</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-secondary font-sans">{project.owner}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="blue">{project.courseCode}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={active ? "success" : "warning"}>{active ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono text-text-secondary whitespace-nowrap">{project.createdAt}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={active}
                            onClick={() => {
                              setProjectPlatformActive(project.id, true);
                              setActionFeedbackMessage(`${project.title} was activated successfully.`);
                              setActionFeedbackOpen(true);
                            }}
                          >
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={!active}
                            onClick={() => setProjectDeactivateTarget(project)}
                          >
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === "employers" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader columns={["Company", "Email", "Location", "Status"]} />
          {employerUsers.map((user) => (
            <DataRow key={user.id} columns={4}>
              <p className="text-sm text-text-primary font-sans truncate">{user.companyName || user.name}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{user.companyEmail || user.email}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{user.location || user.address}</p>
              <Badge variant={user.verificationStatus === "approved" ? "success" : "warning"}>{user.verificationStatus || "pending"}</Badge>
            </DataRow>
          ))}
        </Card>
      )}

      {section === "approvals" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader columns={["Employer", "Contact", "Location", "Status"]} />
          {employerApplications.map((application) => (
            <DataRow key={application.id} columns={4}>
              <p className="text-sm text-text-primary font-sans truncate">{application.name}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{application.companyEmail}</p>
              <p className="text-sm text-text-secondary font-sans truncate">{application.location}</p>
              <Badge variant={application.verificationStatus === "pending" ? "warning" : "success"}>{application.verificationStatus}</Badge>
            </DataRow>
          ))}
        </Card>
      )}

      {section === "requests" && (
        <Card className="p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-border bg-bg-elevated/40">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">
                {instructorCourseRequests.length} pending
              </Badge>
              <p className="text-text-secondary text-sm font-sans">
                Accept to apply course links. Reject to decline without linking changes.
              </p>
            </div>
          </div>
          <DataHeader
            columns={["Instructor", "Email", "Course", "Type", "Requested", "Actions"]}
            style={{ gridTemplateColumns: "1.3fr 1.6fr 1.1fr 0.95fr 0.95fr 1.2fr" }}
            alignments={["text-left", "text-left", "text-left", "text-center", "text-center", "text-center"]}
          />
          {instructorCourseRequests.length === 0 ? (
            <div className="px-4 py-6 text-sm font-sans text-text-secondary border-b border-border">
              No pending instructor requests.
            </div>
          ) : (
            instructorCourseRequests.map((request) => (
              <DataRow
                key={request.id}
                columns={6}
                style={{ gridTemplateColumns: "1.3fr 1.6fr 1.1fr 0.95fr 0.95fr 1.2fr" }}
              >
                <p className="text-sm text-text-primary font-semibold truncate">{request.instructorName}</p>
                <p className="text-sm text-text-secondary font-sans truncate">{request.instructorEmail}</p>
                <div className="min-w-0 text-left">
                  <p className="text-sm text-text-primary font-sans truncate">{request.courseCode}</p>
                  <p className="text-xs text-text-secondary font-sans truncate">{request.courseName}</p>
                </div>
                <div className="flex justify-center">
                  <Badge variant={request.type === "unlink" ? "warning" : "success"}>
                    {request.type === "unlink" ? "Unlink" : "Link"}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary font-mono text-center">{request.requestedAt}</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      applyInstructorCourseRequestDecision(request.id, true);
                      setActionFeedbackMessage("This step was completed successfully.");
                      setActionFeedbackOpen(true);
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      applyInstructorCourseRequestDecision(request.id, false);
                      setActionFeedbackMessage("This step was completed successfully.");
                      setActionFeedbackOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </DataRow>
            ))
          )}
        </Card>
      )}

      {section === "flagged" && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="danger">{getFlaggedProjects().length} flagged</Badge>
            <span className="text-text-secondary text-sm font-sans">
              Deactivate automatically when instructors or administrators record a flag — use the controls to hide listings or restore visibility.
            </span>
          </div>
          <Card className="p-0 overflow-hidden">
            <DataHeader
              columns={["Project", "Owner", "Course", "Reason", "Visibility", "Moderation"]}
              style={{ gridTemplateColumns: "1.6fr 1.1fr 0.75fr minmax(0, 1.55fr) 0.95fr 1.4fr" }}
              alignments={["text-left", "text-left", "text-center", "text-left", "text-center", "text-center"]}
            />
            {getFlaggedProjects().length === 0 ? (
              <div className="px-4 py-6 text-sm font-sans text-text-secondary border-b border-border">
                No flagged projects at this time.
              </div>
            ) : (
              getFlaggedProjects().map((project) => {
                const hidden = project.hiddenFromPublic === true;
                const active = isPlatformProjectActive(project);
                return (
                  <DataRow
                    key={project.id}
                    columns={6}
                    style={{ gridTemplateColumns: "1.6fr 1.1fr 0.75fr minmax(0, 1.55fr) 0.95fr 1.4fr" }}
                  >
                    <p className="text-sm text-text-primary font-semibold font-sans truncate">{project.title}</p>
                    <p className="text-sm text-text-secondary font-sans truncate">{project.owner}</p>
                    <div className="flex justify-center">
                      <Badge variant="blue">{project.courseCode}</Badge>
                    </div>
                    <p className="text-sm text-text-secondary font-sans whitespace-normal break-words leading-relaxed">
                      {project.flagReason || "—"}
                    </p>
                    <div className="flex flex-col items-center gap-1 justify-center">
                      {hidden ? (
                        <Badge variant="warning">Hidden from public</Badge>
                      ) : (
                        <Badge variant="success">Listed (review)</Badge>
                      )}
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary">
                        {active ? "Active pipeline" : "Paused pipeline"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 justify-center items-stretch">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={hidden}
                        onClick={() => {
                          const result = adminHideFlaggedProject(project.id);
                          if (!result.ok) return;
                          setActionFeedbackMessage(`${project.title} is now hidden from public discovery.`);
                          setActionFeedbackOpen(true);
                        }}
                      >
                        Hide from public
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const result = adminClearProjectFlag(project.id);
                          if (!result.ok) return;
                          setActionFeedbackMessage(`${project.title} flag was cleared and visibility restored.`);
                          setActionFeedbackOpen(true);
                        }}
                      >
                        Clear flag & keep visible
                      </Button>
                    </div>
                  </DataRow>
                );
              })
            )}
          </Card>
        </>
      )}

      {section === "appeals" && (
        <Card className="p-0 overflow-hidden">
          <DataHeader
            columns={["Student", "Project", "Submitted", "Status", "Message preview"]}
            style={{ gridTemplateColumns: "1.1fr 1.3fr 0.85fr 0.75fr minmax(0, 2.2fr)" }}
            alignments={["text-left", "text-left", "text-center", "text-center", "text-left"]}
          />
          {getProjectAppeals().length === 0 ? (
            <div className="px-4 py-6 text-sm font-sans text-text-secondary border-b border-border">
              Appeals will appear automatically when students reply to flags.
            </div>
          ) : (
            getProjectAppeals().map((appeal) => (
              <DataRow
                key={appeal.id}
                columns={5}
                style={{ gridTemplateColumns: "1.1fr 1.3fr 0.85fr 0.75fr minmax(0, 2.2fr)" }}
              >
                <div className="min-w-0 text-left space-y-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{appeal.studentName}</p>
                  <p className="text-[11px] font-mono text-text-secondary truncate">{appeal.studentEmail}</p>
                </div>
                <p className="text-sm text-text-secondary font-sans truncate">{appeal.projectTitle}</p>
                <p className="text-xs font-mono text-text-secondary text-center">{appeal.submittedAt}</p>
                <div className="flex justify-center">
                  <Badge variant={appeal.status === "pending" ? "warning" : "success"}>{appeal.status}</Badge>
                </div>
                <p className="text-sm text-text-secondary font-sans whitespace-normal break-words leading-relaxed line-clamp-4">
                  {appeal.message}
                </p>
              </DataRow>
            ))
          )}
        </Card>
      )}

      <Modal
        isOpen={actionFeedbackOpen}
        onClose={() => setActionFeedbackOpen(false)}
        title="Success"
      >
        <p className="text-text-secondary text-sm mb-6">{actionFeedbackMessage}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={() => setActionFeedbackOpen(false)}>Okay</Button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(projectDeactivateTarget)}
        onClose={() => setProjectDeactivateTarget(null)}
        title="Deactivate project"
      >
        <p className="text-text-secondary text-sm mb-6">
          Are you sure you want to deactivate {projectDeactivateTarget?.title ?? "this project"}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setProjectDeactivateTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!projectDeactivateTarget?.id) return;
              setProjectPlatformActive(projectDeactivateTarget.id, false);
              const title = projectDeactivateTarget.title;
              setProjectDeactivateTarget(null);
              setActionFeedbackMessage(`${title} was deactivated successfully.`);
              setActionFeedbackOpen(true);
            }}
          >
            Yes
          </Button>
        </div>
      </Modal>
    </div>
  );
}
