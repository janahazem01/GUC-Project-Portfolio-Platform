<<<<<<< HEAD
// import { useState } from "react";
// import { Card, Badge, Stars, Button, Input, PageHeader } from "../../components/ui";
// import { projects, courses } from "../../data/dummy";

// export default function Explore() {
//   const [search, setSearch] = useState("");
//   const [filterCourse, setFilterCourse] = useState("");

//   const filtered = projects.filter((p) => {
//     const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
//     const matchCourse = filterCourse ? p.courseCode === filterCourse : true;
//     return matchSearch && matchCourse;
//   });

//   return (
//     <div>
//       <PageHeader title="Explore Projects" subtitle="Discover what GUC students have built" />

//       <div className="flex gap-4 mb-8">
//         <Input
//           placeholder="Search by project title..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1"
//         />
//         <select
//           value={filterCourse}
//           onChange={(e) => setFilterCourse(e.target.value)}
//           className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
//         >
//           <option value="">All Courses</option>
//           {courses.map((c) => (
//             <option key={c.id} value={c.code}>{c.name}</option>
//           ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         {filtered.map((p) => (
//           <Card key={p.id} hover>
//             <div className="flex items-start justify-between mb-2">
//               <Badge variant="blue">{p.courseCode}</Badge>
//               <Stars rating={p.rating} />
//             </div>
//             <h3 className="font-display text-base text-text-primary mb-2">{p.title}</h3>
//             <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{p.description}</p>
//             <div className="flex items-center gap-2 flex-wrap mb-4">
//               {p.languages.map((l) => <Badge key={l}>{l}</Badge>)}
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs font-sans text-text-secondary">{p.owner}</span>
//               <Button variant="ghost" size="sm">View →</Button>
//             </div>
//           </Card>
//         ))}
//         {filtered.length === 0 && (
//           <div className="col-span-3 text-center py-16 text-text-secondary font-sans">
//             No projects found.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// 






// import { useState, useContext } from "react";
// import { Card, Badge, Stars, Button, Input, PageHeader } from "../../components/ui";
// import { projects, courses } from "../../data/dummy";
// import { AuthContext } from "../../context/AuthContext";

// export default function Explore() {
//   const [search, setSearch] = useState("");
//   const [filterCourse, setFilterCourse] = useState("");

//   // ✅ NEW (added only)
//   const [filterInstructor, setFilterInstructor] = useState("");
//   const [filterDate, setFilterDate] = useState("");

//   const { user } = useContext(AuthContext);

//   const filtered = projects.filter((p) => {
//     const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
//     const matchCourse = filterCourse ? p.courseCode === filterCourse : true;

//     // ✅ NEW filters (do NOT change existing ones)
//     const matchInstructor = filterInstructor
//       ? p.owner.toLowerCase().includes(filterInstructor.toLowerCase())
//       : true;

//     const matchDate = filterDate
//       ? p.createdAt && new Date(p.createdAt) >= new Date(filterDate)
//       : true;

//     return matchSearch && matchCourse && matchInstructor && matchDate;
//   });

//   return (
//     <div>
//       <PageHeader title="Explore Projects" subtitle="Discover what GUC students have built" />

//       {/* 🔥 FILTER BAR */}
//       <div className="flex gap-4 mb-8 flex-wrap">
//         <Input
//           placeholder="Search by project title..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1"
//         />

//         {/* Course */}
//         <select
//           value={filterCourse}
//           onChange={(e) => setFilterCourse(e.target.value)}
//           className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans"
//         >
//           <option value="">All Courses</option>
//           {courses.map((c) => (
//             <option key={c.id} value={c.code}>{c.name}</option>
//           ))}
//         </select>

//         {/* ✅ NEW: Instructor */}
//         <select
//           value={filterInstructor}
//           onChange={(e) => setFilterInstructor(e.target.value)}
//           className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans"
//         >
//           <option value="">All Instructors</option>
//           {[...new Set(projects.map(p => p.owner))].map((owner) => (
//             <option key={owner} value={owner}>{owner}</option>
//           ))}
//         </select>

//         {/* ✅ NEW: Date */}
//         <Input
//           type="date"
//           value={filterDate}
//           onChange={(e) => setFilterDate(e.target.value)}
//           className="bg-bg-elevated border border-border"
//         />
//       </div>

//       {/* PROJECTS */}
//       <div className="grid grid-cols-3 gap-4">
//         {filtered.map((p) => (
//           <Card key={p.id} hover>
//             <div className="flex items-start justify-between mb-2">
//               <Badge variant="blue">{p.courseCode}</Badge>
//               <Stars rating={p.rating} />
//             </div>

//             <h3 className="font-display text-base text-text-primary mb-2">{p.title}</h3>

