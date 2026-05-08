import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader } from "../../components/ui";
import { useProjects } from "../../context/ProjectsContext";

function CampusPreview({ project }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl text-text-primary mb-1">Campus Map</h2>
          <p className="text-text-secondary text-sm font-sans">Room search and lab availability preview</p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-bg-elevated border border-border rounded-lg p-4 min-h-80">
          <div className="grid grid-cols-3 gap-3 h-full">
            {["B1", "B2", "C7", "D4", "H12", "Library"].map((building, index) => (
              <div key={building} className="border border-border rounded-lg p-3 flex flex-col justify-between">
                <span className="font-mono text-xs text-text-secondary">Building</span>
                <span className="font-display text-2xl text-text-primary">{building}</span>
                <Badge variant={index % 2 === 0 ? "success" : "blue"}>{index % 2 === 0 ? "Available" : "Busy"}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-bg-elevated border border-border rounded-lg p-4">
          <h3 className="font-display text-base text-text-primary mb-4">Selected Room</h3>
          <div className="flex flex-col gap-3 text-sm font-sans">
            <p className="text-text-primary">C7.301 Software Lab</p>
            <p className="text-text-secondary">Capacity: 36 students</p>
            <p className="text-text-secondary">Equipment: Projector, PCs</p>
            <p className="text-text-secondary">Next free slot: 2:00 PM</p>
          </div>
        </div>
      </div>
      <p className="text-text-secondary text-xs font-sans mt-4">{project.description}</p>
    </Card>
  );
}

function SentimentPreview() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl text-text-primary mb-1">Sentiment Analyzer</h2>
          <p className="text-text-secondary text-sm font-sans">Simple Arabic text classification preview</p>
        </div>
        <Badge variant="blue">91% Accuracy</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-elevated border border-border rounded-lg p-4 min-h-64">
          <p className="font-mono text-xs text-text-secondary mb-3">Input</p>
          <p className="text-text-primary text-lg font-sans leading-8">
            المشروع ممتاز وسهل الاستخدام والنتيجة واضحة جدا.
          </p>
        </div>
        <div className="bg-bg-elevated border border-border rounded-lg p-4 min-h-64">
          <p className="font-mono text-xs text-text-secondary mb-3">Prediction</p>
          <div className="flex items-center gap-3 mb-5">
            <Badge variant="success">Positive</Badge>
            <span className="font-display text-3xl text-text-primary">94%</span>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-text-secondary text-xs mb-1">Positive</p>
              <div className="h-2 bg-bg-base rounded-full overflow-hidden"><div className="h-full w-11/12 bg-success" /></div>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-1">Neutral</p>
              <div className="h-2 bg-bg-base rounded-full overflow-hidden"><div className="h-full w-1/12 bg-warning" /></div>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-1">Negative</p>
              <div className="h-2 bg-bg-base rounded-full overflow-hidden"><div className="h-full w-1/12 bg-danger" /></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PortfolioPreview({ project }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl text-text-primary mb-1">Project Discovery</h2>
          <p className="text-text-secondary text-sm font-sans">Portfolio browsing preview</p>
        </div>
        <Badge variant="gold">Prototype</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[project, ...projects.filter((item) => item.id !== project.id)].map((item) => (
          <div key={item.id} className="bg-bg-elevated border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="blue">{item.courseCode}</Badge>
              <Badge variant={item.status === "Completed" ? "success" : "default"}>{item.status}</Badge>
            </div>
            <h3 className="font-display text-base text-text-primary mb-2">{item.title}</h3>
            <p className="text-text-secondary text-xs font-sans line-clamp-3 mb-4">{item.description}</p>
            <div className="flex gap-2 flex-wrap">
              {item.languages.slice(0, 2).map((language) => (
                <Badge key={language}>{language}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ProjectPreview() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projectList } = useProjects();
  const project = projectList.find((item) => item.id === Number(projectId));

  if (!project) {
    return (
      <div>
        <PageHeader
          title="Preview Not Found"
          subtitle="The selected project preview could not be found."
          action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
        />
      </div>
    );
  }

  const preview =
    project.id === 1 ? <CampusPreview project={project} /> :
    project.id === 2 ? <SentimentPreview project={project} /> :
    <PortfolioPreview project={project} />;

  return (
    <div>
      <PageHeader
        title={`${project.title} Preview`}
        subtitle="Simple visual demo"
        action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
      />
      {preview}
    </div>
  );
}
