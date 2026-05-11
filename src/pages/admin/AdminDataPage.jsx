import { useEffect, useMemo, useState, useContext, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, ConfirmActionModal, Modal } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import {
  adminApproveEmployer,
  adminClearProjectFlag,
  adminHideFlaggedProject,
  adminRejectEmployer,
  dummyUsers,
  employerApplications,
  getProjectAppeals,
  instructorDirectory,
  portfolios,
  setProjectPlatformActive,
  subscribeDummyUpdates,
} from "../../data/dummy";
import { UserProfileLink } from "../../components/UserProfileLink";
import { ProjectTitleLink } from "../../components/ProjectTitleLink";
import { getPortfolioOrProfilePathForUser } from "../../utils/userPortfolioPath";

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

/** Normalized row status: only `"active"` is active; missing or other → inactive label in UI */
function effectiveUserStatus(user) {
  return user?.status === "active" ? "active" : "inactive";
}

function statusLabel(status) {
  return status === "active" ? "Active" : "Inactive";
}

function employerAdminDisplayName(row) {
  return row.companyName || row.name || "Company";
}

/** Raw status from row → filter key (accepted maps from approved) */
function employerRowStatusKey(row) {
  const raw = (row.verificationStatus || "pending").toLowerCase();
  if (raw === "approved") return "accepted";
  if (raw === "rejected") return "rejected";
  return "pending";
}

function employerStatusBadgeProps(row) {
  const key = employerRowStatusKey(row);
  if (key === "accepted") return { variant: "success", label: "accepted" };
  if (key === "rejected") return { variant: "danger", label: "rejected" };
  return { variant: "warning", label: "pending" };
}

/** Stable key for matching admin actions to rows (local + seed + overrides). */
function employerVerificationRowKey(row) {
  return String(row.companyEmail || row.email || row.contact || "").trim().toLowerCase();
}

function applyVerificationStatusFlash(row, flashByKey) {
  const key = employerVerificationRowKey(row);
  const flash = key ? flashByKey[key] : null;
  if (!flash) return row;
  return { ...row, verificationStatus: flash };
}

/**
 * Reject · Accept · details arrow in one row. When verification is not pending, Reject/Accept stay
 * in the layout but are invisible and inert so the column width does not jump after a decision.
 */
