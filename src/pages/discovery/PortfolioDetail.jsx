import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectTitleLink } from "../../components/ProjectTitleLink";
import { Badge, Button, Card, PageHeader, Stars } from "../../components/ui";
import { portfolios, projects } from "../../data/dummy";

export default function PortfolioDetail() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();

  const portfolio = useMemo(
    () => portfolios.find((p) => String(p.id) === String(portfolioId)),
    [portfolioId]
  );

  const portfolioProjects = useMemo(() => {
    if (!portfolio?.projectIds?.length) return [];
    const idSet = new Set(portfolio.projectIds);
    return projects.filter((proj) => idSet.has(proj.id));
  }, [portfolio]);

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-3xl px-4">
        <PageHeader title="Portfolio not found" subtitle="This portfolio id is not in the demo catalog." />
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHeader
        title={portfolio.title}
        subtitle={`${portfolio.studentName} · ${portfolio.studentEmail}`}
        action={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <Card className="p-5 border-border">
          <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-2">Student profile</p>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm font-sans">
            <div>
              <dt className="text-text-secondary">Major</dt>
              <dd className="text-text-primary font-medium mt-0.5">{portfolio.headline}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Contribution score (demo)</dt>
              <dd className="font-mono text-text-primary mt-0.5">{portfolio.contributionScore ?? "—"}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(portfolio.skills || []).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 border-border">
          <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-3">
            Projects in this portfolio ({portfolioProjects.length})
          </p>
          {portfolioProjects.length === 0 ? (
            <p className="text-sm text-text-secondary font-sans">No linked projects in demo data.</p>
          ) : (
            <ul className="space-y-4">
              {portfolioProjects.map((proj) => (
                <li
                  key={proj.id}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-display text-sm text-text-primary break-words">
                      <ProjectTitleLink project={proj} className="font-display text-sm text-text-primary break-words" navState={{ activeNav: "/explore" }} stopPropagation={false} />
                    </p>
                    <p className="text-xs text-text-secondary font-sans mt-1 line-clamp-2">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="blue">{proj.courseCode}</Badge>
                      {proj.flagged && <Badge variant="danger">Flagged</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                    <Stars rating={proj.rating} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        navigate(`/projects/${proj.id}`, { state: { activeNav: "/explore" } })
                      }
                    >
                      Open project →
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