//             <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">
//               {p.description}
//             </p>

//             <div className="flex items-center gap-2 flex-wrap mb-4">
//               {p.languages.map((l) => <Badge key={l}>{l}</Badge>)}
//             </div>

//             <div className="flex items-center justify-between">
//               <span className="text-xs font-sans text-text-secondary">{p.owner}</span>

//               <div className="flex gap-2">
//                 <Button variant="ghost" size="sm">View →</Button>

//                 {user?.role === "admin" && (
//                   <>
//                     <Button variant="ghost" size="sm">Edit</Button>
//                     <Button variant="ghost" size="sm">Delete</Button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </Card>
//         ))}

//         {filtered.length === 0 && (
//           <div className="col-span-3 text-center py-16 text-text-secondary font-sans">
//             No projects found.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, Input, PageHeader } from "../../components/ui";
import { courses } from "../../data/dummy";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // ✅ Existing filters
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // ✅ NEW: single sorting option
  const [sortBy, setSortBy] = useState("");

  const { user } = useContext(AuthContext);
  const { projectList } = useProjects();
  const navigate = useNavigate();
  const viewProject = (projectId) => navigate(`/projects/${projectId}`, { state: { activeNav: "/explore" } });

  // Req 41 — searchable catalog from live projects (admins see all titles; others see public)
  const catalog = useMemo(() => {
    if (user?.role === "admin") return projectList;
    return projectList.filter((p) => p.visibility === "public");
  }, [projectList, user?.role]);

  const filtered = catalog.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse ? p.courseCode === filterCourse : true;

    const matchInstructor = filterInstructor
      ? p.owner.toLowerCase().includes(filterInstructor.toLowerCase())
      : true;

    const matchDate = filterDate
      ? p.createdAt && new Date(p.createdAt) >= new Date(filterDate)
      : true;

    return matchSearch && matchCourse && matchInstructor && matchDate;
  });

  // 🔹 SORTING (only one active at a time)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt); // newest first
    }

    if (sortBy === "rating") {
      return b.rating - a.rating; // highest first
    }

    return 0; // no sorting
  });

  return (
    <div>
      <PageHeader title="Explore Projects" subtitle="Discover what GUC students have built" />

      {/* 🔥 FILTER BAR */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Input
          placeholder="Search by project title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        {/* Course */}
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.code}>{c.name}</option>
          ))}
        </select>

        {/* Instructor */}
        <select
          value={filterInstructor}
          onChange={(e) => setFilterInstructor(e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans"
        >
          <option value="">All Instructors</option>
          {[...new Set(catalog.map((p) => p.owner))].map((owner) => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>

        {/* Date */}
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-bg-elevated border border-border"
        />

        {/* ✅ SORT (ONLY ONE OPTION) */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans"
        >
          <option value="">Sort By</option>
          <option value="date">Newest</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* PROJECTS */}
      <div className="grid grid-cols-3 gap-4">
        {sorted.map((p) => (
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

            <h3 className="font-display text-base text-text-primary mb-2">{p.title}</h3>

            <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">
              {p.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {(p.languages || []).map((l) => <Badge key={l}>{l}</Badge>)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-sans text-text-secondary">{p.owner}</span>
                <span className="font-mono text-xs text-text-secondary">Created {p.createdAt}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={(event) => {
                  event.stopPropagation();
                  viewProject(p.id);
                }}>View →</Button>

                {user?.role?.toLowerCase() === "admin" && (
                  <>
                    <Button variant="ghost" size="sm" onClick={(event) => event.stopPropagation()}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={(event) => event.stopPropagation()}>Delete</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {sorted.length === 0 && (
          <div className="col-span-3 text-center py-16 text-text-secondary font-sans">
            No projects found.
          </div>
        )}
      </div>
=======
import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, Input, PageHeader, ConfirmActionModal } from "../../components/ui";
import {
  dummyUsers,
  exploreProjectsForUser,
  GUC_MAJORS,
  portfolios,
  projects,
  courses,
  setProjectPlatformActive,
} from "../../data/dummy";
import { AuthContext } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";

const portfolioByOwner = new Map(portfolios.map((portfolio) => [portfolio.owner, portfolio]));

const PORTFOLIO_SKILLS = [...new Set(portfolios.flatMap((p) => p.skills || []))].sort();

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [exploreMode, setExploreMode] = useState("projects");

  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [portfolioMajor, setPortfolioMajor] = useState("");
  const [portfolioSkill, setPortfolioSkill] = useState("");
  const [portfolioSort, setPortfolioSort] = useState("");

  const [confirmation, setConfirmation] = useState(null);
  const [adminDeactivateTarget, setAdminDeactivateTarget] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const { user } = useContext(AuthContext);
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
    navigate(`/explore/portfolio/${portfolioId}`, { state: { activeNav: "/explore" } });

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

  const visiblePool = exploreProjectsForUser(user);
  const q = searchQuery.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    return visiblePool.filter((p) => {
      const matchSearch =
        !q || p.title.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
      const matchCourse = filterCourse ? p.courseCode === filterCourse : true;
      const matchInstructor = filterInstructor
        ? p.owner.toLowerCase().includes(filterInstructor.toLowerCase())
        : true;
      const matchDate = filterDate
        ? p.createdAt && new Date(p.createdAt) >= new Date(filterDate)
        : true;
      return matchSearch && matchCourse && matchInstructor && matchDate;
    });
  }, [visiblePool, q, filterCourse, filterInstructor, filterDate]);

  const sortedProjects = useMemo(() => {
    const arr = [...filteredProjects];
    if (sortBy === "date") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "rating") {
      arr.sort((a, b) => b.rating - a.rating);
    }
    return arr;
  }, [filteredProjects, sortBy]);

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const ownerUser = dummyUsers.find((u) => u.name === p.owner);
      const ownerEmail = (ownerUser?.email || "").toLowerCase();
      const studentEmail = (p.studentEmail || "").toLowerCase();
      const emailLocal = studentEmail.split("@")[0] || "";
      const matchSearch =
        !q ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        studentEmail.includes(q) ||
        ownerEmail.includes(q) ||
        emailLocal.includes(q) ||
        (p.title && p.title.toLowerCase().includes(q));
      const matchMajor = portfolioMajor ? p.headline === portfolioMajor : true;
      const matchSkill = portfolioSkill ? (p.skills || []).includes(portfolioSkill) : true;
      return matchSearch && matchMajor && matchSkill;
    });
  }, [q, portfolioMajor, portfolioSkill]);

  const sortedPortfolios = useMemo(() => {
    const arr = [...filteredPortfolios];
    if (portfolioSort === "projects-desc") {
      arr.sort((a, b) => (b.projectIds?.length || 0) - (a.projectIds?.length || 0));
    } else if (portfolioSort === "projects-asc") {
      arr.sort((a, b) => (a.projectIds?.length || 0) - (b.projectIds?.length || 0));
    }
    return arr;
  }, [filteredPortfolios, portfolioSort]);

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
            <option value="">All owners</option>
            {[...new Set(projects.map((p) => p.owner))].map((owner) => (
              <option key={owner} value={owner}>
                {owner}
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
          >
            <option value="">Sort by</option>
            <option value="date">Newest</option>
            <option value="rating">Highest rating</option>
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
            value={portfolioSort}
            onChange={(e) => setPortfolioSort(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue min-w-[14rem]"
          >
            <option value="">Sort portfolios</option>
            <option value="projects-desc">Most projects first</option>
            <option value="projects-asc">Fewest projects first</option>
          </select>
        </div>
      )}

      {exploreMode === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProjects.map((p) => {
            const ownerPortfolio = portfolioByOwner.get(p.owner);
            const projectSaved = isFavoriteProject(p.id);
            const portfolioSaved = ownerPortfolio ? isFavoritePortfolio(ownerPortfolio.id) : false;

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
                    {canUseFavorites && (
                      <>
                        <Button
                          variant={projectSaved ? "danger" : "gold"}
                          size="sm"
                          onClick={(event) => requestProjectFavorite(event, p)}
                        >
                          {projectSaved ? "Remove project" : "Save project"}
                        </Button>
                        {ownerPortfolio && (
                          <Button
                            variant={portfolioSaved ? "danger" : "gold"}
                            size="sm"
                            onClick={(event) => requestPortfolioFavorite(event, ownerPortfolio)}
                          >
                            {portfolioSaved ? "Remove portfolio" : "Save portfolio"}
                          </Button>
                        )}
                      </>
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
            const nProjects = pf.projectIds?.length || 0;
            const portfolioSaved = isFavoritePortfolio(pf.id);

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
                <h3 className="font-display text-base text-text-primary mb-1 break-words">{pf.title}</h3>
                <p className="text-sm text-text-secondary font-sans mb-1 break-all">{pf.studentName}</p>
                <p className="text-xs font-mono text-text-secondary mb-3 break-all">{pf.studentEmail}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(pf.skills || []).slice(0, 6).map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {canUseFavorites && (
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
          setAdminDeactivateTarget(null);
          setFeedbackMessage(`“${title}” was deactivated.`);
        }}
      />
>>>>>>> 9f4b2424982437589b183a75a7db7369e10fa687
    </div>
  );
}
