import { Card, Badge, Button, Input, PageHeader } from "../../components/ui";
import { internships } from "../../data/dummy";

export default function Internships() {
  return (
    <div>
      <PageHeader
        title="Internships"
        subtitle="Find opportunities that match your skills"
      />

      <div className="flex gap-4 mb-8">
        <Input placeholder="Search internships..." className="flex-1" />
        <Input placeholder="Filter by company..." className="w-48" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {internships.map((i) => (
          <Card key={i.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-base text-text-primary mb-1">{i.title}</h3>
                <p className="text-accent-blue text-sm font-sans">{i.company}</p>
              </div>
              <Badge variant={i.status === "hiring" ? "success" : "default"}>
                {i.status === "hiring" ? "Hiring" : "Filled"}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {i.skills.map((s) => <Badge key={s}>{s}</Badge>)}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-text-secondary">Duration: {i.duration}</p>
                <p className="text-xs font-mono text-text-secondary">Deadline: {i.deadline}</p>
              </div>
              <Button variant="gold" size="sm">Apply</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
