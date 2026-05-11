import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, ConfirmActionModal, PageHeader, Stars, SuccessToast } from "../../components/ui";
import { portfolios } from "../../data/dummy";
import { useProjects } from "../../context/ProjectsContext";
import { useFavorites } from "../../hooks/useFavorites";
import { UserProfileNavSpan } from "../../components/UserProfileLink";
import { ProjectTitleLink } from "../../components/ProjectTitleLink";

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-xl text-text-primary">{title}</h2>
      <Badge variant="gold">{count}</Badge>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const { projectList } = useProjects();
  const {
    canUseFavorites,
    favoriteProjectIds,
    favoritePortfolioIds,
    removeProject,
    removePortfolio,
  } = useFavorites();
  const [confirmation, setConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const projectById = useMemo(
    () => new Map(projectList.map((project) => [project.id, project])),
    [projectList]
  );

  const favoriteProjects = useMemo(
    () => favoriteProjectIds.map((projectId) => projectById.get(projectId)).filter(Boolean),
    [favoriteProjectIds, projectById]
  );

  const favoritePortfolios = useMemo(
    () => favoritePortfolioIds
      .map((portfolioId) => portfolios.find((portfolio) => portfolio.id === portfolioId))
      .filter(Boolean),
    [favoritePortfolioIds]
  );

  const viewProject = (projectId) => {
    navigate(`/projects/${projectId}`, { state: { activeNav: "/favorites" } });
  };

  const viewPortfolio = (portfolioId) => {
    navigate(`/explore/portfolio/${portfolioId}`, {
      state: { activeNav: "/favorites", fromExploreMode: "portfolios" },
    });
  };

  const requestRemoveProject = (project) => {
    setConfirmation({
      action: `remove ${project.title} from your favorite projects`,
      variant: "danger",
      onConfirm: () => {
        removeProject(project.id);
        setSuccessMessage("Project removed from favorites.");
      },
    });
  };

  const requestRemovePortfolio = (portfolio) => {
    const ownerLabel = portfolio.studentName || portfolio.owner || "this student";
    setConfirmation({
      action: `remove ${ownerLabel}'s portfolio from your favorites`,
      variant: "danger",
      onConfirm: () => {
        removePortfolio(portfolio.id);
        setSuccessMessage("Portfolio removed from favorites.");
      },
    });
  };

  if (!canUseFavorites) {
    return (
      <div>
        <PageHeader title="Favorites" subtitle="Favorites are available for students and employers." />
        <Card>
          <p className="text-text-secondary text-sm font-sans">This account type does not have a favorites list.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Favorites"
        subtitle="Your saved projects and student portfolios"
      />

      <section className="mb-8">
        <SectionHeader title="Favorite Projects" count={favoriteProjects.length} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {favoriteProjects.length > 0 ? favoriteProjects.map((project) => (
            <Card
              key={project.id}
              hover
              className="cursor-pointer"
              onClick={() => viewProject(project.id)}
              role="link"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  viewProject(project.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-display text-base text-text-primary">
                      <ProjectTitleLink project={project} className="font-display text-base text-text-primary" navState={{ activeNav: "/favorites" }} />
                    </h3>
                    <Badge variant="blue">{project.courseCode}</Badge>
                  </div>
                  <p className="text-text-secondary text-sm font-sans line-clamp-2">{project.description}</p>
                </div>
                <Stars rating={project.rating} />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.languages.map((language) => <Badge key={language}>{language}</Badge>)}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <div className="min-w-0">
                  <p className="text-xs font-sans text-text-secondary truncate">
                    <UserProfileNavSpan ownerName={project.owner} className="text-text-secondary" />
                  </p>
                  <p className="text-xs font-mono text-text-secondary">Created {project.createdAt}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      viewProject(project.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      requestRemoveProject(project);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          )) : (
            <Card className="xl:col-span-2">
              <p className="text-text-secondary text-sm font-sans">No favorite projects saved yet.</p>
            </Card>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="Favorite Portfolios" count={favoritePortfolios.length} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {favoritePortfolios.length > 0 ? favoritePortfolios.map((portfolio) => (
              <Card
                key={portfolio.id}
                hover
                className="cursor-pointer"
                role="link"
                tabIndex={0}
                onClick={() => viewPortfolio(portfolio.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    viewPortfolio(portfolio.id);
                  }
                }}
              >
                <div className="min-w-0 space-y-2 mb-6">
                  <h3 className="font-display text-lg text-text-primary leading-snug">
                    {portfolio.studentName || portfolio.owner}
                  </h3>
                  <p className="text-text-primary text-sm font-sans font-medium leading-snug">{portfolio.title}</p>
                  <p className="text-text-secondary text-sm font-sans leading-relaxed">{portfolio.headline}</p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      viewPortfolio(portfolio.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      requestRemovePortfolio(portfolio);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            )) : (
            <Card className="xl:col-span-2">
              <p className="text-text-secondary text-sm font-sans">No favorite portfolios saved yet.</p>
            </Card>
          )}
        </div>
      </section>

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />
      <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );
}
