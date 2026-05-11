import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, ConfirmActionModal, Input, Modal } from "../../components/ui";
import {
  IconCoursesAccent,
  IconInternshipsAccent,
  IconProjectsAccent,
  IconUsersAccent,
  MiniSparkline,
} from "../../components/admin/AdminMetricVisuals";
import {
  courses,
  dummyUsers,
  employerApplications,
  emitDummyUpdate,
  getInternshipCatalogSnapshot,
  projects,
  subscribeDummyUpdates,
} from "../../data/dummy";

const shortcuts = [
  {
    title: "Users",
    subtitle: "Names, emails, roles",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    path: "/admin/users",
  },
  {
    title: "Courses",
    subtitle: "Course catalog",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h5v16H4z" />
        <path d="M9 4h11v16H9z" />
        <path d="M9 8h11" />
        <path d="M9 12h11" />
      </svg>
    ),
    path: "/courses",
  },
  {
    title: "Projects",
    subtitle: "Submitted projects",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    path: "/admin/projects",
  },
  {
    title: "Employers",
    subtitle: "Company accounts",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V4h8v3" />
        <path d="M12 11v4" />
      </svg>
    ),
    path: "/admin/employers",
  },
  { title: "Approvals", subtitle: "Pending employer docs", icon: "✓", path: "/admin/approvals" },
  { title: "Appeals", subtitle: "Student flag appeals", icon: "✉", path: "/admin/appeals" },
  { title: "Flagged", subtitle: "Reported projects", icon: "!", path: "/admin/flagged" },
  {
    title: "Create Admin",
    subtitle: "Add new administrator",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    action: "createAdmin",
  },
  {
    title: "Account Management",
    subtitle: "Activate/deactivate accounts",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <circle cx="12" cy="16" r="1" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    path: "/admin/account-management",
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataRevision, setDataRevision] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [internshipCatalogRev, setInternshipCatalogRev] = useState(0);

  useEffect(() => subscribeDummyUpdates(() => setDataRevision((n) => n + 1)), []);

  useEffect(() => {
    const bump = () => setInternshipCatalogRev((n) => n + 1);
    window.addEventListener("guc-internships-catalog-changed", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("guc-internships-catalog-changed", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  useEffect(() => {
    const dismissKey = "portfolio-admin-demo-toast-dismissed";
    if (sessionStorage.getItem(dismissKey)) return;
    window.dispatchEvent(
      new CustomEvent("portfolio-toast-notification", {
        detail: {
          title: "Instructor course request (demo)",
          body: "Dr. Aya Salama requested to link to CSEN401 — Software Engineering. Open Requests in the sidebar to review it.",
          dismissSessionKey: dismissKey,
        },
      })
    );
  }, []);

  useEffect(() => {
    if (searchParams.get("modal") !== "create") return;
    setNewAdminName("");
    setNewAdminPassword("");
    setErrors({});
    setIsConfirmOpen(false);
    setIsCreateOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const openCreateAdminModal = () => {
    setNewAdminName("");
    setNewAdminPassword("");
    setErrors({});
    setIsCreateOpen(true);
  };

  const closeCreateAdminModal = () => {
    setIsCreateOpen(false);
    setIsConfirmOpen(false);
    setErrors({});
  };

  const validateCreateAdminForm = () => {
    const nextErrors = {};
    if (!newAdminName.trim()) nextErrors.username = "This field cannot be left empty";
    if (!newAdminPassword.trim()) nextErrors.password = "This field cannot be left empty";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveChanges = (event) => {
    event.preventDefault();
    if (!validateCreateAdminForm()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmCreateAdmin = () => {
    const trimmedName = newAdminName.trim();
    const newAdmin = {
      id: dummyUsers.length + 1,
      name: trimmedName,
      email: `${trimmedName}@guc.edu.eg`,
      password: newAdminPassword,
      role: "admin",
      bio: "New administrator",
      avatar: null,
      status: "active",
    };

    dummyUsers.push(newAdmin);
    emitDummyUpdate();
    setIsConfirmOpen(false);
    setIsCreateOpen(false);
    setShowSuccess(true);
  };

  const telemetry = useMemo(() => {
    const students = dummyUsers.filter((u) => u.role === "student").length;
    const instructors = dummyUsers.filter((u) => u.role === "instructor").length;
    const employers = dummyUsers.filter((u) => u.role === "employer").length;
    const roleTotal = students + instructors + employers;
    const flagged = projects.filter((project) => project.flagged).length;
    return {
      roleTotal,
      projects: projects.length,
      courses: courses.length,
      pendingApprovals: employerApplications.filter((application) => application.verificationStatus === "pending").length,
      flagged,
    };
  }, [dataRevision]);

  const internshipStats = useMemo(() => {
    const catalog = getInternshipCatalogSnapshot();
    const activeRows = catalog.filter((row) => !row.archived);
    const byCompany = new Map();
    activeRows.forEach((row) => {
      const name = String(row.company || "Unknown").trim() || "Unknown";
      byCompany.set(name, (byCompany.get(name) || 0) + 1);
    });
    const perCompany = [...byCompany.entries()]
      .map(([company, activeCount]) => ({ company, activeCount }))
      .sort((a, b) => a.company.localeCompare(b.company));
    const archivedListed = catalog.filter((row) => row.archived).length;
    return {
      totalActive: activeRows.length,
      totalAll: catalog.length,
      archivedListed,
      distinctEmployers: byCompany.size,
      perCompany,
    };
  }, [dataRevision, internshipCatalogRev]);

  const pendingCount = telemetry.pendingApprovals;

  return (
    <div>
      <Card className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-bg-surface via-bg-surface to-bg-elevated/25 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl text-text-primary tracking-tight">Statistics</h1>
            <p className="mt-2 text-sm text-text-secondary font-sans max-w-xl leading-relaxed">
              Quick snapshot of key totals. Use View all for charts, role mix, and the full internship breakdown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => navigate("/admin/approvals")}
                className="inline-flex items-center gap-2 rounded-full border border-warning/70 bg-warning/5 px-3.5 py-2 text-sm font-sans text-warning transition-colors hover:bg-warning/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 13h.01M15 13h.01M10 17h4" />
                </svg>
                <span>
                  {pendingCount} employer verification pending
                </span>
              </button>
            )}
            <button
              type="button"
              className="rounded-full bg-[#f5f0e6] px-5 py-2 text-sm font-medium text-bg-base shadow-sm transition-colors hover:bg-[#ebe4d9] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50"
              onClick={() => navigate("/admin/statistics")}
            >
              View all
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl border border-accent-blue/45 bg-accent-blue/[0.06] p-4 sm:p-5">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Total users</p>
                <p className="mt-3 font-display text-4xl tabular-nums leading-none text-text-primary">{telemetry.roleTotal}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-text-secondary">(excl. admins)</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-accent-blue">
                <MiniSparkline />
                <IconUsersAccent />
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl border border-warning/50 bg-warning/[0.06] p-4 sm:p-5">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Projects overview</p>
                <p className="mt-3 font-display text-4xl tabular-nums leading-none text-text-primary">{telemetry.projects}</p>
                {telemetry.flagged > 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-sans text-danger">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden>
                      <path d="M5 3v18h2V10l4 2V8l4-2v12h2V3L12 6 5 3z" />
                    </svg>
                    {telemetry.flagged} Flagged
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-text-secondary">No flagged projects</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 text-warning">
                <MiniSparkline />
                <IconProjectsAccent />
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl border border-success/45 bg-success/[0.06] p-4 sm:p-5">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Courses available</p>
                <p className="mt-3 font-display text-4xl tabular-nums leading-none text-text-primary">{telemetry.courses}</p>
                <p className="mt-2 text-xs text-text-secondary">Total active</p>
              </div>
              <div className="mt-1 flex flex-col items-end justify-end text-success">
                <IconCoursesAccent />
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl border border-violet-400/45 bg-violet-500/[0.07] p-4 sm:p-5">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Active internships</p>
                <p className="mt-3 font-display text-4xl tabular-nums leading-none text-text-primary">{internshipStats.totalActive}</p>
                <p className="mt-2 text-xs text-text-secondary">
                  at {internshipStats.distinctEmployers} {internshipStats.distinctEmployers === 1 ? "company" : "companies"}
                </p>
              </div>
              <div className="mt-1 flex flex-col items-end justify-end text-violet-400">
                <IconInternshipsAccent />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-8 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary tracking-tight mb-2">
            Shortcuts
          </h2>
          <p className="text-text-secondary text-sm font-sans leading-relaxed">
            Jump directly to each admin data view.
          </p>
        </div>
        <div className="grid grid-cols-3">
          {shortcuts.map((shortcut, index) => {
            const shortcutCols = 3;
            const row = Math.floor(index / shortcutCols);
            const totalRows = Math.ceil(shortcuts.length / shortcutCols);
            const dividerBelowRow = row < totalRows - 1;
            return (
              <button
                key={shortcut.title}
                type="button"
                onClick={() => {
                  if (shortcut.action === "createAdmin") return openCreateAdminModal();
                  navigate(shortcut.path);
                }}
                className={`min-h-36 px-6 py-6 text-center transition-colors hover:bg-bg-elevated focus:outline-none focus:bg-bg-elevated ${
                  index % shortcutCols !== shortcutCols - 1 ? "border-r border-border" : ""
                } ${dividerBelowRow ? "border-b border-border" : ""}`}
              >
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border text-2xl text-text-secondary">
                  {shortcut.icon}
                </span>
                <span className="block font-display text-base text-text-primary mb-1">{shortcut.title}</span>
                <span className="block text-sm text-text-secondary font-sans">{shortcut.subtitle}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateAdminModal}
        title="Add Administrator"
        contentClassName={isConfirmOpen ? "pointer-events-none blur-[1.5px] opacity-80" : ""}
      >
        <form onSubmit={handleSaveChanges} className="space-y-5">
          <Input
            label="Username"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            error={errors.username}
          />
          <Input
            label="Password"
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            error={errors.password}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeCreateAdminModal}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmActionModal
        isOpen={isConfirmOpen}
        action="grant administrator access to this account"
        variant="gold"
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmCreateAdmin}
      />

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Admin added successfully">
        <p className="text-text-secondary text-sm mb-6">The new admin has been added and will appear in the users list.</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setShowSuccess(false)}>
            Close
          </Button>
          <Button type="button" onClick={() => {
            setShowSuccess(false);
            navigate("/admin/users");
          }}>
            View Users
          </Button>
        </div>
      </Modal>
    </div>
  );
}
