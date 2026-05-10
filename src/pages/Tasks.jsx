import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, Button, Card, Input, Modal, PageHeader } from "../components/ui";
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
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Tasks assigned to you, grouped by project."
      />

      <div className="flex flex-col gap-5">
        {user?.role === "student" && ownedProjects.length > 0 && createTargetProject && (
          <Card className="border-accent-gold/20">
            <h3 className="font-display text-base text-text-primary mb-3">Create task</h3>
            <p className="text-text-secondary text-sm font-sans mb-4">
              Choose one of your projects, fill in the task, and assign it to a collaborator when available.
            </p>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-sm text-text-secondary font-sans">Project you own</label>
              <select
                value={createForProjectId ?? ""}
                onChange={(e) => {
                  setCreateForProjectId(Number(e.target.value));
                  setTaskError("");
                }}
                className="bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
              >
                {ownedProjects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Task name" value={taskForm.title} onChange={(e) => handleTaskField("title", e.target.value)} />
              <Input label="Deadline" type="date" value={taskForm.deadline} onChange={(e) => handleTaskField("deadline", e.target.value)} />
              <Input label="Description" value={taskForm.description} onChange={(e) => handleTaskField("description", e.target.value)} className="sm:col-span-2" />
              {createTargetProject.courseCode !== "BP" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary font-sans">Assign to</label>
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => handleTaskField("assignee", e.target.value)}
                    className="bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                  >
                    <option value="">Select collaborator</option>
                    {projectCollaborators(createTargetProject).map((collaborator) => (
                      <option key={collaborator} value={collaborator}>{collaborator}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-sans">Initial status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => handleTaskField("status", e.target.value)}
                  className="bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                >
                  <option value="pending">pending</option>
                  <option value="postponed">postponed</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            </div>
            {taskError && <p className="mt-3 text-danger text-xs font-sans">{taskError}</p>}
            <div className="mt-4">
              <Button size="sm" variant="gold" onClick={() => createTask(createTargetProject)}>Create task</Button>
            </div>
          </Card>
        )}

        {taskProjects.length > 0 ? taskProjects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          const canManage = project.owner === user?.name;
          const collaborators = projectCollaborators(project);
          const tasks = visibleTasks(project, user);

          return (
            <Card
              key={project.id}
              className={isSelected ? "border-accent-gold shadow-lg shadow-accent-gold/10" : ""}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg text-text-primary">{project.title}</h2>
                    <Badge variant="blue">{project.courseCode}</Badge>
                    {isSelected && <Badge variant="gold">Selected</Badge>}
                  </div>
                  <p className="text-text-secondary text-sm font-sans mt-1">{project.course}</p>
                </div>
                <Badge variant="default">{tasks.length} task{tasks.length === 1 ? "" : "s"}</Badge>
              </div>

              {tasks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {tasks.map((task) => {
                    const taskIndex = (project.tasks || []).findIndex((item) => item.id === task.id);
                    const assigneeCanSetStatus = canChangeTaskStatus(project, task, user);
                    return (
                      <div key={task.id} className="rounded-lg border border-border bg-bg-elevated px-4 py-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-text-primary text-sm font-sans">{task.title}</p>
                            <p className="text-text-secondary text-xs font-mono">Assigned to {task.assignee || project.owner} - deadline {task.deadline || "not set"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-md border border-success/40 bg-success/10 text-success disabled:opacity-40"
                                  disabled={taskIndex <= 0}
                                  onClick={() => moveTask(project, task.id, -1)}
                                  aria-label="Move task up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-md border border-danger/40 bg-danger/10 text-danger disabled:opacity-40"
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input label="Name" value={task.title} onChange={(e) => updateTaskField(project, task.id, "title", e.target.value)} />
                            <Input label="Deadline" type="date" value={task.deadline} onChange={(e) => updateTaskField(project, task.id, "deadline", e.target.value)} />
                            <Input label="Description" value={task.description} onChange={(e) => updateTaskField(project, task.id, "description", e.target.value)} className="sm:col-span-2" />
                            {project.courseCode !== "BP" && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-text-secondary font-sans">Assignee</label>
                                <select
                                  value={task.assignee}
                                  onChange={(e) => updateTaskField(project, task.id, "assignee", e.target.value)}
                                  className="bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                                >
                                  <option value="">Unassigned</option>
                                  {collaborators.map((collaborator) => (
                                    <option key={collaborator} value={collaborator}>{collaborator}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm text-text-secondary font-sans">Status</label>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(project, task.id, e.target.value)}
                                className="bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                              >
                                <option value="pending">pending</option>
                                <option value="postponed">postponed</option>
                                <option value="completed">completed</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex justify-end">
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
                            <p className="text-text-secondary text-sm font-sans">{task.description}</p>
                            {assigneeCanSetStatus && (
                              <div className="flex flex-col gap-1.5 max-w-xs">
                                <label className="text-sm text-text-secondary font-sans">Your status</label>
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(project, task.id, e.target.value)}
                                  className="bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
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
                <p className="text-text-secondary text-sm font-sans">No tasks assigned to you in this project.</p>
              )}
            </Card>
          );
        }) : (
          <Card>
            <p className="text-text-secondary text-sm font-sans">No assigned tasks yet.</p>
          </Card>
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
