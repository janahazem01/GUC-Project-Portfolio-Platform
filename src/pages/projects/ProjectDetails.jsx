import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, Stars } from "../../components/ui";
import { useProjects } from "../../context/ProjectsContext";

function ReadmeSection({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xl text-text-primary mb-3">{title}</h2>
      <div className="border-t border-border pt-4">{children}</div>
    </section>
  );
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectList } = useProjects();
  const project = projectList.find((item) => item.id === Number(projectId));
  const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const activeNav = location.state?.activeNav || "/projects";
  const openPreview = () => navigate(`/projects/${project.id}/preview`, { state: { activeNav } });

  if (!project) {
    return (
      <div>
        <PageHeader
          title="Project Not Found"
          subtitle="The selected project could not be found."
          action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
        />
        <Card>
          <p className="text-text-secondary font-sans">Please select another project from the projects page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${project.course} - ${project.owner}`}
        action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
      />

      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue">{project.courseCode}</Badge>
              <Badge variant={project.visibility === "public" ? "success" : "default"}>{project.visibility}</Badge>
              {project.languages.map((language) => (
                <Badge key={language}>{language}</Badge>
              ))}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Stars rating={project.rating} />
              <Badge variant="gold">{project.status}</Badge>
            </div>
          </div>

          <p className="text-text-secondary text-sm font-sans leading-6 mb-6">{project.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Owner</p>
              <p className="font-sans text-sm text-text-primary">{project.owner}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Course</p>
              <p className="font-sans text-sm text-text-primary">{project.course}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Supervisor</p>
              <p className="font-sans text-sm text-text-primary">{project.supervisor}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Created</p>
              <p className="font-sans text-sm text-text-primary">{project.createdAt}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Rating</p>
              <p className="font-sans text-sm text-text-primary">{project.rating}/5</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Team</p>
              <p className="font-sans text-sm text-text-primary">{project.team.join(", ")}</p>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-text-secondary text-xl">[]</span>
              <h2 className="font-display text-lg text-text-primary">README</h2>
            </div>
            <div className="flex items-center gap-3">
              {project.demo && (
                <Button variant="gold" size="sm" onClick={openPreview}>
                  View Project
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => openExternal(project.github)}>
                GitHub
              </Button>
            </div>
          </div>

          <div className="px-8 py-8 flex flex-col gap-8">
            <div>
              <h1 className="font-display text-4xl text-text-primary mb-4">{project.title}</h1>
              <div className="border-t border-border pt-4">
                <p className="text-text-secondary text-sm font-sans leading-6">{project.description}</p>
              </div>
            </div>

            <ReadmeSection title="Project Access">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.demo && <li>Visual preview: available from the View Project button.</li>}
                <li>Repository: available from the GitHub button.</li>
              </ul>
            </ReadmeSection>

            <ReadmeSection title="Problem">
              <p className="text-text-secondary text-sm font-sans leading-6">{project.problem}</p>
            </ReadmeSection>

            <ReadmeSection title="Solution">
              <p className="text-text-secondary text-sm font-sans leading-6">{project.solution}</p>
            </ReadmeSection>

            <ReadmeSection title="Key Features">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.features.slice(0, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </ReadmeSection>

            <ReadmeSection title="Outcomes">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.outcomes.slice(0, 2).map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </ReadmeSection>
          </div>
        </Card>
      </div>
    </div>
  );
}
