import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, Button, Input, Modal, PageHeader } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";

const blankTaskForm = () => ({
  title: "",
  description: "",
  assignee: "",
  status: "pending",
  deadline: "",
});

const taskStatusVariant = {
  pending: "warning",
  postponed: "default",
  completed: "success",
};

function canSeeProjectTasks(project, user) {
  if (!user?.name) return false;
  if (project.owner === user.name) return true;
  if ((project.team || []).includes(user.name)) return true;
  return (project.tasks || []).some((task) => task.assignee === user.name);
}

function visibleTasks(project, user) {
  if (project.owner === user?.name) return project.tasks || [];
  return (project.tasks || []).filter((task) => task.assignee === user?.name);
}

function canChangeTaskStatus(project, task, user) {
  if (project.owner === user?.name) return true;
  return Boolean(task.assignee && task.assignee === user?.name);
}

export default function Tasks() {
  const { user } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
  const [searchParams] = useSearchParams();
  const selectedProjectId = Number(searchParams.get("projectId") || 0);
  const [taskForm, setTaskForm] = useState(blankTaskForm());
  const [taskError, setTaskError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

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
      const preferred = selectedProjectId && ownedProjects.some((project) => project.id === selectedProjectId)
        ? selectedProjectId
        : ownedProjects[0].id;
      return preferred;
    });
  }, [ownedProjects, selectedProjectId]);

  const createTargetProject = ownedProjects.find((project) => project.id === createForProjectId) || null;

  const taskProjects = useMemo(() => {
    const visible = projectList
      .filter((project) => canSeeProjectTasks(project, user))
      .map((project) => ({ ...project, visibleTasks: visibleTasks(project, user) }))
      .filter((project) => project.owner === user?.name || project.visibleTasks.length > 0);

    if (!selectedProjectId) return visible;
    return [
      ...visible.filter((project) => project.id === selectedProjectId),
      ...visible.filter((project) => project.id !== selectedProjectId),
    ];
  }, [projectList, selectedProjectId, user]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      ),
    });
  };

  const updateTaskStatus = (project, taskId, status) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    });
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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 pb-6 border-b border-border/60">
        <PageHeader
          title="Tasks"
          subtitle="Work organized by project — create assignments, track deadlines, and update status in one place."
        />
      </div>

      <div className="flex flex-col gap-8">
        {user?.role === "student" && ownedProjects.length > 0 && createTargetProject && (
          <section className="rounded-2xl border border-accent-gold/25 bg-gradient-to-br from-accent-gold/[0.06] via-bg-surface to-bg-base p-1 shadow-lg shadow-black/5">
            <div className="rounded-[0.9rem] bg-bg-surface/95 border border-border/50 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent-gold mb-2">New assignment</p>
                  <h3 className="font-display text-xl text-text-primary tracking-tight">Create task</h3>
                  <p className="text-text-secondary text-sm font-sans mt-2 max-w-xl leading-relaxed">
                    Choose one of your projects, define the work, and assign collaborators when the course allows team distribution.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Project you own</label>
                <select
                  value={createForProjectId ?? ""}
                  onChange={(e) => {
                    setCreateForProjectId(Number(e.target.value));
                    setTaskError("");
                  }}
                  className="max-w-md bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary text-sm font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold"
                >
                  {ownedProjects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <Input label="Task name" value={taskForm.title} onChange={(e) => handleTaskField("title", e.target.value)} />
                <Input label="Deadline" type="date" value={taskForm.deadline} onChange={(e) => handleTaskField("deadline", e.target.value)} />
                <Input label="Description" value={taskForm.description} onChange={(e) => handleTaskField("description", e.target.value)} className="sm:col-span-2" />
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
                        <option key={collaborator} value={collaborator}>{collaborator}</option>
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
                    <option value="pending">pending</option>
                    <option value="postponed">postponed</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              </div>
              {taskError && <p className="mt-4 text-danger text-xs font-sans">{taskError}</p>}
              <div className="mt-6 pt-6 border-t border-border/60 flex justify-end">
                <Button size="sm" variant="gold" onClick={() => createTask(createTargetProject)}>Create task</Button>
              </div>
            </div>
          </section>
        )}

        {taskProjects.length > 0 ? taskProjects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          const canManage = project.owner === user?.name;
          const collaborators = projectCollaborators(project);
          const tasks = visibleTasks(project, user);

          return (
            <section
              key={project.id}
              className={`rounded-2xl border bg-bg-surface/40 overflow-hidden transition-shadow ${
                isSelected
                  ? "border-accent-gold/50 shadow-xl shadow-accent-gold/10 ring-1 ring-accent-gold/20"
                  : "border-border/80 shadow-md shadow-black/5 hover:border-border"
              }`}
            >
              <div className="px-6 sm:px-8 py-6 border-b border-border/60 bg-gradient-to-r from-bg-elevated/30 to-transparent flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2 className="font-display text-xl text-text-primary tracking-tight">{project.title}</h2>
                    <Badge variant="blue">{project.courseCode}</Badge>
                    {isSelected && <Badge variant="gold">Selected</Badge>}
                  </div>
                  <p className="text-text-secondary text-sm font-sans">{project.course}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Queue</span>
                  <span className="font-display text-2xl text-text-primary tabular-nums leading-none">{tasks.length}</span>
                  <span className="text-xs text-text-secondary font-sans">visible task{tasks.length === 1 ? "" : "s"}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
              {tasks.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {tasks.map((task) => {
                    const taskIndex = (project.tasks || []).findIndex((item) => item.id === task.id);
                    const assigneeCanSetStatus = canChangeTaskStatus(project, task, user);
                    const statusAccent =
                      task.status === "completed"
                        ? "border-success"
                        : task.status === "pending"
                          ? "border-warning"
                          : "border-border";
                    return (
                      <div
                        key={task.id}
                        className={`group rounded-xl border border-border/80 bg-bg-elevated/40 pl-4 pr-5 py-5 border-l-4 ${statusAccent} hover:bg-bg-elevated/70 transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <p className="text-text-primary text-sm font-semibold font-sans tracking-tight">{task.title}</p>
                            <p className="text-text-secondary text-xs font-mono mt-1.5">
                              {task.assignee || project.owner}
                              <span className="text-text-secondary/60 mx-2">·</span>
                              Due {task.deadline || "not set"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-lg border border-success/35 bg-success/10 text-success text-sm disabled:opacity-35 hover:bg-success/15 transition-colors"
                                  disabled={taskIndex <= 0}
                                  onClick={() => moveTask(project, task.id, -1)}
                                  aria-label="Move task up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-lg border border-danger/35 bg-danger/10 text-danger text-sm disabled:opacity-35 hover:bg-danger/15 transition-colors"
                                  disabled={taskIndex < 0 || taskIndex >= (project.tasks || []).length - 1}
                                  onClick={() => moveTask(project, task.id, 1)}
                                  aria-label="Move task down"
                                >
                                  ↓
                                </button>
                              </>
                            )}
                            <Badge variant={taskStatusVariant[task.status] || "default"}>{task.status}</Badge>
                          </div>
                        </div>

                        {canManage ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input label="Name" value={task.title} onChange={(e) => updateTaskField(project, task.id, "title", e.target.value)} />
                            <Input label="Deadline" type="date" value={task.deadline} onChange={(e) => updateTaskField(project, task.id, "deadline", e.target.value)} />
                            <Input label="Description" value={task.description} onChange={(e) => updateTaskField(project, task.id, "description", e.target.value)} className="sm:col-span-2" />
                            {project.courseCode !== "BP" && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Assignee</label>
                                <select
                                  value={task.assignee}
                                  onChange={(e) => updateTaskField(project, task.id, "assignee", e.target.value)}
                                  className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                                >
                                  <option value="">Unassigned</option>
                                  {collaborators.map((collaborator) => (
                                    <option key={collaborator} value={collaborator}>{collaborator}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Status</label>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(project, task.id, e.target.value)}
                                className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                              >
                                <option value="pending">pending</option>
                                <option value="postponed">postponed</option>
                                <option value="completed">completed</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex justify-end pt-1">
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setConfirmAction({
                                  title: "Remove Task",
                                  message: `Are you sure you want to remove "${task.title}"?`,
                                  onConfirm: () => removeTask(project, task.id),
                                })}
                              >
                                Remove Task
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <p className="text-text-secondary text-sm font-sans leading-relaxed">{task.description}</p>
                            {assigneeCanSetStatus && (
                              <div className="flex flex-col gap-1.5 max-w-xs">
                                <label className="text-xs font-mono uppercase tracking-wider text-text-secondary">Your status</label>
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(project, task.id, e.target.value)}
                                  className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                                >
                                  <option value="pending">pending</option>
                                  <option value="postponed">postponed</option>
                                  <option value="completed">completed</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-secondary text-sm font-sans py-6 text-center border border-dashed border-border rounded-xl bg-bg-base/30">
                  No tasks assigned to you in this project.
                </p>
              )}
              </div>
            </section>
          );
        }) : (
          <div className="rounded-2xl border border-border/80 bg-bg-elevated/20 px-8 py-14 text-center">
            <p className="text-text-secondary text-sm font-sans max-w-md mx-auto leading-relaxed">
              No assigned tasks yet. When projects you own or collaborate on include tasks for you, they will appear here.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title || "Confirm Action"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">{confirmAction?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmAction?.onConfirm?.()}>Remove</Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{toast}</p>
            <button type="button" className="text-success text-xs font-semibold" onClick={() => setToast("")}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}
