<<<<<<< HEAD
import { useContext } from "react";
import { Card, Badge, Stars, Button, PageHeader } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { projects, getVisibleNotifications } from "../data/dummy";
=======
import { useContext, useMemo } from "react";
import { Card, Badge, Stars, Button, PageHeader } from "../components/ui";
import { ColumnBarChart } from "../components/viz/Charts.jsx";
import { CHART_COLORS } from "../components/viz/chartColors.js";
import { AuthContext } from "../context/AuthContext";
import { internships, dummyUsers, projects, getVisibleNotifications } from "../data/dummy";
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-text-secondary text-xs font-sans uppercase tracking-widest mb-2">{label}</p>
      <p className="font-mono text-3xl text-text-primary">{value}</p>
    </Card>
  );
}

function getDisplayName(name) {
  if (!name) return "there";

  const parts = name.split(" ").filter(Boolean);
  if (parts[0] === "Dr." && parts[1]) {
    return parts[1].replace(/\.$/, "");
  }

  return parts[0].replace(/\.$/, "");
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const myProjects = projects.filter((p) => p.owner === user?.name);
  const visibleNotifications = getVisibleNotifications(user);
  const roleLabel = {
    student: user?.major,
    instructor: "Instructor",
    employer: "Employer",
    admin: "Administrator",
  };

<<<<<<< HEAD
=======
  const employerCompany = user?.companyName?.trim();

  const employerTalentInsights = useMemo(() => {
    if (!employerCompany) return null;
    const internsWithCompany = new Set();
    dummyUsers.forEach((account) => {
      if (!account.completedInternships) return;
      const hit = account.completedInternships.some((placement) => placement.company === employerCompany);
      if (hit) internsWithCompany.add(account.id ?? account.studentEmail ?? account.email);
    });
    const uniqueCompleted = internsWithCompany.size;

    const monthCounts = {};
    internships
      .filter((opening) => opening.company === employerCompany)
      .forEach((opening) => {
        const monthKey = opening.postedAt?.slice(0, 7) || "unknown";
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      });
    const orderedMonths = Object.keys(monthCounts).sort((a, b) => (a === "unknown" ? 1 : b === "unknown" ? -1 : a.localeCompare(b)));
    const barBuckets = orderedMonths.map((key, idx) => {
      const readable =
        key === "unknown"
          ? "N/A"
          : new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" }).format(new Date(`${key}-05T12:00:00`));
      return {
        key,
        label: readable,
        fullLabel: key === "unknown" ? "Unknown posting date" : key,
        value: monthCounts[key],
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });

    const companyOpenings = internships.filter((opening) => opening.company === employerCompany && !opening.archived);
    const offeredTotal = companyOpenings.length;
    const totalListingsPublished = internships.filter((opening) => opening.company === employerCompany).length;
    const applicationVolume = companyOpenings.reduce((sum, opening) => sum + (opening.applications?.length || 0), 0);

    return { uniqueCompleted, barBuckets, offeredTotal, totalListingsPublished, applicationVolume };
  }, [employerCompany]);

>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
  return (
    <div>
      <PageHeader
        title={`Hello, ${getDisplayName(user?.name)}.`}
        subtitle={roleLabel[user?.role] || "Administrator"}
      />

<<<<<<< HEAD
=======
      {user?.role === "employer" && employerTalentInsights && (
        <div className="mb-8 space-y-4">
          <div>
            <h2 className="font-display text-lg text-text-primary flex items-center gap-2 mb-1">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent-gold/50 text-accent-gold text-sm shrink-0" aria-hidden>
                ◐
              </span>
              Internship &amp; talent insights
            </h2>
            <p className="text-text-secondary text-sm font-sans max-w-3xl">
              Benchmarks for <span className="text-text-primary font-medium">{employerCompany}</span> using completed student placements and your published openings in the demo catalog.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-text-secondary mb-3">Talent outcomes</p>
              <div className="flex gap-3 items-start mb-4">
                <span className="text-xl text-success shrink-0" aria-hidden>
                  ✓
                </span>
                <div>
                  <p className="text-xs text-text-secondary font-sans">Students who completed with you</p>
                  <p className="font-display text-4xl text-text-primary tabular-nums leading-none mt-1">
                    {employerTalentInsights.uniqueCompleted}
                  </p>
                  <p className="text-[11px] text-text-secondary font-sans mt-2 leading-relaxed">
                    Distinct student accounts that list a finished internship at {employerCompany}.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start border-t border-border pt-4 mb-4">
                <span className="text-xl text-accent-blue shrink-0" aria-hidden>
                  ◐
                </span>
                <div>
                  <p className="text-xs text-text-secondary font-sans">Total internships offered</p>
                  <p className="font-display text-2xl text-text-primary tabular-nums leading-none mt-1">
                    {employerTalentInsights.totalListingsPublished}
                  </p>
                  <p className="text-[11px] text-text-secondary font-sans mt-2 leading-relaxed">
                    All internship records for your company in the demo catalog (includes archived listings). Currently active:{" "}
                    <span className="font-mono text-text-primary">{employerTalentInsights.offeredTotal}</span>.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start border-t border-border pt-4">
                <span className="text-xl text-accent-gold shrink-0" aria-hidden>
                  ◆
                </span>
                <div>
                  <p className="text-xs text-text-secondary font-sans">Applications received (demo data)</p>
                  <p className="font-display text-2xl text-text-primary tabular-nums leading-none mt-1">
                    {employerTalentInsights.applicationVolume}
                  </p>
                  <p className="text-[11px] text-text-secondary font-sans mt-2 leading-relaxed">Summed across all active postings for your company.</p>
                </div>
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-text-secondary mb-2">Internships offered over time</p>
              <p className="text-xs text-text-secondary font-sans mb-4">
                How many internship listings your company <span className="text-text-primary font-medium">published</span> in each month (by posted date). The
                number on each bar is the count of new listings that month—not applications.
              </p>
              {employerTalentInsights.barBuckets.length ? (
                <ColumnBarChart
                  buckets={employerTalentInsights.barBuckets}
                  chartHeightPx={184}
                  yAxisLabel="New listings"
                  xAxisLabel="Month (first published in that month)"
                  summary="Read the chart from left to right: each bar is one month, its height is how many roles you published that month."
                />
              ) : (
                <p className="text-sm text-text-secondary font-sans py-8 text-center border border-dashed border-border rounded-lg">
                  No internship postings found for this company in the catalog yet.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}

>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Projects" value={myProjects.length} />
        <StatCard label="Public Projects" value={myProjects.filter((p) => p.visibility === "public").length} />
        <StatCard label="Unread Notifications" value={visibleNotifications.filter((n) => !n.read).length} />
      </div>

      {/* Recent projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-text-primary">My Projects</h2>
          <Button variant="ghost" size="sm">View all →</Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {myProjects.map((p) => (
            <Card key={p.id} hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-base text-text-primary">{p.title}</h3>
                <Badge variant={p.visibility === "public" ? "success" : "default"}>
                  {p.visibility}
                </Badge>
              </div>
              <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {p.languages.map((l) => (
                  <Badge key={l}>{l}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Stars rating={p.rating} />
                <Badge variant="blue">{p.courseCode}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h2 className="font-display text-lg text-text-primary mb-4">Recent Notifications</h2>
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {visibleNotifications.length > 0 ? visibleNotifications.map((n) => (
              <div key={n.id} className={`py-3 flex items-start gap-3 ${!n.read ? "opacity-100" : "opacity-50"}`}>
                {!n.read && <span className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 shrink-0" />}
                {n.read && <span className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-sans text-text-primary">{n.text}</p>
                  <p className="text-xs font-mono text-text-secondary mt-0.5">{n.time}</p>
                </div>
              </div>
            )) : (
              <p className="py-4 text-sm text-text-secondary font-sans">No notifications for your role yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
