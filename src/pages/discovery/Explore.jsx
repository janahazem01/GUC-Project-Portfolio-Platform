import { useState } from "react";
import { Card, Badge, Stars, Button, Input, PageHeader } from "../../components/ui";
import { projects, courses } from "../../data/dummy";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse ? p.courseCode === filterCourse : true;
    return matchSearch && matchCourse;
  });

  return (
    <div>
      <PageHeader title="Explore Projects" subtitle="Discover what GUC students have built" />

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search by project title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} hover>
            <div className="flex items-start justify-between mb-2">
              <Badge variant="blue">{p.courseCode}</Badge>
              <Stars rating={p.rating} />
            </div>
            <h3 className="font-display text-base text-text-primary mb-2">{p.title}</h3>
            <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{p.description}</p>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {p.languages.map((l) => <Badge key={l}>{l}</Badge>)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-text-secondary">{p.owner}</span>
              <Button variant="ghost" size="sm">View →</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-text-secondary font-sans">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}
