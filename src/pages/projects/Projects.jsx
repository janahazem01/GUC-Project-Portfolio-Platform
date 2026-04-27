import { Card, Badge, Stars, Button, PageHeader } from "../../components/ui";
import { projects, currentUser } from "../../data/dummy";

export default function Projects() {
  const myProjects = projects.filter((p) => p.owner === currentUser.name);

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="Manage and track your submitted projects"
        action={<Button variant="gold">+ New Project</Button>}
      />

      <div className="flex flex-col gap-4">
        {myProjects.map((p) => (
          <Card key={p.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-lg text-text-primary">{p.title}</h3>
                  <Badge variant="blue">{p.courseCode}</Badge>
                  <Badge variant={p.visibility === "public" ? "success" : "default"}>{p.visibility}</Badge>
                </div>
                <p className="text-text-secondary text-sm font-sans mb-3 max-w-xl">{p.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {p.languages.map((l) => <Badge key={l}>{l}</Badge>)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 ml-6 shrink-0">
                <Stars rating={p.rating} />
                <p className="font-mono text-xs text-text-secondary">{p.createdAt}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
