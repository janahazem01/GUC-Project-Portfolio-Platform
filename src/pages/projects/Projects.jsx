import { useContext } from "react";
import { Card, Badge, Stars, Button, PageHeader } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { projects } from "../../data/dummy";

export default function Projects() {
  const { user } = useContext(AuthContext);
  const myProjects = projects.filter((project) => project.owner === user?.name);

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="Manage and track your submitted projects"
        action={<Button variant="gold">+ New Project</Button>}
      />

      <div className="flex flex-col gap-4">
        {myProjects.length > 0 ? (
          myProjects.map((project) => (
            <Card key={project.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg text-text-primary">{project.title}</h3>
                    <Badge variant="blue">{project.courseCode}</Badge>
                    <Badge variant={project.visibility === "public" ? "success" : "default"}>{project.visibility}</Badge>
                  </div>
                  <p className="text-text-secondary text-sm font-sans mb-3 max-w-xl">{project.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.languages.map((language) => <Badge key={language}>{language}</Badge>)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 ml-6 shrink-0">
                  <Stars rating={project.rating} />
                  <p className="font-mono text-xs text-text-secondary">{project.createdAt}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-text-secondary font-sans">
              {user ? "You do not have any projects yet." : "No active user is available."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