function EmployerVerificationActionsCell({ row, onReject, onAccept, onDetails }) {
  const pending = (row.verificationStatus || "pending").toLowerCase() === "pending";
  const ghostRejectAccept = pending ? "" : "invisible pointer-events-none select-none";
  return (
    <div className="inline-flex min-w-[13.75rem] flex-nowrap items-center justify-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="danger"
        tabIndex={pending ? 0 : -1}
        aria-hidden={!pending}
        className={`min-w-[5.25rem] shrink-0 px-3 ${ghostRejectAccept}`}
        onClick={onReject}
      >
        Reject
      </Button>
      <Button
        type="button"
        size="sm"
        variant="gold"
        tabIndex={pending ? 0 : -1}
        aria-hidden={!pending}
        className={`min-w-[5.25rem] shrink-0 px-3 ${ghostRejectAccept}`}
        onClick={onAccept}
      >
        Accept
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center p-0"
        aria-label="View company details"
        title="View details"
        onClick={onDetails}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 12h16M14 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}

/** Resolve portfolio URL for registered employers or pending employer applications */
function resolveEmployerPortfolioPath(row) {
  const email = row.companyEmail || row.email;
  if (row.role === "employer" && row.id != null) {
    return `/explore/portfolio/employer-${row.id}`;
  }
  const registered = dummyUsers.find(
    (u) =>
      u.role === "employer" &&
      (u.companyEmail === email || u.email === email)
  );
  if (registered) return `/explore/portfolio/employer-${registered.id}`;
  if (row.id != null && employerApplications.some((a) => String(a.id) === String(row.id))) {
    return `/explore/portfolio/employer-application-${row.id}`;
  }
  const appMatch = employerApplications.find(
    (a) =>
      a.companyEmail === email ||
      a.contact === email ||
      a.email === email
  );
  if (appMatch) return `/explore/portfolio/employer-application-${appMatch.id}`;
  return null;
}

export default function AdminDataPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { updateVerificationStatus, getLocalUsers } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
  const [selectedRole, setSelectedRole] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersAddedOpen, setFiltersAddedOpen] = useState(false);
  const [, bumpDummyRevision] = useState(0);
  useEffect(() => subscribeDummyUpdates(() => bumpDummyRevision((n) => n + 1)), []);
  const [actionFeedbackOpen, setActionFeedbackOpen] = useState(false);
  const [actionFeedbackMessage, setActionFeedbackMessage] = useState("");
  const [projectDeactivateTarget, setProjectDeactivateTarget] = useState(null);
  const [projectActivateTarget, setProjectActivateTarget] = useState(null);
  const [flaggedActionConfirm, setFlaggedActionConfirm] = useState(null);
  const [appealFilter, setAppealFilter] = useState("all");
  const [employerVerificationConfirm, setEmployerVerificationConfirm] = useState(null);
  /** Shown immediately on Accept/Reject; cleared once persisted data matches (same frame as storage for typical paths). */
  const [verificationStatusFlash, setVerificationStatusFlash] = useState({});
  const [employerStatusFilter, setEmployerStatusFilter] = useState("all");
  const [employerStatusFilterOpen, setEmployerStatusFilterOpen] = useState(false);
  const employerFilterRef = useRef(null);

  useEffect(() => {
    if (!employerStatusFilterOpen) return;
    const close = (e) => {
      if (employerFilterRef.current && !employerFilterRef.current.contains(e.target)) {
        setEmployerStatusFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [employerStatusFilterOpen]);

  const localEmployers = useMemo(() => {
    return getLocalUsers().filter(u => u.role === 'employer');
  }, [getLocalUsers, bumpDummyRevision]);

  // Merge hardcoded ones + local ones
  const allEmployerUsers = useMemo(() => {
    const hardcoded = dummyUsers.filter((user) => user.role === "employer");
    const local = localEmployers;
    
    // Create a map to unique by email
    const map = new Map();
    const overrides = JSON.parse(localStorage.getItem('gucUserOverrides') || '{}');

    hardcoded.forEach((u) => {
      const oLogin = overrides[u.email] || {};
      const oCompany = u.companyEmail ? overrides[u.companyEmail] || {} : {};
      const combined = { ...oLogin, ...oCompany };
      map.set(u.email, Object.keys(combined).length ? { ...u, ...combined } : u);
    });

    local.forEach((u) => {
      const email = u.companyEmail || u.email;
      const oEmail = overrides[u.email] || {};
      const oCompany = u.companyEmail ? overrides[u.companyEmail] || {} : {};
      const combined = { ...oEmail, ...oCompany };
      map.set(email, Object.keys(combined).length ? { ...u, ...combined } : { ...u, verificationStatus: u.verificationStatus || "pending" });
    });
    
    // Also include companies from "approvals" that might not have a full user record yet
    employerApplications.forEach(app => {
      const email = app.companyEmail || app.email;
      const override = overrides[email];
      if (!map.has(email)) {
        map.set(email, override ? { ...app, ...override } : app);
      }
    });

    return Array.from(map.values());
  }, [localEmployers, bumpDummyRevision]);

  const filteredEmployerUsers = useMemo(() => {
    if (employerStatusFilter === "all") return allEmployerUsers;
    return allEmployerUsers.filter((row) => {
      const displayRow = applyVerificationStatusFlash(row, verificationStatusFlash);
      return employerRowStatusKey(displayRow) === employerStatusFilter;
    });
  }, [allEmployerUsers, employerStatusFilter, verificationStatusFlash]);

  const allEmployerApplications = useMemo(() => {
    // Merge hardcoded apps with overrides
    // Use the component's revision to force a fresh read from localStorage
    const overrides = JSON.parse(localStorage.getItem('gucUserOverrides') || '{}');

    // Map existing hardcoded ones to a common format if needed
    // And add newly registered ones from localUsers
    const localApps = localEmployers.map((u) => {
      const oEmail = u.email ? overrides[u.email] || {} : {};
      const oCompany = u.companyEmail ? overrides[u.companyEmail] || {} : {};
      const override = { ...oEmail, ...oCompany };
      return {
        id: u.id,
        name: u.companyName || u.name,
        contact: u.email,
        companyEmail: u.companyEmail || u.email,
        location: u.location || u.address || "Unknown",
        verificationStatus: override.verificationStatus || u.verificationStatus || "pending",
        uploadedDocs: u.uploadedDocs || (u.taxCert ? [{ id: "tax-cert", name: "tax_certificate.pdf", data: u.taxCert }] : []),
        isLocal: true,
        email: u.email,
      };
    });

    const mergedHardcoded = employerApplications.map((app) => {
      const override =
        overrides[app.companyEmail] || overrides[app.contact] || overrides[app.email] || null;
      return override ? { ...app, ...override } : app;
    });

    return [...mergedHardcoded, ...localApps];
  }, [localEmployers, bumpDummyRevision]);

  const sortedEmployerApprovals = useMemo(() => {
    return [...allEmployerApplications].sort((a, b) => {
      const ap = (a.verificationStatus || "pending").toLowerCase() === "pending" ? 0 : 1;
      const bp = (b.verificationStatus || "pending").toLowerCase() === "pending" ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return String(a.name ?? "").localeCompare(String(b.name ?? ""));
    });
  }, [allEmployerApplications]);

  useEffect(() => {
    setVerificationStatusFlash((prev) => {
      const flashKeys = Object.keys(prev);
      if (!flashKeys.length) return prev;
      const rows = [...allEmployerUsers, ...allEmployerApplications];
      let next = prev;
      let changed = false;
      for (const flashKey of flashKeys) {
        const want = String(prev[flashKey] || "").toLowerCase();
        const persisted = rows.find((r) => employerVerificationRowKey(r) === flashKey);
        if (!persisted) continue;
        const actual = String(persisted.verificationStatus || "pending").toLowerCase();
        if (actual === want) {
          if (!changed) {
            next = { ...prev };
            changed = true;
          }
          delete next[flashKey];
        }
      }
      return changed ? next : prev;
    });
  }, [allEmployerUsers, allEmployerApplications, bumpDummyRevision]);

  const isFiltered = Boolean(selectedRole);
  const filteredUsers = useMemo(() => {
    const availableRoles = roleOptions.map((option) => option.value);
    const visibleRoles = selectedRole ? [selectedRole] : availableRoles;
    return dummyUsers.filter((user) => visibleRoles.includes(user.role));
  }, [selectedRole, bumpDummyRevision]);

  const flaggedProjects = useMemo(
    () => projectList.filter((project) => project.flagged === true),
    [projectList]
  );

  const page = pageTitles[section] || ["Admin Console", "Platform data and systems management."];

  const pageShellClass =
    section === "employers" || section === "approvals"
      ? "mx-auto w-full max-w-[min(100%,96rem)] px-4 sm:px-6 lg:px-8"
      : "mx-auto max-w-6xl px-4";

  const openEmployerCompanyProfile = (row) => {
    const path = resolveEmployerPortfolioPath(row);
    if (!path) {
      setActionFeedbackMessage("No company profile is available for this entry.");
      setActionFeedbackOpen(true);
      return;
    }
    navigate(path, {
      state: {
        profileOpenedToast: `Opened ${employerAdminDisplayName(row)} profile`,
      },
    });
  };

  if (section === "requests") {
    return <Navigate to="/requests" replace />;
  }

  return (
    <div className={pageShellClass}>
      <PageHeader
        title={page[0]}
        subtitle={page[1]}
        action={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
        }
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
                          setActionFeedbackMessage('Filters were added successfully.'); setActionFeedbackOpen(true);
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
            <div
              className="grid gap-4 border-b border-border px-4 py-4 bg-bg-elevated/50 items-center"
              style={{ gridTemplateColumns: "2.4fr 2.1fr 1.35fr 8rem auto" }}
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Full Name</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Email</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Role</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-left">Status</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary text-center w-12 shrink-0" title="Public profile">
                Profile
              </p>
            </div>
            {isFiltered && (
              <div className="bg-bg-elevated border-b border-border px-4 py-3">
                <p className="font-display text-sm text-text-primary">
                  {roleLabels[selectedRole]} ({filteredUsers.length})
                </p>
              </div>
            )}
            <div key={selectedRole || "all-roles"}>
              {filteredUsers.map((user) => {
                const profilePath = getPortfolioOrProfilePathForUser(user);
                const rowStatus = effectiveUserStatus(user);
                return (
                  <DataRow
                    key={`${selectedRole || "all"}-${user.id}-${user.email}`}
                    columns={5}
                    style={{ gridTemplateColumns: "2.4fr 2.1fr 1.35fr 8rem auto" }}
                  >
                    <div className="truncate text-left">
                      <p className="text-sm text-text-primary font-semibold truncate">
                        <UserProfileLink user={user} className="font-semibold">
                          {user.name}
                        </UserProfileLink>
                      </p>
                    </div>
                    <div className="truncate text-left">
                      <p className="text-sm text-text-secondary font-sans truncate">{user.email}</p>
                    </div>
                    <div className="truncate text-left">
                      <Badge variant="blue">{roleLabels[user.role]}</Badge>
                    </div>
                    <div className="flex items-center justify-start min-w-0">
                      <Badge
                        variant={rowStatus === "active" ? "success" : "danger"}
                        className="inline-flex px-3 py-1 min-w-[5.75rem] justify-center whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide"
                      >
                        {statusLabel(rowStatus)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center w-12 shrink-0">
                      {profilePath ? (
                        <Link
                          to={profilePath}
                          title={`Open portfolio for ${user.name}`}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-blue/50 text-accent-blue hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                          aria-label={`Open profile or portfolio for ${user.name}`}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0"
                            aria-hidden
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </Link>
                      ) : (
                        <span
                          className="text-xs text-text-muted"
                          title={isFiltered ? "No public portfolio slug for this user" : "No public portfolio path for this role"}
                        >
                          —
                        </span>
                      )}
                    </div>
                  </DataRow>
                );
              })}
            </div>
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
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal min-w-[12rem]">
                    Project
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal min-w-[8.5rem]">
                    Owner
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[6.5rem]">
                    Code
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[8rem]">
                    Status
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[7.5rem]">
                    Platform
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[8.5rem]">
                    Created
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center whitespace-nowrap w-[14rem]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectList.map((project) => {
                  const active = isPlatformProjectActive(project);
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border last:border-0 hover:bg-bg-elevated/20 transition-colors align-middle"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-text-primary font-sans leading-snug break-words">
                          <ProjectTitleLink
                            project={project}
                            className="font-semibold text-text-primary font-sans"
                            navState={{ activeNav: "/admin/projects" }}
                            stopPropagation={false}
                          />
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-secondary font-sans">
                          <UserProfileLink ownerName={project.owner}>{project.owner}</UserProfileLink>
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="blue">{project.courseCode}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={project.flagged ? "danger" : "success"}>
                          {project.flagged ? "Flagged" : "Not flagged"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={active ? "success" : "warning"}>{active ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono text-text-secondary whitespace-nowrap">{project.createdAt}</span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap align-middle">
                        <div className="inline-flex flex-nowrap items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={active}
                            onClick={() => setProjectActivateTarget(project)}
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
        <>
          <div
            ref={employerFilterRef}
            className="relative mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="blue">
                  {filteredEmployerUsers.length} compan{filteredEmployerUsers.length === 1 ? "y" : "ies"}
                </Badge>
              </div>
            </div>

            <div className="relative">
              <Button
                variant="secondary"
                className="inline-flex items-center gap-2"
                aria-expanded={employerStatusFilterOpen}
                aria-haspopup="listbox"
                aria-label="Filter companies by verification status"
                onClick={() => setEmployerStatusFilterOpen((open) => !open)}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                  </svg>
                </span>
                {employerStatusFilter === "all"
                  ? "Filter by status"
                  : employerStatusFilter === "pending"
                    ? "Filter: Pending"
                    : employerStatusFilter === "accepted"
                      ? "Filter: Accepted"
                      : "Filter: Rejected"}
              </Button>
              {employerStatusFilterOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-bg-base p-3 shadow-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-display text-sm text-text-primary">Select status</p>
                    <button
                      type="button"
                      onClick={() => setEmployerStatusFilterOpen(false)}
                      className="text-sm text-text-secondary hover:text-text-primary"
                    >
                      Close
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmployerStatusFilter("all");
                      setEmployerStatusFilterOpen(false);
                    }}
                    className="mb-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-left text-sm font-sans text-text-secondary hover:border-text-primary hover:text-text-primary"
                  >
                    Clear filter
                  </button>
                  <div className="grid gap-2">
                    {[
                      { id: "pending", label: "Pending" },
                      { id: "accepted", label: "Accepted" },
                      { id: "rejected", label: "Rejected" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={employerStatusFilter === opt.id}
                        onClick={() => {
                          setEmployerStatusFilter(opt.id);
                          setEmployerStatusFilterOpen(false);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-sans transition-colors ${
                          employerStatusFilter === opt.id
                            ? "border-accent-blue bg-accent-blue/10 text-text-primary"
                            : "border-border bg-bg-elevated text-text-secondary hover:border-text-primary hover:text-text-primary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[56rem] table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  <th className="min-w-[11rem] px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Company
                  </th>
                  <th className="min-w-[13rem] px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Email
                  </th>
                  <th className="min-w-[16rem] px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Location
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Status
                  </th>
                  <th className="min-w-[15rem] whitespace-nowrap px-3 py-3 pr-4 text-center font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployerUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-secondary font-sans">
                      No companies match this filter.
                    </td>
                  </tr>
                )}
                {filteredEmployerUsers.map((row) => {
                  const displayRow = applyVerificationStatusFlash(row, verificationStatusFlash);
                  const statusBadge = employerStatusBadgeProps(displayRow);
                  const companyProfilePath = resolveEmployerPortfolioPath(row);
                  return (
                    <tr
                      key={`${row.companyEmail || row.email || ""}-${row.id}`}
                      className="border-b border-border last:border-0 hover:bg-bg-elevated/25 transition-colors"
                    >
                      <td className="min-w-0 px-3 py-3 align-top text-sm font-sans text-text-primary">
                        {companyProfilePath ? (
                          <Link
                            to={companyProfilePath}
                            className="block break-words leading-snug text-inherit hover:text-accent-gold hover:underline"
                          >
                            {row.companyName || row.name}
                          </Link>
                        ) : (
                          <span className="block break-words leading-snug">{row.companyName || row.name}</span>
                        )}
                      </td>
                      <td className="min-w-0 px-3 py-3 align-top text-sm font-sans text-text-secondary">
                        <span className="block break-all leading-snug">{row.companyEmail || row.email}</span>
                      </td>
                      <td className="min-w-0 px-3 py-3 align-top text-sm font-sans text-text-secondary">
                        <span className="block whitespace-normal break-words leading-snug">{row.location || row.address || "—"}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-left">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </td>
                      <td className="min-w-0 whitespace-nowrap px-3 py-3 pr-4 align-middle text-center">
                        <EmployerVerificationActionsCell
                          row={displayRow}
                          onReject={() =>
                            setEmployerVerificationConfirm({
                              type: "reject",
                              email: row.companyEmail || row.email || row.contact,
                              displayName: employerAdminDisplayName(row),
                            })
                          }
                          onAccept={() =>
                            setEmployerVerificationConfirm({
                              type: "approve",
                              email: row.companyEmail || row.email || row.contact,
                              displayName: employerAdminDisplayName(row),
                            })
                          }
                          onDetails={() => openEmployerCompanyProfile(row)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {section === "approvals" && (
        <Card className="p-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[56rem] table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  <th className="min-w-[11rem] px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Employer
                  </th>
                  <th className="min-w-[13rem] px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Contact
                  </th>
                  <th className="min-w-[16rem] px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Location
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Status
                  </th>
                  <th className="min-w-[15rem] whitespace-nowrap px-3 py-3 pr-4 text-center font-mono text-[11px] font-normal uppercase tracking-widest text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployerApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-secondary font-sans">
                      No employer applications on file.
                    </td>
                  </tr>
                ) : (
                  sortedEmployerApprovals.map((application) => {
                    const displayApp = applyVerificationStatusFlash(application, verificationStatusFlash);
                    const appStatus = employerStatusBadgeProps(displayApp);
                    return (
                      <tr
                        key={`${application.companyEmail}-${application.id}`}
                        className="border-b border-border last:border-0 hover:bg-bg-elevated/25 transition-colors"
                      >
                        <td className="min-w-0 px-3 py-3 align-top text-sm font-sans text-text-primary">
                          <span className="block break-words leading-snug">{application.name}</span>
                        </td>
                        <td className="min-w-0 px-3 py-3 align-top text-sm font-sans text-text-secondary">
                          <span className="block break-all leading-snug">{application.companyEmail}</span>
                        </td>
                        <td className="min-w-0 px-3 py-3 align-top text-sm font-sans text-text-secondary">
                          <span className="block whitespace-normal break-words leading-snug">{application.location || "—"}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 align-middle text-left">
                          <Badge variant={appStatus.variant}>{appStatus.label}</Badge>
                        </td>
                        <td className="min-w-0 whitespace-nowrap px-3 py-3 pr-4 align-middle text-center">
                          <EmployerVerificationActionsCell
                            row={displayApp}
                            onReject={() =>
                              setEmployerVerificationConfirm({
                                type: "reject",
                                email: application.companyEmail || application.email || application.contact,
                                displayName: employerAdminDisplayName(application),
                              })
                            }
                            onAccept={() =>
                              setEmployerVerificationConfirm({
                                type: "approve",
                                email: application.companyEmail || application.email || application.contact,
                                displayName: employerAdminDisplayName(application),
                              })
                            }
                            onDetails={() => openEmployerCompanyProfile(application)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {section === "flagged" && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="danger">{flaggedProjects.length} flagged</Badge>
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
            {flaggedProjects.length === 0 ? (
              <div className="px-4 py-6 text-sm font-sans text-text-secondary border-b border-border">
                No flagged projects at this time.
              </div>
            ) : (
              flaggedProjects.map((project) => {
                const hidden = project.hiddenFromPublic === true;
                const active = isPlatformProjectActive(project);
                return (
                  <DataRow
                    key={project.id}
                    columns={6}
                    style={{ gridTemplateColumns: "1.6fr 1.1fr 0.75fr minmax(0, 1.55fr) 0.95fr 1.4fr" }}
                  >
                    <p className="text-sm text-text-primary font-semibold font-sans truncate">
                      <ProjectTitleLink
                        project={project}
                        className="font-semibold text-text-primary font-sans"
                        navState={{ activeNav: "/admin/flagged" }}
                        stopPropagation={false}
                      />
                    </p>
                    <p className="text-sm text-text-secondary font-sans truncate">
                      <UserProfileLink ownerName={project.owner}>{project.owner}</UserProfileLink>
                    </p>
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
                        onClick={() => setFlaggedActionConfirm({ project, action: "hide" })}
                      >
                        Hide from public
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setFlaggedActionConfirm({ project, action: "clear" })}
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
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-text-secondary font-sans">Appeals:</span>
            <Button size="sm" variant={appealFilter === "all" ? "primary" : "secondary"} onClick={() => setAppealFilter("all")}>
              All
            </Button>
            <Button size="sm" variant={appealFilter === "pending" ? "primary" : "secondary"} onClick={() => setAppealFilter("pending")}>
              Unresolved
            </Button>
            <Button size="sm" variant={appealFilter === "resolved" ? "primary" : "secondary"} onClick={() => setAppealFilter("resolved")}>
              Resolved
            </Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <DataHeader
              columns={["Student", "Project", "Submitted", "Status", "Message preview"]}
              style={{ gridTemplateColumns: "1.1fr 1.3fr 0.85fr 0.75fr minmax(0, 2.2fr)" }}
              alignments={["text-left", "text-left", "text-center", "text-center", "text-left"]}
            />
            {(() => {
              const appealsShown = getProjectAppeals().filter((appeal) => {
                if (appealFilter === "pending") return appeal.status === "pending";
                if (appealFilter === "resolved") return appeal.status === "resolved";
                return true;
              });
              if (appealsShown.length === 0) {
                return (
                  <div className="px-4 py-6 text-sm font-sans text-text-secondary border-b border-border">
                    {getProjectAppeals().length === 0
                      ? "Appeals will appear automatically when students reply to flags."
                      : "No appeals match this filter."}
                  </div>
                );
              }
              return appealsShown.map((appeal) => (
                <DataRow
                  key={appeal.id}
                  columns={5}
                  style={{ gridTemplateColumns: "1.1fr 1.3fr 0.85fr 0.75fr minmax(0, 2.2fr)" }}
                >
                  <div className="min-w-0 text-left space-y-1">
                    <p className="text-sm font-semibold text-text-primary whitespace-normal break-words">
                      <UserProfileLink
                        participant={{ name: appeal.studentName, email: appeal.studentEmail }}
                        className="font-semibold"
                      >
                        {appeal.studentName}
                      </UserProfileLink>
                    </p>
                    <p className="text-[11px] font-mono text-text-secondary whitespace-normal break-all">{appeal.studentEmail}</p>
                  </div>
                  <p className="text-sm text-text-secondary font-sans whitespace-normal break-words">
                    <ProjectTitleLink
                      projectId={appeal.projectId}
                      className="text-sm text-text-secondary font-sans"
                      navState={{ activeNav: "/admin/appeals" }}
                      stopPropagation={false}
                    >
                      {appeal.projectTitle}
                    </ProjectTitleLink>
                  </p>
                  <p className="text-xs font-mono text-text-secondary text-center whitespace-normal">{appeal.submittedAt}</p>
                  <div className="flex justify-center">
                    <Badge variant={appeal.status === "pending" ? "warning" : "success"}>
                      {appeal.status === "pending" ? "Unresolved" : "Resolved"}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary font-sans whitespace-normal break-words leading-relaxed">
                    {appeal.message}
                  </p>
                </DataRow>
              ));
            })()}
          </Card>
        </>
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

      <ConfirmActionModal
        isOpen={Boolean(projectDeactivateTarget)}
        action={`deactivate "${projectDeactivateTarget?.title ?? "this project"}"`}
        variant="danger"
        onClose={() => setProjectDeactivateTarget(null)}
        onConfirm={() => {
          if (!projectDeactivateTarget?.id) return;
          setProjectPlatformActive(projectDeactivateTarget.id, false);
          updateProject(projectDeactivateTarget.id, { platformActive: false });
          const title = projectDeactivateTarget.title;
          setProjectDeactivateTarget(null);
          setActionFeedbackMessage(`${title} was deactivated successfully.`);
          setActionFeedbackOpen(true);
        }}
      />

      <ConfirmActionModal
        isOpen={Boolean(projectActivateTarget)}
        action={`activate "${projectActivateTarget?.title ?? "this project"}"`}
        variant="gold"
        onClose={() => setProjectActivateTarget(null)}
        onConfirm={() => {
          if (!projectActivateTarget?.id) return;
          if (projectActivateTarget.flagged) adminClearProjectFlag(projectActivateTarget.id);
          setProjectPlatformActive(projectActivateTarget.id, true);
          updateProject(projectActivateTarget.id, {
            platformActive: true,
            flagged: false,
            flagReason: null,
            hiddenFromPublic: false,
            appealSubmitted: false,
          });
          const title = projectActivateTarget.title;
          setProjectActivateTarget(null);
          setActionFeedbackMessage(`${title} was activated successfully.`);
          setActionFeedbackOpen(true);
        }}
      />

      <ConfirmActionModal
        isOpen={employerVerificationConfirm !== null}
        action={
          employerVerificationConfirm?.type === "approve"
            ? `accept verification for "${employerVerificationConfirm.displayName}"`
            : `reject verification for "${employerVerificationConfirm?.displayName ?? "this company"}"`
        }
        variant={employerVerificationConfirm?.type === "approve" ? "gold" : "danger"}
        onClose={() => setEmployerVerificationConfirm(null)}
        onConfirm={() => {
          if (!employerVerificationConfirm?.email) return;
          const email = employerVerificationConfirm.email;
          const approve = employerVerificationConfirm.type === "approve";
          const nextStatus = approve ? "approved" : "rejected";
          const flashKey = employerVerificationRowKey({ companyEmail: email, email, contact: email });
          if (flashKey) {
            setVerificationStatusFlash((prev) => ({ ...prev, [flashKey]: nextStatus }));
          }
          const needle = String(email).trim().toLowerCase();
          const seedApp = employerApplications.find((a) => {
            const ids = [a.companyEmail, a.contact, a.email].filter(Boolean).map((x) => String(x).trim().toLowerCase());
            return ids.some((id) => id === needle);
          });
          if (seedApp?.verificationStatus === "pending") {
            if (approve) adminApproveEmployer(seedApp.id);
            else adminRejectEmployer(seedApp.id);
          }
          updateVerificationStatus(email, nextStatus);
          bumpDummyRevision((prev) => prev + 1);
          setActionFeedbackMessage(
            approve
              ? `Application accepted for ${employerVerificationConfirm.displayName}`
              : `Application rejected for ${employerVerificationConfirm.displayName}`
          );
          setActionFeedbackOpen(true);
        }}
      />

      <ConfirmActionModal
        isOpen={flaggedActionConfirm !== null}
        action={
          flaggedActionConfirm?.action === "hide"
            ? `hide "${flaggedActionConfirm?.project?.title}" from public discovery`
            : `clear the flag on "${flaggedActionConfirm?.project?.title}" and restore visibility`
        }
        variant={flaggedActionConfirm?.action === "hide" ? "danger" : "gold"}
        onClose={() => setFlaggedActionConfirm(null)}
        onConfirm={() => {
          if (!flaggedActionConfirm?.project) return;
          if (flaggedActionConfirm.action === "hide") {
            adminHideFlaggedProject(flaggedActionConfirm.project.id);
            updateProject(flaggedActionConfirm.project.id, {
              hiddenFromPublic: true,
              platformActive: false,
            });
            setActionFeedbackMessage(`${flaggedActionConfirm.project.title} is now hidden from public discovery.`);
          } else {
            adminClearProjectFlag(flaggedActionConfirm.project.id);
            setProjectPlatformActive(flaggedActionConfirm.project.id, true);
            updateProject(flaggedActionConfirm.project.id, {
              flagged: false,
              flagReason: null,
              hiddenFromPublic: false,
              platformActive: true,
              appealSubmitted: false,
            });
            setActionFeedbackMessage(`${flaggedActionConfirm.project.title} flag was cleared and visibility restored.`);
          }
          setFlaggedActionConfirm(null);
          setActionFeedbackOpen(true);
        }}
      />
    </div>
  );
}






