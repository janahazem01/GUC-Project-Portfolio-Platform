import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Button, PageHeader, Input } from "../../components/ui";
import { instructorDirectory, courses } from "../../data/dummy";
import { AuthContext } from "../../context/AuthContext";

function taughtCourseText(inst) {
  return (inst.coursesTaught || [])
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => `${c.code} ${c.name}`.toLowerCase())
    .join(" ");
}

function instructorMatchesQuery(inst, q) {
  if (!q) return true;
  const name = (inst.name || "").toLowerCase();
  const email = (inst.email || "").toLowerCase();
  if (name.includes(q) || email.includes(q)) return true;
  return taughtCourseText(inst).includes(q);
}

export default function Instructors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const filteredInstructors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const courseId = filterCourse ? parseInt(filterCourse, 10) : null;
    return instructorDirectory.filter((inst) => {
      const teachesFilteredCourse =
        courseId == null || Number.isNaN(courseId)
          ? true
          : (inst.coursesTaught || []).includes(courseId);
      if (!teachesFilteredCourse) return false;
      return instructorMatchesQuery(inst, q);
    });
  }, [searchQuery, filterCourse]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor Directory"
        subtitle="Search by instructor name or course title and code. Use the course filter to narrow the directory."
        action={
          currentUser?.role === "admin" ? (
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back
            </Button>
          ) : null
        }
      />

      {/* Search + course filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6 lg:gap-10">
          <div className="min-w-0 w-full flex-1 md:flex-[1_1_65%] lg:flex-[1_1_72%]">
            <Input
              placeholder="Search by instructor name, email, or course name or code…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full shrink-0 md:w-auto md:min-w-[12.5rem] md:pl-4 lg:pl-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-1.5">Filter by course</p>
            <div className="relative">
              <select
                aria-label="Filter directory by course"
                className="w-full min-w-[12rem] md:max-w-[20rem] bg-bg-surface border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-gold appearance-none cursor-pointer"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="" className="bg-bg-surface">
                  All courses
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id} className="bg-bg-surface">
                    {course.code} — {course.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                <span className="text-xs" aria-hidden>
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructors.length > 0 ? (
          filteredInstructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="p-6 flex flex-col h-full cursor-pointer hover:border-accent-gold/50 transition-colors group"
              onClick={() => {
                // If it's the current user, go to /profile.
                // Otherwise, go to a public view (portfolio detail).
                if (currentUser && currentUser.email === instructor.email) {
                  navigate("/profile");
                } else {
                  navigate(`/explore/portfolio/instructor-${instructor.id}`);
                }
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center font-display text-accent-gold text-lg group-hover:scale-110 transition-transform">
                  {instructor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-display text-lg text-text-primary group-hover:text-accent-gold transition-colors">{instructor.name}</h3>
                  <p className="text-text-secondary text-sm">{instructor.email}</p>
                </div>
              </div>
              <p className="flex-grow break-words text-sm italic leading-relaxed text-text-secondary mb-4">
                {instructor.bio}
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Research Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {instructor.researchInterests.map((interest) => (
                      <Badge key={interest} variant="gold">{interest}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Linked Courses</h4>
                  <div className="flex flex-wrap gap-1">
                    {instructor.coursesTaught.map((courseId) => {
                      const course = courses.find((c) => c.id === courseId);
                      return course ? (
                        <Badge key={course.id} variant="blue">{course.code}</Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-text-secondary">
            No instructors found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
