import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, Button, Input, Modal, Toast } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";
import { UserProfileLink } from "../components/UserProfileLink";
import { ProjectTitleLink } from "../components/ProjectTitleLink";

const blankTaskForm = () => ({
  title: "",
  description: "",
  assignee: "",
  status: "pending",
  deadline: "",
});

const taskStatusVariant = {
  pending: "warning",
  postponed: "danger",
  completed: "success",
};

function formatUsDate(dateStr) {
  if (!dateStr) return "—";
  const parts = dateStr.includes("-") ? dateStr.slice(0, 10).split("-") : null;
  if (!parts || parts.length < 3) return dateStr;
  const [y, m, d] = parts;
  return `${m}/${d}/${y}`;
}

function initials(name) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function priorityLabel(project, taskId) {
  const tasks = project.tasks || [];
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return "Medium";
  if (tasks.length <= 1) return "High";
  if (idx === 0) return "High";
  if (idx === tasks.length - 1) return "Low";
  return "Medium";
}

function canSeeProjectTasks(project, user) {
  if (!user?.name) return false;
  if (project.owner === user.name) return true;
  if ((project.team || []).includes(user.name)) return true;
  return (project.tasks || []).some((task) => task.assignee === user.name);
}

function visibleTasks(project, user) {
  if (project.owner === user?.name) return [...(project.tasks || [])];
  return (project.tasks || []).filter((task) => task.assignee === user?.name);
}

function taskExpandedKey(projectId, taskId) {
  return `${projectId}:${taskId}`;
}

