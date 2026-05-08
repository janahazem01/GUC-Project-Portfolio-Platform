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

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, Input, PageHeader, ConfirmActionModal } from "../../components/ui";
import { projects, courses, portfolios } from "../../data/dummy";
import { AuthContext } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";

const portfolioByOwner = new Map(portfolios.map((portfolio) => [portfolio.owner, portfolio]));

export default function Explore() {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // ✅ Existing filters
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // ✅ NEW: single sorting option
  const [sortBy, setSortBy] = useState("");
  const [confirmation, setConfirmation] = useState(null);
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

  // 🔹 FILTERING (unchanged)
  const filtered = projects.filter((p) => {
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

      {feedbackMessage && (
        <Card className="mb-4 border-success/40 bg-success/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-success text-sm font-sans">{feedbackMessage}</p>
            <Button variant="ghost" size="sm" onClick={() => setFeedbackMessage("")}>Dismiss</Button>
          </div>
        </Card>
      )}

      {/* 🔥 FILTER BAR */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Input
          placeholder="Search by project title..."
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
          {[...new Set(projects.map(p => p.owner))].map((owner) => (
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
        {sorted.map((p) => {
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

            <h3 className="font-display text-base text-text-primary mb-2">{p.title}</h3>

            <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">
              {p.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {p.languages.map((l) => <Badge key={l}>{l}</Badge>)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-sans text-text-secondary">{p.owner}</span>
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
                      {projectSaved ? "Remove Project" : "Save Project"}
                    </Button>
                    {ownerPortfolio && (
                      <Button
                        variant={portfolioSaved ? "danger" : "gold"}
                        size="sm"
                        onClick={(event) => requestPortfolioFavorite(event, ownerPortfolio)}
                      >
                        {portfolioSaved ? "Remove Portfolio" : "Save Portfolio"}
                      </Button>
                    )}
                  </>
                )}
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
          );
        })}

        {sorted.length === 0 && (
          <div className="col-span-3 text-center py-16 text-text-secondary font-sans">
            No projects found.
          </div>
        )}
      </div>

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />
    </div>
  );
}
