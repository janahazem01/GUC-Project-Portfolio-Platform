import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, PageHeader, Input } from "../../components/ui";
import { instructorDirectory, courses } from "../../data/dummy";
import { AuthContext } from "../../context/AuthContext";

export default function Instructors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const filteredInstructors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return instructorDirectory.filter((inst) => {
      const matchesName = inst.name.toLowerCase().includes(q);
      const matchesCourse = filterCourse
        ? inst.coursesTaught.includes(parseInt(filterCourse))
        : true;
      return matchesName && matchesCourse;
    });
  }, [searchQuery, filterCourse]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor Directory"
        description="Search for faculty members by name or courses they teach."
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search instructors by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="relative">
            <select
              className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 pr-10 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-gold appearance-none cursor-pointer"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="" className="bg-bg-surface">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-bg-surface">
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-muted">
              <span className="text-xs">▼</span>
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
                  <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Teaching</h4>
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
