import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, ConfirmActionModal, Input, Modal, PageHeader } from "../../components/ui";
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

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview — monitor adoption, catalog health, and moderation load at a glance."
      />

      <Card className="mb-8 p-5 sm:p-6 border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-text-secondary mb-2">Statistics</p>
            <p className="text-text-secondary text-xs sm:text-sm font-sans max-w-xl leading-snug">
              Quick snapshot of key totals. Use View all for charts, role mix, and the full internship breakdown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {telemetry.pendingApprovals > 0 && (
              <Badge variant="warning">{telemetry.pendingApprovals} employer verification pending</Badge>
            )}
            <Button type="button" variant="gold" size="sm" onClick={() => navigate("/admin/statistics")}>
              View all
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-bg-elevated/35 px-3 py-3 sm:px-4">
            <p className="text-[10px] sm:text-[11px] text-text-secondary font-sans uppercase tracking-wide mb-1">Users (excl. admins)</p>
            <p className="font-display text-2xl text-text-primary tabular-nums leading-none">{telemetry.roleTotal}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated/35 px-3 py-3 sm:px-4">
            <p className="text-[10px] sm:text-[11px] text-text-secondary font-sans uppercase tracking-wide mb-1">Projects</p>
            <p className="font-display text-2xl text-text-primary tabular-nums leading-none">{telemetry.projects}</p>
            <p className="text-[10px] text-text-secondary font-sans mt-1 tabular-nums">{telemetry.flagged} flagged</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated/35 px-3 py-3 sm:px-4">
            <p className="text-[10px] sm:text-[11px] text-text-secondary font-sans uppercase tracking-wide mb-1">Courses</p>
            <p className="font-display text-2xl text-text-primary tabular-nums leading-none">{telemetry.courses}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated/35 px-3 py-3 sm:px-4">
            <p className="text-[10px] sm:text-[11px] text-text-secondary font-sans uppercase tracking-wide mb-1">Active internships</p>
            <p className="font-display text-2xl text-text-primary tabular-nums leading-none">{internshipStats.totalActive}</p>
            <p className="text-[10px] text-text-secondary font-sans mt-1">{internshipStats.distinctEmployers} companies</p>
          </div>
        </div>
      </Card>

      <Card className="mb-8 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg text-text-primary">Shortcuts</h2>
          <p className="text-text-secondary text-sm font-sans">Jump directly to each admin data view.</p>
        </div>
        <div className="grid grid-cols-3">
          {shortcuts.map((shortcut, index) => (
            <button
              key={shortcut.title}
              type="button"
              onClick={() => {
                if (shortcut.action === "createAdmin") return openCreateAdminModal();
                navigate(shortcut.path);
              }}
              className={`min-h-36 px-6 py-6 text-center transition-colors hover:bg-bg-elevated focus:outline-none focus:bg-bg-elevated ${
                index % 3 !== 2 ? "border-r border-border" : ""
              } ${index < 3 ? "border-b border-border" : ""}`}
            >
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border text-2xl text-text-secondary">
                {shortcut.icon}
              </span>
              <span className="block font-display text-base text-text-primary mb-1">{shortcut.title}</span>
              <span className="block text-sm text-text-secondary font-sans">{shortcut.subtitle}</span>
            </button>
          ))}
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
