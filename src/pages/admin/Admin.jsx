<<<<<<< HEAD
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, PageHeader } from "../../components/ui";
import { courses, dummyUsers, employerApplications, projects } from "../../data/dummy";

const userRoleGroups = [
  { key: "student", label: "Students", badge: "blue" },
  { key: "instructor", label: "Course Instructors", badge: "gold" },
  { key: "employer", label: "Employers", badge: "success" },
  { key: "admin", label: "Admins", badge: "danger" },
];

const roleLabels = {
  student: "Student",
  instructor: "Course Instructor",
  employer: "Employer",
  admin: "Administrator",
};

const shortcuts = [
  { title: "Users", subtitle: "Names, emails, roles", icon: "▦", path: "/admin/users" },
  { title: "Courses", subtitle: "Course catalog", icon: "▤", path: "/admin/courses" },
  { title: "Projects", subtitle: "Submitted projects", icon: "◇", path: "/admin/projects" },
  { title: "Employers", subtitle: "Company accounts", icon: "▣", path: "/admin/employers" },
  { title: "Approvals", subtitle: "Pending employer docs", icon: "✓", path: "/admin/approvals" },
  { title: "Flagged", subtitle: "Reported projects", icon: "!", path: "/admin/flagged" },
=======
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, ConfirmActionModal, Input, Modal, PageHeader } from "../../components/ui";
import { MiniDonutChart, ColumnBarChart } from "../../components/viz/Charts.jsx";
import { CHART_COLORS } from "../../components/viz/chartColors.js";
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
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
];

export default function Admin() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const stats = useMemo(() => ([
    { label: "Total Users", value: String(dummyUsers.length) },
    { label: "Total Projects", value: String(projects.length) },
    { label: "Courses", value: String(courses.length) },
    { label: "Pending Approvals", value: String(employerApplications.filter((application) => application.verificationStatus === "pending").length) },
  ]), []);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and controls" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-text-secondary text-xs font-sans uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="font-mono text-3xl text-text-primary">{stat.value}</p>
          </Card>
        ))}
      </div>
