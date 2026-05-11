import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconCoursesAccent,
  IconProjectsAccent,
  IconUsersAccent,
  MiniSparkline,
} from "../../components/admin/AdminMetricVisuals";
import { Badge, Button, Card, PageHeader } from "../../components/ui";
import { MiniDonutChart, ColumnBarChart } from "../../components/viz/Charts.jsx";
import { CHART_COLORS } from "../../components/viz/chartColors.js";
import {
  courses,
  dummyUsers,
  employerApplications,
  getInternshipCatalogSnapshot,
  projects,
  subscribeDummyUpdates,
} from "../../data/dummy";

function BarChartTitleIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-8 w-8 shrink-0 text-accent-gold ${className}`}
      fill="currentColor"
      aria-hidden
    >
      <rect x="4" y="13" width="4.5" height="8" rx="1" opacity="0.9" />
      <rect x="9.75" y="9" width="4.5" height="12" rx="1" />
      <rect x="15.5" y="5" width="4.5" height="16" rx="1" opacity="0.95" />
    </svg>
  );
}

/**
 * Dedicated analytics view: same figures as the admin dashboard usage card,
 * without modifying `Admin.jsx`.
 */
export default function AdminStatistics() {
  const navigate = useNavigate();
  const [dataRevision, setDataRevision] = useState(0);
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

  const userRoleDonutSegments = useMemo(
    () => [
      { key: "students", label: "Students", value: telemetry.students, color: CHART_COLORS[0] },
      { key: "employers", label: "Employers", value: telemetry.employers, color: CHART_COLORS[1] },
      { key: "instructors", label: "Course instructors", value: telemetry.instructors, color: CHART_COLORS[2] },
    ],
    [telemetry.students, telemetry.employers, telemetry.instructors]
  );
  const userRoleRowCount = userRoleDonutSegments.length;

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-3 text-text-primary">
            <BarChartTitleIcon />
            Statistics
          </span>
        }
        subtitle="Usage overview and internship catalog metrics — same sources as the dashboard, focused on charts and totals."
        action={
          <Button type="button" variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
        }
      />

      <Card className="mb-8 p-6 border-border">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[15px] font-mono uppercase tracking-[0.28em] text-text-secondary mb-2">Usage overview</p>
            <p className="text-text-secondary text-sm font-sans max-w-2xl leading-relaxed">
              Headcount includes students, employers, and course instructors. Administrator accounts are tracked separately. Charts summarize user mix and how many projects entered the system each month.
            </p>
          </div>
          {telemetry.pendingApprovals > 0 && (
            <Badge variant="warning">{telemetry.pendingApprovals} employer verification pending</Badge>
          )}
        </div>
        <div className="space-y-5">
          {/* Row 1: equal-width donut + bar charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            <div className="rounded-xl border border-border bg-bg-elevated/40 p-5 sm:p-6 min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-text-primary/90 mb-2 w-full text-left">
                Users by role
              </p>
              <p className="text-xs text-text-secondary font-sans mb-6 w-full text-left leading-snug max-w-xl">
                Share of operational roles (excludes administrators).
              </p>

              <div className="md:hidden flex flex-col items-center gap-6">
                <MiniDonutChart size={188} thickness={26} segments={userRoleDonutSegments} />
                <ul className="w-full max-w-sm space-y-3.5">
                  {userRoleDonutSegments.map((seg) => (
                    <li key={seg.key} className="flex items-center justify-between gap-4 text-sm font-sans">
                      <span className="flex items-center gap-2.5 min-w-0 text-text-secondary">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
                          style={{ backgroundColor: seg.color }}
                          aria-hidden
                        />
                        <span className="whitespace-normal break-words leading-snug">{seg.label}</span>
                      </span>
                      <span className="font-mono text-text-primary tabular-nums shrink-0">{seg.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="hidden md:grid items-center gap-x-6 lg:gap-x-8 gap-y-5"
                style={{
                  gridTemplateColumns: "auto minmax(0, 1fr) auto",
                  gridTemplateRows: `repeat(${userRoleRowCount}, minmax(2.5rem, auto))`,
                }}
              >
                {userRoleDonutSegments.map((seg, i) => (
                  <div
                    key={`leg-${seg.key}`}
                    className="flex items-center gap-2.5 pr-1"
                    style={{ gridColumn: 1, gridRow: i + 1 }}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
                      style={{ backgroundColor: seg.color }}
                      aria-hidden
                    />
                    <span className="text-sm text-text-secondary font-sans whitespace-normal break-words leading-snug">
                      {seg.label}
                    </span>
                  </div>
                ))}
                <div
                  className="flex items-center justify-center py-1"
                  style={{ gridColumn: 2, gridRow: `1 / span ${userRoleRowCount}` }}
                >
                  <MiniDonutChart size={200} thickness={28} segments={userRoleDonutSegments} />
                </div>
                {userRoleDonutSegments.map((seg, i) => (
                  <div
                    key={`val-${seg.key}`}
                    className="text-right font-mono text-sm sm:text-[0.95rem] text-text-primary tabular-nums leading-none"
                    style={{ gridColumn: 3, gridRow: i + 1 }}
                  >
                    {seg.value}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated/40 p-5 flex flex-col min-w-0 w-full">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-2">Projects onboarded</p>
              <p className="text-xs text-text-secondary font-sans mb-4 leading-snug">
                Monthly volume based on each project&apos;s created date in the catalog.
              </p>
              {telemetry.projectBuckets.length ? (
                <div className="w-full min-w-0">
                  <ColumnBarChart
                    buckets={telemetry.projectBuckets}
                    chartHeightPx={184}
                    yAxisLabel="Projects added"
                    xAxisLabel="Month (project created date)"
                    summary="Bars count how many projects were created in the catalog in each month—useful for onboarding volume."
                  />
                </div>
              ) : (
                <p className="text-sm text-text-secondary font-sans flex-1 flex items-center justify-center border border-dashed border-border rounded-lg min-h-[12rem]">
                  No dated projects available for this chart.
                </p>
              )}
            </div>
          </div>

          {/* Row 2: platform totals — full width, horizontal */}
          <div className="rounded-xl border border-border bg-bg-base/40 p-5">
            <p className="text-[15px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-4">Platform totals</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl border border-accent-blue/45 bg-accent-blue/[0.06] p-4 sm:p-5">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Users (excl. admins)</p>
                    <p className="mt-3 font-display text-3xl tabular-nums leading-none text-text-primary sm:text-4xl">{telemetry.roleTotal}</p>
                    <p className="mt-2 text-[11px] font-sans leading-snug text-text-secondary">Students + employers + instructors.</p>
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
                    <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Projects</p>
                    <p className="mt-3 font-display text-3xl tabular-nums leading-none text-text-primary sm:text-4xl">{telemetry.projects}</p>
                    {telemetry.flagged > 0 ? (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-sans text-danger">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden>
                          <path d="M5 3v18h2V10l4 2V8l4-2v12h2V3L12 6 5 3z" />
                        </svg>
                        {telemetry.flagged} flagged for review right now.
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] text-text-secondary font-sans">No flagged projects</p>
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
                    <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Courses</p>
                    <p className="mt-3 font-display text-3xl tabular-nums leading-none text-text-primary sm:text-4xl">{telemetry.courses}</p>
                    <p className="mt-2 text-[11px] text-text-secondary font-sans leading-snug">Published catalog entries.</p>
                  </div>
                  <div className="mt-1 flex flex-col items-end justify-end text-success">
                    <IconCoursesAccent />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-accent-blue/20 px-4 py-3 bg-bg-elevated/20 text-[11px] font-sans text-text-secondary leading-snug">
              Directory includes <span className="font-mono text-text-primary">{telemetry.administrators}</span> admin account
              {telemetry.administrators === 1 ? "" : "s"} ({telemetry.totalAccounts} accounts overall).
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div className="min-w-0">
              <p className="text-[15px] font-mono uppercase tracking-[0.28em] text-text-secondary mb-2">Internship listings (employers)</p>
              <p className="text-xs text-text-secondary font-sans max-w-2xl leading-relaxed">
                Active listings exclude archived postings. Counts follow the same catalog employers manage on Internships (including saved browser data).
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="rounded-lg border border-border px-4 py-3 bg-bg-elevated/30 min-w-[10.5rem]">
                <p className="text-[11px] text-text-secondary font-sans uppercase tracking-wide">Active (platform)</p>
                <p className="font-display text-2xl text-text-primary tabular-nums">{internshipStats.totalActive}</p>
              </div>
              <div className="rounded-lg border border-border px-4 py-3 bg-bg-elevated/30 min-w-[10.5rem]">
                <p className="text-[11px] text-text-secondary font-sans uppercase tracking-wide">Companies listed</p>
                <p className="font-display text-2xl text-text-primary tabular-nums">{internshipStats.distinctEmployers}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-base">
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-left">
                      Company
                    </th>
                    <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal text-center w-[12rem]">
                      Active internships
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {internshipStats.perCompany.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-sm text-text-secondary font-sans text-center border-b border-border">
                        No internship postings in the catalog yet.
                      </td>
                    </tr>
                  ) : (
                    internshipStats.perCompany.map((row) => (
                      <tr key={row.company} className="border-b border-border last:border-0 hover:bg-bg-elevated/15 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary font-sans">{row.company}</td>
                        <td className="px-4 py-3 text-center font-mono text-sm text-text-primary tabular-nums">{row.activeCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border bg-bg-elevated/20 text-[11px] font-sans text-text-secondary">
              <span className="font-mono text-text-primary">{internshipStats.totalAll}</span> total rows in catalog (including{" "}
              <span className="font-mono text-text-primary">{internshipStats.archivedListed}</span> archived).
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
