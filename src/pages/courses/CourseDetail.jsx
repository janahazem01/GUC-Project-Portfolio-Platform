import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader } from "../../components/ui";
import { courses, dummyUsers, projects, subscribeDummyUpdates } from "../../data/dummy";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDummyUpdates(() => setRevision((r) => r + 1)), []);

  const course = useMemo(
    () => courses.find((c) => String(c.id) === String(courseId)),
    [courseId, revision]
  );

  const instructors = useMemo(() => {
    if (!course) return [];
    return dummyUsers.filter(
      (u) => u.role === "instructor" && Array.isArray(u.coursesTaught) && u.coursesTaught.includes(course.id)
    );
  }, [course, revision]);

  const projectsInCourse = useMemo(() => {
    if (!course) return [];
    return projects.filter((p) => p.courseCode === course.code);
  }, [course, revision]);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4">
        <PageHeader title="Course not found" subtitle="This catalog id is missing or was removed." />
        <Button variant="secondary" onClick={() => navigate("/courses")}>
          Back
        </Button>
      </div>
    );
  }

  const creditHours = course.creditHours ?? "—";
  const brief = course.brief || "No description has been added for this catalog entry yet.";
  const materials = Array.isArray(course.materials) ? course.materials : [];
  const enrolled = course.enrolledCount ?? "—";

  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHeader
        title={course.name}
        subtitle={`Course code ${course.code} · ${creditHours} credit hours`}
        action={
          <Button variant="secondary" onClick={() => navigate("/courses")}>
            Back
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <Card className="p-5 border-border">
          <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-2">Overview</p>
          <p className="text-sm font-sans text-text-primary leading-relaxed whitespace-normal break-words">{brief}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="blue">{course.code}</Badge>
            <Badge variant="default">{creditHours} cr.</Badge>
          </div>
        </Card>

        <Card className="p-5 border-border">
          <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-3">Instructors</p>
          {instructors.length === 0 ? (
            <p className="text-sm text-text-secondary font-sans">No instructors are linked in demo data for this course.</p>
          ) : (
            <ul className="space-y-2">
              {instructors.map((inst) => (
                <li key={inst.id} className="text-sm font-sans text-text-primary">
                  <span className="font-medium">{inst.name}</span>
                  <span className="text-text-secondary"> · {inst.email}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 border-border">
          <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-3">Enrollment & projects</p>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm font-sans">
            <div>
              <dt className="text-text-secondary">Students enrolled (demo)</dt>
              <dd className="font-mono text-text-primary text-lg mt-0.5">{enrolled}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Projects using this course</dt>
              <dd className="font-mono text-text-primary text-lg mt-0.5">{projectsInCourse.length}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5 border-border">
          <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-3">Languages & materials</p>
          {materials.length === 0 ? (
            <p className="text-sm text-text-secondary font-sans">No materials listed yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1.5 text-sm font-sans text-text-primary leading-relaxed">
              {materials.map((item) => (
                <li key={item} className="break-words">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