=======
  const [dataRevision, setDataRevision] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => subscribeDummyUpdates(() => setDataRevision((n) => n + 1)), []);

  useEffect(() => {
    const dismissKey = "portfolio-admin-demo-toast-dismissed";
    if (sessionStorage.getItem(dismissKey)) return;
    window.dispatchEvent(
      new CustomEvent("portfolio-toast-notification", {
        detail: {
          title: "Instructor course request (demo)",
          body: "Dr. Aya Salama requested to link to CSEN401 — Software Engineering. Open Instructor Requests from the admin shortcuts to review it.",
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
    const administrators = dummyUsers.filter((u) => u.role === "admin").length;
    const flagged = projects.filter((project) => project.flagged).length;
    const roleTotal = students + instructors + employers;
    const monthCounts = {};
    projects.forEach((project) => {
      const monthKey = project.createdAt?.slice(0, 7) || "unknown";
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    const orderedMonths = Object.keys(monthCounts).sort((a, b) => (a === "unknown" ? 1 : b === "unknown" ? -1 : a.localeCompare(b)));
    const projectBuckets = orderedMonths.map((key, idx) => {
      const readable =
        key === "unknown"
          ? "N/A"
          : new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" }).format(new Date(`${key}-05T12:00:00`));
      return {
        key,
        label: readable,
        fullLabel: key,
        value: monthCounts[key],
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
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
      projectBuckets,
    };
  }, [dataRevision]);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview — monitor adoption, catalog health, and moderation load at a glance."
      />

      <Card className="mb-8 p-6 border-border">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-text-secondary mb-2">Usage overview</p>
            <p className="text-text-secondary text-sm font-sans max-w-2xl leading-relaxed">
              Headcount includes students, employers, and course instructors. Administrator accounts are tracked separately. Charts summarize user mix and how many projects entered the system each month.
            </p>
          </div>
          {telemetry.pendingApprovals > 0 && (
            <Badge variant="warning">{telemetry.pendingApprovals} employer verification pending</Badge>
          )}
        </div>
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-xl border border-border bg-bg-elevated/40 p-5 flex flex-col items-center">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-2 w-full text-left">Users by role</p>
            <p className="text-xs text-text-secondary font-sans mb-4 w-full text-left leading-snug">Share of operational roles (excludes administrators).</p>
            <MiniDonutChart
              size={168}
              thickness={24}
              segments={[
                { key: "students", label: "Students", value: telemetry.students, color: CHART_COLORS[0] },
                { key: "employers", label: "Employers", value: telemetry.employers, color: CHART_COLORS[1] },
                { key: "instructors", label: "Instructors", value: telemetry.instructors, color: CHART_COLORS[2] },
              ]}
            />
            <ul className="w-full mt-4 space-y-2 text-sm font-sans">
              {[
                ["Students", telemetry.students],
                ["Employers", telemetry.employers],
                ["Course instructors", telemetry.instructors],
              ].map(([label, value], i) => (
                <li key={label} className="flex justify-between gap-3 text-text-secondary">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="font-mono text-text-primary tabular-nums">{value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 rounded-xl border border-border bg-bg-elevated/40 p-5 flex flex-col">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-2">Projects onboarded</p>
            <p className="text-xs text-text-secondary font-sans mb-4 leading-snug">Monthly volume based on each project&apos;s created date in the catalog.</p>
            {telemetry.projectBuckets.length ? (
              <ColumnBarChart
                buckets={telemetry.projectBuckets}
                chartHeightPx={184}
                yAxisLabel="Projects added"
                xAxisLabel="Month (project created date)"
                summary="Bars count how many projects were created in the catalog in each month—useful for onboarding volume."
              />
            ) : (
              <p className="text-sm text-text-secondary font-sans flex-1 flex items-center justify-center border border-dashed border-border rounded-lg">
                No dated projects available for this chart.
              </p>
            )}
          </div>
          <div className="lg:col-span-3 rounded-xl border border-border bg-bg-base/40 p-5 space-y-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary">Platform totals</p>
            <div className="rounded-lg border border-border px-4 py-3 bg-bg-elevated/30 flex gap-3">
              <span className="text-accent-blue text-lg leading-none" aria-hidden>
                ◎
              </span>
              <div>
                <p className="text-[11px] text-text-secondary font-sans uppercase tracking-wide">Users (excl. admins)</p>
                <p className="font-display text-3xl text-text-primary tabular-nums">{telemetry.roleTotal}</p>
                <p className="text-[11px] text-text-secondary font-sans mt-1 leading-snug">Students + employers + instructors.</p>
              </div>
            </div>
            <div className="rounded-lg border border-border px-4 py-3 bg-bg-elevated/30 flex gap-3">
              <span className="text-accent-gold text-lg leading-none" aria-hidden>
                ◈
              </span>
              <div>
                <p className="text-[11px] text-text-secondary font-sans uppercase tracking-wide">Projects</p>
                <p className="font-display text-3xl text-text-primary tabular-nums">{telemetry.projects}</p>
                <p className="text-[11px] text-text-secondary font-sans mt-1 leading-snug">
                  {telemetry.flagged} flagged for review right now.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border px-4 py-3 bg-bg-elevated/30 flex gap-3">
              <span className="text-success text-lg leading-none" aria-hidden>
                ▤
              </span>
              <div>
                <p className="text-[11px] text-text-secondary font-sans uppercase tracking-wide">Courses</p>
                <p className="font-display text-3xl text-text-primary tabular-nums">{telemetry.courses}</p>
                <p className="text-[11px] text-text-secondary font-sans mt-1 leading-snug">Published catalog entries.</p>
              </div>
            </div>
            <div className="rounded-lg border border-accent-blue/20 px-4 py-3 bg-bg-elevated/20 text-[11px] font-sans text-text-secondary leading-snug">
              Directory includes <span className="font-mono text-text-primary">{telemetry.administrators}</span> admin account
              {telemetry.administrators === 1 ? "" : "s"} ({telemetry.totalAccounts} accounts overall).
            </div>
          </div>
        </div>
      </Card>
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687

      <Card className="mb-8 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg text-text-primary">Shortcuts</h2>
          <p className="text-text-secondary text-sm font-sans">Jump directly to each admin data view.</p>
        </div>
        <div className="grid grid-cols-3">
          {shortcuts.map((shortcut, index) => (
            <button
<<<<<<< HEAD
              key={shortcut.path}
              type="button"
              onClick={() => navigate(shortcut.path)}
=======
              key={shortcut.title}
              type="button"
              onClick={() => {
                if (shortcut.action === "createAdmin") return openCreateAdminModal();
                navigate(shortcut.path);
              }}
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
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

<<<<<<< HEAD
=======
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
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
    </div>
  );
}
