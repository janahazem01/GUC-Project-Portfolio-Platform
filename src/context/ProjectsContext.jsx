import { createContext, useContext, useState, useEffect } from "react";
import { projects as seedProjects } from "../data/dummy";

export const ProjectsContext = createContext();

const STORAGE_KEY = "guc_projects";

/** Drop legacy PDF report fields; keep text-only `reportDescription` (may be empty until user edits). */
function normalizeStoredProject(project) {
  if (!project || typeof project !== "object") return project;
  return {
    ...project,
    report: null,
    reportUrl: null,
    reportDescription:
      project.reportDescription == null ? "" : String(project.reportDescription).trim(),
  };
}

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : seedProjects;
    if (!Array.isArray(list)) return seedProjects.map(normalizeStoredProject);
    return list.map(normalizeStoredProject);
  } catch {
    return seedProjects.map(normalizeStoredProject);
  }
}

function saveProjects(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function ProjectsProvider({ children }) {
  const [projectList, setProjectList] = useState(loadProjects);

  // Persist every change
  useEffect(() => {
    saveProjects(projectList);
  }, [projectList]);

  const addProject = (project) =>
    setProjectList((prev) => [project, ...prev]);

  const updateProject = (id, changes) =>
    setProjectList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );

  const deleteProject = (id) =>
    setProjectList((prev) => prev.filter((p) => p.id !== id));

  const toggleVisibility = (id) =>
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, visibility: p.visibility === "public" ? "private" : "public" }
          : p
      )
    );

  return (
    <ProjectsContext.Provider
      value={{ projectList, addProject, updateProject, deleteProject, toggleVisibility }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectsContext);
}
