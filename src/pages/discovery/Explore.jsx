import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Badge, Stars, Button, Input, PageHeader, ConfirmActionModal } from "../../components/ui";
import {
  dummyUsers,
  GUC_MAJORS,
  portfolios,
  courses,
  isProjectListedPublicly,
  setProjectPlatformActive,
} from "../../data/dummy";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { useFavorites } from "../../hooks/useFavorites";

const portfolioByOwner = new Map(portfolios.map((portfolio) => [portfolio.owner, portfolio]));

const PORTFOLIO_SKILLS = [...new Set(portfolios.flatMap((p) => p.skills || []))].sort();

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [exploreMode, setExploreMode] = useState(
    location.state?.exploreMode === "portfolios" ? "portfolios" : "projects"
  );

  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [ratingSort, setRatingSort] = useState("");
  const [dateSort, setDateSort] = useState("");

  const [portfolioMajor, setPortfolioMajor] = useState("");
  const [portfolioSkill, setPortfolioSkill] = useState("");
  const [portfolioRatingSort, setPortfolioRatingSort] = useState("");
  const [portfolioDateSort, setPortfolioDateSort] = useState("");

  const [confirmation, setConfirmation] = useState(null);
  const [adminDeactivateTarget, setAdminDeactivateTarget] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const { user } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
  const {
    canUseFavorites,
    isFavoriteProject,
    isFavoritePortfolio,
    saveProject,
    removeProject,
    savePortfolio,
    removePortfolio,
  } = useFavorites();
  const navigate = useNavigate();

  const viewProject = (projectId) => navigate(`/projects/${projectId}`, { state: { activeNav: "/explore" } });
  const viewPortfolio = (portfolioId) =>
    navigate(`/explore/portfolio/${portfolioId}`, {
      state: { activeNav: "/explore", fromExploreMode: "portfolios" },
    });

  useEffect(() => {
    if (location.state?.exploreMode === "portfolios") {
      setExploreMode("portfolios");
    }
  }, [location.state]);

  const requestProjectFavorite = (event, project) => {
    event.stopPropagation();
    const isSaved = isFavoriteProject(project.id);
    setConfirmation({
      action: `${isSaved ? "remove this project from" : "save this project to"} your favorites`,
      variant: isSaved ? "danger" : "gold",
      onConfirm: () => {
        if (isSaved) {
          removeProject(project.id);
          setFeedbackMessage("Project removed from your favorites.");
        } else {
          saveProject(project.id);
          setFeedbackMessage("Project saved to your favorites.");
        }
      },
    });
  };

  const requestPortfolioFavorite = (event, portfolio) => {
    event.stopPropagation();
    if (!portfolio) return;
    if (portfolio.owner === user?.name) return;
    const isSaved = isFavoritePortfolio(portfolio.id);
    setConfirmation({
      action: `${isSaved ? "remove this portfolio from" : "save this portfolio to"} your favorites`,
      variant: isSaved ? "danger" : "gold",
      onConfirm: () => {
        if (isSaved) {
          removePortfolio(portfolio.id);
          setFeedbackMessage("Portfolio removed from your favorites.");
        } else {
          savePortfolio(portfolio.id);
          setFeedbackMessage("Portfolio saved to your favorites.");
        }
      },
    });
  };

  const visiblePool = useMemo(
    () => projectList.filter((project) => isProjectListedPublicly(project)),
    [projectList]
  );
  const publicProjectsByOwner = useMemo(() => {
    const grouped = new Map();
    visiblePool.forEach((project) => {
      const ownerProjects = grouped.get(project.owner) || [];
      grouped.set(project.owner, [...ownerProjects, project]);
    });
    return grouped;
  }, [visiblePool]);
  const q = searchQuery.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    return visiblePool.filter((p) => {
      const matchSearch =
        !q || p.title.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
      const matchCourse = filterCourse ? p.courseCode === filterCourse : true;
      const matchInstructor = filterInstructor
        ? (p.supervisor || "").toLowerCase().includes(filterInstructor.toLowerCase())
        : true;
      const matchDate = filterDate ? p.createdAt === filterDate : true;
      return matchSearch && matchCourse && matchInstructor && matchDate;
    });
  }, [visiblePool, q, filterCourse, filterInstructor, filterDate]);

  const sortedProjects = useMemo(() => {
    const arr = [...filteredProjects];
    arr.sort((a, b) => {
      if (ratingSort) {
        const ratingDelta = ratingSort === "desc" ? b.rating - a.rating : a.rating - b.rating;
        if (ratingDelta !== 0) return ratingDelta;
      }
      if (dateSort) {
        const dateDelta =
          dateSort === "desc"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        if (dateDelta !== 0) return dateDelta;
      }
      return 0;
    });
    return arr;
  }, [filteredProjects, ratingSort, dateSort]);

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const ownerUser = dummyUsers.find((u) => u.name === p.owner);
      const ownerEmail = (ownerUser?.email || "").toLowerCase();
      const studentEmail = (p.studentEmail || "").toLowerCase();
      const emailLocal = studentEmail.split("@")[0] || "";
      const publicProjectMatches = (publicProjectsByOwner.get(p.owner) || []).some(
        (project) =>
          project.title.toLowerCase().includes(q) ||
          (project.course || "").toLowerCase().includes(q)
      );
      const matchSearch =
        !q ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        studentEmail.includes(q) ||
        ownerEmail.includes(q) ||
        emailLocal.includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        publicProjectMatches;
      const matchMajor = portfolioMajor ? p.headline === portfolioMajor : true;
      const matchSkill = portfolioSkill ? (p.skills || []).includes(portfolioSkill) : true;
      return matchSearch && matchMajor && matchSkill;
    });
  }, [publicProjectsByOwner, q, portfolioMajor, portfolioSkill]);

  const sortedPortfolios = useMemo(() => {
    const arr = [...filteredPortfolios];
    const ownerAvgRating = (owner) => {
      const list = publicProjectsByOwner.get(owner) || [];
      if (!list.length) return 0;
      return list.reduce((sum, project) => sum + Number(project.rating || 0), 0) / list.length;
    };
    const ownerDate = (owner, mode) => {
      const list = publicProjectsByOwner.get(owner) || [];
      if (!list.length) return 0;
      const timestamps = list.map((project) => new Date(project.createdAt).getTime());
      return mode === "newest" ? Math.max(...timestamps) : Math.min(...timestamps);
    };

    arr.sort((a, b) => {
      if (portfolioRatingSort) {
        const ratingDelta =
          portfolioRatingSort === "desc"
            ? ownerAvgRating(b.owner) - ownerAvgRating(a.owner)
            : ownerAvgRating(a.owner) - ownerAvgRating(b.owner);
        if (ratingDelta !== 0) return ratingDelta;
      }
      if (portfolioDateSort) {
        const dateDelta =
          portfolioDateSort === "desc"
            ? ownerDate(b.owner, "newest") - ownerDate(a.owner, "newest")
            : ownerDate(a.owner, "oldest") - ownerDate(b.owner, "oldest");
        if (dateDelta !== 0) return dateDelta;
      }
      return 0;
    });
    return arr;
  }, [filteredPortfolios, portfolioRatingSort, portfolioDateSort, publicProjectsByOwner]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div>
      <PageHeader
        title="Explore"
        subtitle="Search student projects and portfolios, then filter and sort results."
        action={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
        }
      />

      {feedbackMessage && (
        <Card className="mb-4 border-success/40 bg-success/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-success text-sm font-sans">{feedbackMessage}</p>
            <Button variant="ghost" size="sm" onClick={() => setFeedbackMessage("")}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search by project title, owner, portfolio title, student name, or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-3xl"
        />
        {!hasSearch && (
          <p className="text-text-secondary text-xs font-sans mt-2">
            Enter a search term to narrow results, or leave empty to browse the full catalog in either mode.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          type="button"
          variant={exploreMode === "projects" ? "gold" : "secondary"}
          onClick={() => setExploreMode("projects")}
        >
          Projects
        </Button>
        <Button
          type="button"
          variant={exploreMode === "portfolios" ? "gold" : "secondary"}
          onClick={() => setExploreMode("portfolios")}
        >
          Portfolios
        </Button>
      </div>

      {exploreMode === "projects" && (
        <div className="flex gap-4 mb-8 flex-wrap items-end">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterInstructor}
            onChange={(e) => setFilterInstructor(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
          >
            <option value="">All instructors</option>
            {[...new Set(visiblePool.map((p) => p.supervisor).filter(Boolean))].map((instructor) => (
              <option key={instructor} value={instructor}>
                {instructor}
              </option>
            ))}
          </select>

          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-bg-elevated border border-border w-auto min-w-[10rem]"
          />

          <select
            value={ratingSort}
            onChange={(e) => setRatingSort(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
          >
            <option value="">Rating sort</option>
            <option value="desc">Highest rating</option>
            <option value="asc">Lowest rating</option>
          </select>

          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
          >
            <option value="">Creation date sort</option>
            <option value="desc">Latest creation date</option>
            <option value="asc">Oldest creation date</option>
          </select>
        </div>
      )}

      {exploreMode === "portfolios" && (
        <div className="flex gap-4 mb-8 flex-wrap items-end">
          <select
            value={portfolioMajor}
            onChange={(e) => setPortfolioMajor(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue min-w-[12rem]"
          >
            <option value="">All majors</option>
            {GUC_MAJORS.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>

          <select
            value={portfolioSkill}
            onChange={(e) => setPortfolioSkill(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue min-w-[12rem]"
          >
            <option value="">All skills</option>
            {PORTFOLIO_SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          <select
            value={portfolioRatingSort}
            onChange={(e) => setPortfolioRatingSort(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue min-w-[14rem]"
          >
            <option value="">Rating sort</option>
            <option value="desc">Highest rating</option>
            <option value="asc">Lowest rating</option>
          </select>

          <select
            value={portfolioDateSort}
            onChange={(e) => setPortfolioDateSort(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue min-w-[14rem]"
          >
            <option value="">Creation date sort</option>
            <option value="desc">Latest creation date</option>
            <option value="asc">Oldest creation date</option>
          </select>
        </div>
      )}

      {exploreMode === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProjects.map((p) => {
            const ownerPortfolio = portfolioByOwner.get(p.owner);
            const projectSaved = isFavoriteProject(p.id);
            const portfolioSaved = ownerPortfolio ? isFavoritePortfolio(ownerPortfolio.id) : false;
            const isOwnerProject = p.owner === user?.name;
            const canSaveThisProject = canUseFavorites && !isOwnerProject;
            const canSaveOwnerPortfolio = ownerPortfolio && canUseFavorites && ownerPortfolio.owner !== user?.name;

            return (
              <Card
                key={p.id}
                hover
                className="cursor-pointer"
                onClick={() => viewProject(p.id)}
                role="link"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    viewProject(p.id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="blue">{p.courseCode}</Badge>
                  <Stars rating={p.rating} />
                </div>

                <h3 className="font-display text-base text-text-primary mb-2 break-words">{p.title}</h3>

                <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{p.description}</p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {p.languages.map((l) => (
                    <Badge key={l}>{l}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-sans text-text-secondary truncate">{p.owner}</span>
                    <span className="font-mono text-xs text-text-secondary">Created {p.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {canSaveThisProject && (
                      <Button
                        variant={projectSaved ? "danger" : "gold"}
                        size="sm"
                        onClick={(event) => requestProjectFavorite(event, p)}
                      >
                        {projectSaved ? "Remove project" : "Save project"}
                      </Button>
                    )}
                    {canSaveOwnerPortfolio && (
                      <Button
                        variant={portfolioSaved ? "danger" : "gold"}
                        size="sm"
                        onClick={(event) => requestPortfolioFavorite(event, ownerPortfolio)}
                      >
                        {portfolioSaved ? "Remove portfolio" : "Save portfolio"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        viewProject(p.id);
                      }}
                    >
                      View →
                    </Button>

                    {user?.role?.toLowerCase() === "admin" && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={p.platformActive === false}
                        onClick={(event) => {
                          event.stopPropagation();
                          setAdminDeactivateTarget(p);
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {sortedProjects.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-secondary font-sans">
              No projects match your search and filters.
            </div>
          )}
        </div>
      )}

      {exploreMode === "portfolios" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPortfolios.map((pf) => {
            const nProjects = publicProjectsByOwner.get(pf.owner)?.length || 0;
            const portfolioSaved = isFavoritePortfolio(pf.id);
            const canSaveThisPortfolio = canUseFavorites && pf.owner !== user?.name;

            return (
              <Card
                key={pf.id}
                hover
                className="cursor-pointer"
                onClick={() => viewPortfolio(pf.id)}
                role="link"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    viewPortfolio(pf.id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <Badge variant="blue">{pf.headline}</Badge>
                  <span className="font-mono text-xs text-text-secondary whitespace-nowrap">{nProjects} projects</span>
                </div>
                <h3 className="font-display text-base text-text-primary mb-1 break-words">{pf.studentName}</h3>
                <p className="text-sm text-text-secondary font-sans mb-1 break-all">{pf.title}</p>
                <p className="text-xs font-mono text-text-secondary mb-3 break-all">{pf.studentEmail}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(pf.skills || []).slice(0, 6).map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {canSaveThisPortfolio && (
                    <Button
                      variant={portfolioSaved ? "danger" : "gold"}
                      size="sm"
                      onClick={(event) => requestPortfolioFavorite(event, pf)}
                    >
                      {portfolioSaved ? "Remove portfolio" : "Save portfolio"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      viewPortfolio(pf.id);
                    }}
                  >
                    View portfolio →
                  </Button>
                </div>
              </Card>
            );
          })}

          {sortedPortfolios.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-secondary font-sans">
              No portfolios match your search and filters.
            </div>
          )}
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />

      <ConfirmActionModal
        isOpen={adminDeactivateTarget !== null}
        action={`deactivate "${adminDeactivateTarget?.title ?? "this project"}" — it will disappear from Explore until an administrator activates it again from Admin → Projects`}
        variant="danger"
        onClose={() => setAdminDeactivateTarget(null)}
        onConfirm={() => {
          if (!adminDeactivateTarget?.id) return;
          const title = adminDeactivateTarget.title;
          setProjectPlatformActive(adminDeactivateTarget.id, false);
          updateProject(adminDeactivateTarget.id, { platformActive: false });
          setAdminDeactivateTarget(null);
          setFeedbackMessage(`“${title}” was deactivated.`);
        }}
      />
    </div>
  );
}
