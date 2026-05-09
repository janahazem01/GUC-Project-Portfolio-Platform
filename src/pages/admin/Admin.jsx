import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Input, Modal, PageHeader } from "../../components/ui";
import {
  courses,
  dummyUsers,
  employerApplications,
  emitDummyUpdate,
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

  useEffect(() => subscribeDummyUpdates(() => setDataRevision((n) => n + 1)), []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("portfolio-toast-notification", {
        detail: {
          title: "Instructor course request (demo)",
          body: "Dr. Aya Salama requested to link to CSEN401 — Software Engineering. This toast appears every time you open the admin dashboard so you can test the bottom-right popup.",
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
    const administrators = dummyUsers.filter((u) => u.role === "admin").length;
    const flagged = projects.filter((project) => project.flagged).length;
    const roleTotal = students + instructors + employers;
    return {
      students,
      instructors,
      employers,
      administrators,
      roleTotal,
      totalAccounts: dummyUsers.length,
      projects: projects.length,
      courses: courses.length,
      pendingApprovals: employerApplications.filter((application) => application.verificationStatus === "pending").length,
      flagged,
    };
  }, [dataRevision]);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and controls" />

      <Card className="mb-8 p-6 border-border">
        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-text-secondary mb-4">Usage overview</p>
        <p className="text-text-secondary text-sm font-sans mb-6 max-w-2xl">
          Headcount covers students, employers, and course instructors only. Project and course totals reflect what is stored in this demo catalog.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-bg-elevated/40 px-5 py-4">
            <p className="text-xs font-sans text-text-secondary mb-1">People on the platform</p>
            <p className="font-display text-3xl text-text-primary tabular-nums">{telemetry.roleTotal}</p>
            <dl className="mt-3 space-y-2 text-sm font-sans text-text-secondary">
              <div className="flex justify-between gap-4">
                <dt>Students</dt>
                <dd className="font-mono text-text-primary">{telemetry.students}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Employers</dt>
                <dd className="font-mono text-text-primary">{telemetry.employers}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Course instructors</dt>
                <dd className="font-mono text-text-primary">{telemetry.instructors}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border border-border bg-bg-elevated/40 px-5 py-4">
            <p className="text-xs font-sans text-text-secondary mb-1">Projects</p>
            <p className="font-display text-3xl text-text-primary tabular-nums">{telemetry.projects}</p>
            <p className="mt-3 text-sm text-text-secondary font-sans leading-relaxed">
              Submissions tracked in the portfolio system ({telemetry.flagged} currently flagged for review).
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-elevated/40 px-5 py-4 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-sans text-text-secondary mb-1">Courses</p>
            <p className="font-display text-3xl text-text-primary tabular-nums">{telemetry.courses}</p>
            <p className="mt-3 text-sm text-text-secondary font-sans leading-relaxed">
              Active catalog entries. Manage names and codes from the Courses shortcut.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-sans text-text-secondary">
          <span>
            All accounts in directory (including admins):{" "}
            <span className="font-mono text-text-primary">{telemetry.totalAccounts}</span>
          </span>
          {telemetry.pendingApprovals > 0 && (
            <Badge variant="warning">{telemetry.pendingApprovals} employer verification pending</Badge>
          )}
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
        contentClassName={isConfirmOpen ? "filter blur-sm" : ""}
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

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm action" backdropClassName="backdrop-blur-sm">
        <p className="text-text-secondary text-sm mb-6">Are you sure you want to add this as an admin?</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirmCreateAdmin}>
            Yes
          </Button>
        </div>
      </Modal>

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
