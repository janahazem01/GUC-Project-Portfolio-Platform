import { Card, Badge, Button, PageHeader } from "../../components/ui";
import { projects, courses } from "../../data/dummy";

const stats = [
  { label: "Total Users",    value: "142" },
  { label: "Total Projects", value: "87"  },
  { label: "Courses",        value: "12"  },
  { label: "Pending Approvals", value: "3" },
];

export default function Admin() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and controls" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-text-secondary text-xs font-sans uppercase tracking-widest mb-2">{s.label}</p>
            <p className="font-mono text-3xl text-text-primary">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Courses */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-text-primary">Courses</h2>
            <Button variant="secondary" size="sm">+ Add Course</Button>
          </div>
          <div className="flex flex-col gap-2">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-sans text-text-primary">{c.name}</p>
                  <p className="text-xs font-mono text-text-secondary">{c.code}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="danger" size="sm">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Flagged projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-text-primary">Flagged Projects</h2>
            <Badge variant="danger">0 flagged</Badge>
          </div>
          <p className="text-text-secondary text-sm font-sans">No flagged projects at this time.</p>
        </Card>

        {/* Employer approvals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-text-primary">Employer Approvals</h2>
            <Badge variant="warning">3 pending</Badge>
          </div>
          {["Instabug", "Valeo Egypt", "Rabbit"].map((co) => (
            <div key={co} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <p className="text-sm font-sans text-text-primary">{co}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Accept</Button>
                <Button variant="danger" size="sm">Reject</Button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
