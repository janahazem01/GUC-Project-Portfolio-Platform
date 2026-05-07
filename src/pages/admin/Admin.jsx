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
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20" />
        <path d="M20 7v10" />
        <path d="M4 7v10" />
      </svg>
    ),
    path: "/admin/courses",
  },
  {
    title: "Projects",
    subtitle: "Submitted projects",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
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
  { title: "Flagged", subtitle: "Reported projects", icon: "!", path: "/admin/flagged" },
];

export default function Admin() {
  const navigate = useNavigate();
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

      <Card className="mb-8 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg text-text-primary">Shortcuts</h2>
          <p className="text-text-secondary text-sm font-sans">Jump directly to each admin data view.</p>
        </div>
        <div className="grid grid-cols-3">
          {shortcuts.map((shortcut, index) => (
            <button
              key={shortcut.path}
              type="button"
              onClick={() => navigate(shortcut.path)}
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

    </div>
  );
}