export default function Tasks() {
  const { user } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedProjectId = Number(searchParams.get("projectId") || 0);
  const focusCreate = searchParams.get("focus") === "create";

  const [taskForm, setTaskForm] = useState(blankTaskForm());
  const [taskError, setTaskError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);

  const ownedProjects = useMemo(
    () => projectList.filter((project) => project.owner === user?.name),
    [projectList, user?.name]
  );

  const [createForProjectId, setCreateForProjectId] = useState(null);

  useEffect(() => {
    if (!ownedProjects.length) {
      setCreateForProjectId(null);
      return;
    }
    setCreateForProjectId((previous) => {
      if (previous && ownedProjects.some((project) => project.id === previous)) return previous;
      const preferred =
        selectedProjectId && ownedProjects.some((project) => project.id === selectedProjectId)
          ? selectedProjectId
          : ownedProjects[0].id;
      return preferred;
    });
  }, [ownedProjects, selectedProjectId]);

  useEffect(() => {
    if (!focusCreate || !selectedProjectId) return;
    setCreateForProjectId(selectedProjectId);
    const t = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [focusCreate, selectedProjectId]);

  const createTargetProject = ownedProjects.find((project) => project.id === createForProjectId) || null;

  const taskProjects = useMemo(() => {
    const visible = projectList
      .filter((project) => canSeeProjectTasks(project, user))
      .map((project) => ({ ...project, visibleTasks: visibleTasks(project, user) }))
      .filter((project) => (project.tasks || []).length > 0)
      .filter((project) => project.owner === user?.name || project.visibleTasks.length > 0);

    if (!selectedProjectId) return visible;
    return [
      ...visible.filter((project) => project.id === selectedProjectId),
      ...visible.filter((project) => project.id !== selectedProjectId),
    ];
  }, [projectList, selectedProjectId, user]);

  const handleTaskField = (field, value) => {
    setTaskForm((previous) => ({ ...previous, [field]: value }));
    if (taskError) setTaskError("");
  };

  const projectCollaborators = (project) =>
    project.courseCode === "BP" ? [] : (project.team || []).filter((member) => member !== project.owner);

  const updateTasks = (project, tasks, message) => {
    updateProject(project.id, { tasks });
    if (message) setToast(message);
  };

  const createTask = (project) => {
    if (!project || project.owner !== user?.name) return;
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.deadline) {
      setTaskError("Add a title, short description, and deadline.");
      return;
    }
    if (project.courseCode !== "BP" && !taskForm.assignee) {
      setTaskError("Assign the task to a collaborator.");
      return;
    }

    const nextTaskId = Math.max(0, ...(project.tasks || []).map((task) => Number(task.id) || 0)) + 1;
    updateTasks(
      project,
      [
        ...(project.tasks || []),
        {
          id: nextTaskId,
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          assignee: project.courseCode === "BP" ? project.owner : taskForm.assignee,
          status: taskForm.status,
          deadline: taskForm.deadline,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
      "Task created successfully."
    );
    setTaskForm(blankTaskForm());
    setTaskError("");
  };

  const updateTaskField = (project, taskId, field, value) => {
    if (project.owner !== user?.name) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) => (task.id === taskId ? { ...task, [field]: value } : task)),
    });
  };

  const updateTaskStatus = (project, taskId, status) => {
    if (project.owner !== user?.name) return;
    const task = (project.tasks || []).find((t) => t.id === taskId);
    if (!task) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).map((t) => (t.id === taskId ? { ...t, status } : t)),
    });
    setToast("Status updated.");
  };

  const moveTask = (project, taskId, direction) => {
    if (project.owner !== user?.name) return;
    const tasks = [...(project.tasks || [])];
    const index = tasks.findIndex((task) => task.id === taskId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= tasks.length) return;
    [tasks[index], tasks[nextIndex]] = [tasks[nextIndex], tasks[index]];
    updateTasks(project, tasks, "Task order updated successfully.");
  };

  const removeTask = (project, taskId) => {
    if (project.owner !== user?.name) return;
    updateTasks(
      project,
      (project.tasks || []).filter((task) => task.id !== taskId),
      "Task removed successfully."
    );
    setConfirmAction(null);
  };

  const toggleExpanded = (projectId, taskId) => {
    const key = taskExpandedKey(projectId, taskId);
    setExpandedKey((k) => (k === key ? null : key));
  };

  const goCreateForProject = (projectId) => {
    navigate(`/tasks?projectId=${projectId}&focus=create`);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  return (
    <div id="tasks-page-top" className="mx-auto max-w-5xl">
      <div className="mb-10 pb-7 border-b border-border/60">
        <h1 className="font-display text-3xl sm:text-4xl text-text-primary mb-2 tracking-tight">Tasks</h1>
        <p className="text-text-secondary text-base sm:text-lg font-sans leading-relaxed max-w-3xl">
          Work organized by project — use the dashboard to review assignments, adjust priority with arrows, and open details
          without losing your place.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {user?.role === "student" && ownedProjects.length > 0 && createTargetProject && (
          <section
            id="task-create-anchor"
            className="rounded-2xl border border-accent-gold/25 bg-gradient-to-br from-accent-gold/[0.06] via-bg-surface to-bg-base p-1 shadow-lg shadow-black/5 scroll-mt-8"
          >
            <div className="rounded-[0.9rem] bg-bg-surface/95 border border-border/50 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent-gold mb-2">New assignment</p>
                  <h3 className="font-display text-[1.75rem] sm:text-[2rem] text-text-primary tracking-tight">Create task</h3>
                  <p className="text-text-secondary text-base font-sans mt-3 max-w-xl leading-relaxed">
                    Choose one of your projects, define the work, and assign collaborators when the course allows team
                    distribution.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-sm font-mono uppercase tracking-wider text-text-secondary">Project you own</label>
                <select
                  value={createForProjectId ?? ""}
                  onChange={(e) => {
                    setCreateForProjectId(Number(e.target.value));
                    setTaskError("");
                  }}
                  className="max-w-md bg-bg-elevated border border-border rounded-xl px-4 py-3.5 text-text-primary text-base font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold"
                >
                  {ownedProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <Input label="Task name" value={taskForm.title} onChange={(e) => handleTaskField("title", e.target.value)} />
                <Input label="Deadline" type="date" value={taskForm.deadline} onChange={(e) => handleTaskField("deadline", e.target.value)} />
                <Input
                  label="Description"
                  value={taskForm.description}
                  onChange={(e) => handleTaskField("description", e.target.value)}
                  className="sm:col-span-2"
                />
                {createTargetProject.courseCode !== "BP" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Assign to</label>
                    <select
                      value={taskForm.assignee}
                      onChange={(e) => handleTaskField("assignee", e.target.value)}
                      className="bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent-blue/25 focus:border-accent-blue"
                    >
                      <option value="">Select collaborator</option>
                      {projectCollaborators(createTargetProject).map((collaborator) => (
                        <option key={collaborator} value={collaborator}>
                          {collaborator}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Initial status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => handleTaskField("status", e.target.value)}
                    className="bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent-blue/25 focus:border-accent-blue"
                  >
                    <option value="completed">completed</option>
                    <option value="postponed">postponed</option>
                    <option value="pending">pending</option>
                  </select>
                </div>
              </div>
              {taskError && <p className="mt-4 text-danger text-sm font-sans">{taskError}</p>}
              <div className="mt-6 pt-6 border-t border-border/60 flex justify-end">
                <Button size="sm" variant="gold" onClick={() => createTask(createTargetProject)}>
                  Create task
                </Button>
              </div>
            </div>
          </section>
        )}

        {taskProjects.length > 0 ? (
          taskProjects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const canManage = project.owner === user?.name;
            const collaborators = projectCollaborators(project);
            const tasks = visibleTasks(project, user);
            const allTasks = project.tasks || [];
            const completedCount = allTasks.filter((t) => t.status === "completed").length;
            const pendingCount = allTasks.filter((t) => t.status === "pending").length;
            const postponedCount = allTasks.filter((t) => t.status === "postponed").length;

            return (
              <section
                key={project.id}
                className={`rounded-2xl border bg-bg-surface/35 overflow-hidden transition-shadow ${
                  isSelected
                    ? "border-accent-gold/50 shadow-xl shadow-accent-gold/10 ring-1 ring-accent-gold/20"
                    : "border-border/80 shadow-md shadow-black/5 hover:border-border"
                }`}
              >
                <div className="px-6 sm:px-8 py-8 border-b border-border/60 bg-gradient-to-r from-bg-elevated/35 to-transparent flex flex-wrap items-start justify-between gap-5">
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs font-mono uppercase tracking-[0.22em] text-text-muted">GUC PORTAL · TASKS</p>
                    <h2 className="font-display text-2xl sm:text-[1.85rem] tracking-tight leading-tight">
                      <span className="text-accent-gold">Task dashboard: </span>
                      <ProjectTitleLink
                        project={project}
                        className="font-display text-2xl sm:text-[1.85rem] text-text-primary tracking-tight leading-tight"
                        navState={{ activeNav: "/tasks" }}
                        stopPropagation={false}
                      />
                    </h2>
                    <p className="text-text-secondary text-base sm:text-[1.05rem] font-sans leading-snug">
                      {project.course} · Creator {project.owner}
                      <span className="text-text-muted mx-2">·</span>
                      <span className="font-mono text-sm text-text-muted">{project.courseCode}</span>
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 w-full max-w-4xl">
                      <div className="rounded-2xl border border-accent-gold/30 bg-bg-elevated/50 px-5 py-5 shadow-md min-h-[118px] flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-xs font-mono uppercase tracking-[0.12em] text-text-secondary leading-snug">
                            Total tasks
                          </span>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-gold/18 text-lg" aria-hidden>📋</span>
                        </div>
                        <p className="font-display text-4xl text-accent-gold tabular-nums leading-none">{allTasks.length}</p>
                      </div>
                      <div className="rounded-2xl border border-success/30 bg-bg-elevated/50 px-5 py-5 shadow-md min-h-[118px] flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-xs font-mono uppercase tracking-[0.12em] text-text-secondary leading-snug">Completed</span>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/18 text-success text-lg font-bold" aria-hidden>✓</span>
                        </div>
                        <p className="font-display text-4xl text-success tabular-nums leading-none">{completedCount}</p>
                      </div>
                      <div className="rounded-2xl border border-warning/30 bg-bg-elevated/50 px-5 py-5 shadow-md min-h-[118px] flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-xs font-mono uppercase tracking-[0.12em] text-text-secondary leading-snug">Pending</span>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/18 text-warning text-xl" aria-hidden>◷</span>
                        </div>
                        <p className="font-display text-4xl text-warning tabular-nums leading-none">{pendingCount}</p>
                      </div>
                      <div className="rounded-2xl border border-danger/30 bg-bg-elevated/50 px-5 py-5 shadow-md min-h-[118px] flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-xs font-mono uppercase tracking-[0.12em] text-text-secondary leading-snug">Postponed</span>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/18 text-danger text-lg" aria-hidden>⏸</span>
                        </div>
                        <p className="font-display text-4xl text-danger tabular-nums leading-none">{postponedCount}</p>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <Button
                      variant="gold"
                      size="sm"
                      className="shrink-0 px-5 py-2.5 text-sm font-semibold"
                      onClick={() => goCreateForProject(project.id)}
                    >
                      + Add New Task
                    </Button>
                  )}
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  {tasks.length > 0 ? (
                    <div className="rounded-xl border border-accent-gold/20 bg-bg-base/40 overflow-hidden shadow-inner shadow-black/20">
                      <div className="overflow-x-auto">
                        <div
                          className="min-w-[52rem] grid gap-4 items-center px-5 py-3.5 text-xs font-mono uppercase tracking-[0.15em] text-text-muted bg-bg-elevated/60 border-b border-border/70"
                          style={{
                            gridTemplateColumns: "2.5rem minmax(0,1fr) 10.5rem 6.25rem 5.75rem 9rem",
                          }}
                        >
                          <span className="text-center sr-only">Select</span>
                          <span>Task</span>
                          <span>Status</span>
                          <span>Deadline</span>
                          <span className="text-center">Priority</span>
                          <span className="text-right pr-1">Details</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        {tasks.map((task) => {
                          const taskIndex = allTasks.findIndex((item) => item.id === task.id);
                          const isOpen = expandedKey === taskExpandedKey(project.id, task.id);
                          const pri = priorityLabel(project, task.id);

                          return (
                            <div
                              key={task.id}
                              className={`border-b border-border/60 last:border-b-0 ${
                                isOpen ? "bg-bg-elevated/25 ring-1 ring-inset ring-accent-gold/35" : ""
                              }`}
                            >
                              <div className="overflow-x-auto">
                                <div
                                  className="min-w-[52rem] grid gap-4 items-center px-5 py-4"
                                  style={{
                                    gridTemplateColumns: "2.5rem minmax(0,1fr) 10.5rem 6.25rem 5.75rem 9rem",
                                  }}
                                >
                                  <div className="flex justify-center">
                                    <input
                                      type="checkbox"
                                      readOnly
                                      tabIndex={-1}
                                      className="h-4 w-4 rounded border-border bg-bg-elevated text-accent-gold opacity-70"
                                      aria-label="Task row (visual only)"
                                    />
                                  </div>
                                  <p className="text-text-primary text-base font-sans font-semibold truncate min-w-0">{task.title}</p>
                                  <div className="min-w-0">
                                    {canManage ? (
                                      <select
                                        value={task.status}
                                        onChange={(e) => updateTaskStatus(project, task.id, e.target.value)}
                                        aria-label={`Status for ${task.title}`}
                                        className="w-full max-w-[10.25rem] rounded-lg border border-accent-gold/35 bg-bg-elevated py-2.5 pl-3 pr-8 text-sm font-sans capitalize text-text-primary shadow-sm focus:border-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/25"
                                      >
                                        <option value="completed">completed</option>
                                        <option value="postponed">postponed</option>
                                        <option value="pending">pending</option>
                                      </select>
                                    ) : (
                                      <Badge variant={taskStatusVariant[task.status] || "default"} className="!font-mono !text-[11px] !uppercase !tracking-wide">
                                        {task.status}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-mono text-text-secondary tabular-nums whitespace-nowrap">
                                    {formatUsDate(task.deadline)}
                                  </p>
                                  <div className="flex justify-center">
                                    {canManage ? (
                                      <div className="flex flex-row gap-1 items-center">
                                        <button
                                          type="button"
                                          className="flex h-8 w-8 items-center justify-center rounded-md border border-success/45 bg-success/20 text-success text-sm font-semibold hover:bg-success/30 disabled:opacity-30 transition-colors"
                                          disabled={taskIndex <= 0}
                                          onClick={() => moveTask(project, task.id, -1)}
                                          aria-label="Increase priority (move up)"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          className="flex h-8 w-8 items-center justify-center rounded-md border border-danger/45 bg-danger/20 text-danger text-sm font-semibold hover:bg-danger/30 disabled:opacity-30 transition-colors"
                                          disabled={taskIndex < 0 || taskIndex >= allTasks.length - 1}
                                          onClick={() => moveTask(project, task.id, 1)}
                                          aria-label="Lower priority (move down)"
                                        >
                                          ↓
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-text-muted font-mono text-center w-[4.25rem]">—</span>
                                    )}
                                  </div>
                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="gold"
                                      className="w-[9rem] shrink-0 justify-center px-3 text-sm font-sans py-2.5"
                                      onClick={() => toggleExpanded(project.id, task.id)}
                                    >
                                      {isOpen ? "Hide details" : "View"}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {isOpen && (
                                <div className="px-3 sm:px-4 pb-4 pt-0 sm:pt-1 border-t border-border/40 border-dashed">
                                  <div className="rounded-lg border border-border/80 bg-bg-elevated/50 p-4 mt-2">
                                    <p className="text-text-secondary text-base font-sans leading-snug line-clamp-2">
                                      {task.description || "No description provided."}
                                    </p>

                                    <div className="mt-4 rounded-lg border border-border/70 bg-bg-base/40 px-3 py-3">
                                      <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold block mb-2">
                                        Assignee
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {(() => {
                                          const assigneeName =
                                            project.courseCode === "BP"
                                              ? project.owner
                                              : task.assignee || null;
                                          if (!assigneeName && project.courseCode !== "BP") {
                                            return (
                                              <span className="text-xs text-text-muted font-sans">Unassigned — set in owner edit tools below.</span>
                                            );
                                          }
                                          const name = assigneeName || project.owner;
                                          return (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-accent-gold/35 bg-bg-surface/85 pl-1 pr-3 py-1 text-xs text-text-primary font-sans">
                                              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-gold/40 bg-accent-gold/10 text-[11px] font-semibold text-accent-gold">
                                                {initials(name)}
                                              </span>
                                              <UserProfileLink ownerName={name} className="text-text-primary">
                                                {name}
                                              </UserProfileLink>
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                      <div className="flex flex-wrap items-center gap-3 text-sm font-sans">
                                        <span
                                          className={
                                            task.status === "completed"
                                              ? "text-success font-medium font-mono text-xs uppercase tracking-wide"
                                              : task.status === "pending"
                                                ? "text-warning font-medium font-mono text-xs uppercase tracking-wide"
                                                : "text-danger font-medium font-mono text-xs uppercase tracking-wide"
                                          }
                                        >
                                          {String(task.status)}
                                        </span>
                                        <span className="text-text-muted">·</span>
                                        <span className="text-text-secondary">Due {formatUsDate(task.deadline)}</span>
                                      </div>
                                      {canManage && (
                                        <p className="text-[11px] text-text-muted font-sans max-w-xs text-right">
                                          Use arrows to adjust (current priority level: {pri})
                                        </p>
                                      )}
                                    </div>

                                    {canManage && (
                                      <div className="mt-5 pt-5 border-t border-border/60 space-y-4">
                                        <p className="text-[10px] font-mono uppercase tracking-wider text-accent-gold/90">Edit task (owner)</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <Input
                                            label="Name"
                                            value={task.title}
                                            onChange={(e) => updateTaskField(project, task.id, "title", e.target.value)}
                                          />
                                          <Input
                                            label="Deadline"
                                            type="date"
                                            value={task.deadline}
                                            onChange={(e) => updateTaskField(project, task.id, "deadline", e.target.value)}
                                          />
                                          <Input
                                            label="Description"
                                            value={task.description}
                                            onChange={(e) => updateTaskField(project, task.id, "description", e.target.value)}
                                            className="sm:col-span-2"
                                          />
                                          {project.courseCode !== "BP" && (
                                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                              <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Assignee</label>
                                              <select
                                                value={task.assignee}
                                                onChange={(e) => updateTaskField(project, task.id, "assignee", e.target.value)}
                                                className="bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue max-w-md"
                                              >
                                                <option value="">Unassigned</option>
                                                {collaborators.map((c) => (
                                                  <option key={c} value={c}>
                                                    {c}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex justify-end">
                                          <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() =>
                                              setConfirmAction({
                                                title: "Remove Task",
                                                message: `Are you sure you want to remove "${task.title}"?`,
                                                onConfirm: () => removeTask(project, task.id),
                                              })
                                            }
                                          >
                                            Remove task
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm font-sans py-8 text-center border border-dashed border-border rounded-xl bg-bg-base/25">
                      No tasks assigned to you in this project.
                    </p>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className="rounded-2xl border border-border/80 bg-bg-elevated/20 px-8 py-14 text-center">
            <p className="text-text-secondary text-sm font-sans max-w-md mx-auto leading-relaxed">
              No assigned tasks yet. When projects you own or collaborate on include tasks for you, they will appear here.
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} title={confirmAction?.title || "Confirm Action"}>
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">{confirmAction?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => confirmAction?.onConfirm?.()}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast("")} durationMs={4000} variant="success" />
    </div>
  );
}
