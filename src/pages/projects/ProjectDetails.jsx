import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, Modal, PageHeader, Stars } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";

const taskStatusVariant = {
  pending: "warning",
  postponed: "default",
  completed: "success",
};

function canChangeTaskStatus(project, task, user) {
  if (project.owner === user?.name) return true;
  if (task.assignee && task.assignee === user?.name) return true;

  return (project.collaboratorInvitations || []).some((invite) =>
    invite.status === "accepted" &&
    invite.collaboratorName === task.assignee &&
    (invite.email === user?.email || invite.collaboratorName === user?.name)
  );
}

function canViewInstructorFeedback(project, user) {
  if (!user?.name) return false;
  if (project.owner === user.name) return true;
  if ((project.team || []).includes(user.name)) return true;
  if (user.role === "instructor" && project.supervisor === user.name) return true;

  const acceptedCollaborator = (project.collaboratorInvitations || []).some((invite) =>
    invite.status === "accepted" &&
    (invite.email === user.email || invite.collaboratorName === user.name)
  );
  const acceptedInstructor = (project.instructorInvitations || []).some((invite) =>
    invite.status === "accepted" &&
    (invite.email === user.email || invite.instructorName === user.name)
  );

  return acceptedCollaborator || acceptedInstructor;
}

function ReadmeSection({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xl text-text-primary mb-3">{title}</h2>
      <div className="border-t border-border pt-4">{children}</div>
    </section>
  );
}

function getDocumentUrl(fileName) {
  return fileName ? `/documents/${encodeURIComponent(fileName)}` : "#";
}

function InteractiveStarRating({ value, onRate }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));

  return (
    <div className="min-w-64 rounded-lg border border-border bg-bg-elevated px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRate(star)}
              className={`text-2xl leading-none transition-colors ${star <= rating ? "text-accent-gold" : "text-border hover:text-text-secondary"}`}
              aria-label={`Rate ${star} of 5 stars`}
            >
              ★
            </button>
          ))}
        </div>
        <Badge variant="gold">{rating}/5</Badge>
      </div>
      <p className="text-text-secondary text-xs font-sans mt-2">Click a star to set and save the public rating.</p>
    </div>
  );
}

function buildFeedback(user, text) {
  return {
    id: Date.now(),
    author: user?.name,
    authorEmail: user?.email,
    text: text.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function FeedbackList({ feedback = [], onRemove, currentUser }) {
  if (!feedback.length) {
    return <p className="text-text-secondary text-sm font-sans">No feedback yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {feedback.map((item) => (
        <div key={item.id} className="rounded-md border border-border bg-bg-elevated px-3 py-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-text-primary text-sm font-sans">{item.text}</p>
              <p className="text-text-secondary text-xs font-mono mt-1">
                {item.author} - {item.createdAt}
              </p>
            </div>
            {item.authorEmail === currentUser?.email && (
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="danger" onClick={() => onRemove(item.id)}>Remove</Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { projectList, updateProject } = useProjects();
  const [projectFeedbackText, setProjectFeedbackText] = useState("");
  const [taskFeedbackText, setTaskFeedbackText] = useState({});
  const [thesisFeedbackText, setThesisFeedbackText] = useState({});
  const [ratingValue, setRatingValue] = useState("");
  const [toast, setToast] = useState("");
  const [confirmFeedback, setConfirmFeedback] = useState(null);
  const project = projectList.find((item) => item.id === Number(projectId));
  const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const activeNav = location.state?.activeNav || "/projects";
  const openPreview = () => navigate(`/projects/${project.id}/preview`, { state: { activeNav } });
  const openTasks = () => navigate(`/tasks?projectId=${project.id}`);
  const showToast = (message) => setToast(message);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateTaskStatus = (taskId, status) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    });
  };
  const isInstructor = user?.role === "instructor";

  const applyRating = (stars) => {
    const rating = Math.max(1, Math.min(5, Math.round(Number(stars) || 1)));
    updateProject(project.id, { rating });
    setRatingValue(String(rating));
    showToast("Rating saved successfully.");
  };

  const saveProjectFeedback = () => {
    if (!projectFeedbackText.trim()) return;
    updateProject(project.id, {
      feedback: [...(project.feedback || []), buildFeedback(user, projectFeedbackText)],
    });
    setProjectFeedbackText("");
    showToast("Project feedback submitted successfully.");
  };

  const removeProjectFeedback = (feedbackId) => {
    updateProject(project.id, {
      feedback: (project.feedback || []).filter((feedback) => feedback.id !== feedbackId),
    });
    setConfirmFeedback(null);
    showToast("Feedback removed successfully.");
  };

  const saveTaskFeedback = (taskId) => {
    const text = taskFeedbackText[taskId] || "";
    if (!text.trim()) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: [...(task.feedback || []), buildFeedback(user, text)] }
          : task
      ),
    });
    setTaskFeedbackText((previous) => ({ ...previous, [taskId]: "" }));
    showToast("Task feedback submitted successfully.");
  };

  const removeTaskFeedback = (taskId, feedbackId) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: (task.feedback || []).filter((feedback) => feedback.id !== feedbackId) }
          : task
      ),
    });
    setConfirmFeedback(null);
    showToast("Feedback removed successfully.");
  };

  const saveThesisFeedback = (draftId) => {
    const text = thesisFeedbackText[draftId] || "";
    if (!text.trim()) return;
    updateProject(project.id, {
      thesisDrafts: (project.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: [...(draft.feedback || []), buildFeedback(user, text)] }
          : draft
      ),
    });
    setThesisFeedbackText((previous) => ({ ...previous, [draftId]: "" }));
    showToast("Draft feedback submitted successfully.");
  };

  const removeThesisFeedback = (draftId, feedbackId) => {
    updateProject(project.id, {
      thesisDrafts: (project.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: (draft.feedback || []).filter((feedback) => feedback.id !== feedbackId) }
          : draft
      ),
    });
    setConfirmFeedback(null);
    showToast("Feedback removed successfully.");
  };

  const requestRemoveFeedback = (type, ids = {}) => {
    setConfirmFeedback({
      type,
      ...ids,
      message: "Are you sure you want to remove this feedback?",
    });
  };

  const confirmRemoveFeedback = () => {
    if (!confirmFeedback) return;
    if (confirmFeedback.type === "project") removeProjectFeedback(confirmFeedback.feedbackId);
    if (confirmFeedback.type === "task") removeTaskFeedback(confirmFeedback.taskId, confirmFeedback.feedbackId);
    if (confirmFeedback.type === "thesis") removeThesisFeedback(confirmFeedback.draftId, confirmFeedback.feedbackId);
  };

  if (!project) {
    return (
      <div>
        <PageHeader
          title="Project Not Found"
          subtitle="The selected project could not be found."
          action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
        />
        <Card>
          <p className="text-text-secondary font-sans">Please select another project from the projects page.</p>
        </Card>
      </div>
    );
  }

  const canViewFeedback = canViewInstructorFeedback(project, user);

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${project.course} - ${project.owner}`}
        action={
          <div className="flex items-center gap-3">
            <Button variant="gold" onClick={openTasks}>Tasks</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue">{project.courseCode}</Badge>
              <Badge variant={project.visibility === "public" ? "success" : "default"}>{project.visibility}</Badge>
              {project.languages.map((language) => (
                <Badge key={language}>{language}</Badge>
              ))}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Stars rating={project.rating} />
              <Badge variant="gold">{project.status}</Badge>
              {isInstructor && (
                <InteractiveStarRating
                  value={ratingValue || String(Math.round(project.rating || 0))}
                  onRate={applyRating}
                />
              )}
            </div>
          </div>

          <p className="text-text-secondary text-sm font-sans leading-6 mb-6">{project.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Owner</p>
              <p className="font-sans text-sm text-text-primary">{project.owner}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Course</p>
              <p className="font-sans text-sm text-text-primary">{project.course}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Supervisor</p>
              <p className="font-sans text-sm text-text-primary">{project.supervisor}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Created</p>
              <p className="font-sans text-sm text-text-primary">{project.createdAt}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Rating</p>
              <p className="font-sans text-sm text-text-primary">{project.rating}/5</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Team</p>
              <p className="font-sans text-sm text-text-primary">{project.team.join(", ")}</p>
            </div>
          </div>
        </Card>

        {canViewFeedback && (
        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-lg text-text-primary">Project Feedback</h2>
            <Badge variant="blue">{project.feedback?.length || 0}</Badge>
          </div>
          <FeedbackList
            feedback={project.feedback}
            currentUser={user}
            onRemove={(feedbackId) => requestRemoveFeedback("project", { feedbackId })}
          />
          {isInstructor && (
            <div className="mt-4 flex flex-col gap-3">
              <textarea
                value={projectFeedbackText}
                onChange={(e) => setProjectFeedbackText(e.target.value)}
                placeholder="Add project feedback"
                className="min-h-20 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue"
              />
              <div>
                <Button size="sm" variant="secondary" onClick={saveProjectFeedback}>Save Feedback</Button>
              </div>
            </div>
          )}
        </Card>
        )}

        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-lg text-text-primary">Tasks</h2>
            <Badge variant="blue">{project.tasks?.length || 0}</Badge>
          </div>
          {project.tasks?.length ? (
            <div className="flex flex-col divide-y divide-border">
              {project.tasks.map((task) => {
                const canChangeStatus = canChangeTaskStatus(project, task, user);

                return (
                  <div key={task.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-sans">{task.title}</p>
                        <p className="text-text-secondary text-sm font-sans mt-1">{task.description}</p>
                        <p className="text-text-secondary text-xs font-mono mt-2">
                          Assigned to {task.assignee || project.owner} - deadline {task.deadline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={taskStatusVariant[task.status] || "default"}>{task.status}</Badge>
                        {canChangeStatus && (
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                          >
                            <option value="pending">pending</option>
                            <option value="postponed">postponed</option>
                            <option value="completed">completed</option>
                          </select>
                        )}
                      </div>
                    </div>
                    {canViewFeedback && (
                    <div className="mt-3">
                      <FeedbackList
                        feedback={task.feedback}
                        currentUser={user}
                        onRemove={(feedbackId) => requestRemoveFeedback("task", { taskId: task.id, feedbackId })}
                      />
                      {isInstructor && (
                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            value={taskFeedbackText[task.id] || ""}
                            onChange={(e) => setTaskFeedbackText((previous) => ({ ...previous, [task.id]: e.target.value }))}
                            placeholder="Add task feedback"
                            className="min-h-16 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue"
                          />
                          <div>
                            <Button size="sm" variant="secondary" onClick={() => saveTaskFeedback(task.id)}>Save Task Feedback</Button>
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-secondary text-sm font-sans">No tasks have been created for this project yet.</p>
          )}
        </Card>

        {canViewFeedback && project.thesisDrafts?.length > 0 && (
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-lg text-text-primary">Thesis Draft Feedback</h2>
              <Badge variant="gold">{project.thesisDrafts.length}</Badge>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {project.thesisDrafts.map((draft) => (
                <div key={draft.id} className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    {draft.isFinal && <Badge variant="success">Final</Badge>}
                    <p className="text-text-primary text-sm font-sans">{draft.title || draft.fileName}</p>
                    <Badge variant={draft.visibility === "public" ? "blue" : "default"}>{draft.visibility}</Badge>
                  </div>
                  <a
                    href={getDocumentUrl(draft.fileName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 inline-block text-accent-blue text-sm font-mono hover:underline"
                  >
                    {draft.fileName}
                  </a>
                  <FeedbackList
                    feedback={draft.feedback}
                    currentUser={user}
                    onRemove={(feedbackId) => requestRemoveFeedback("thesis", { draftId: draft.id, feedbackId })}
                  />
                  {isInstructor && (
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        value={thesisFeedbackText[draft.id] || ""}
                        onChange={(e) => setThesisFeedbackText((previous) => ({ ...previous, [draft.id]: e.target.value }))}
                        placeholder="Add thesis draft feedback"
                        className="min-h-16 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue"
                      />
                      <div>
                        <Button size="sm" variant="secondary" onClick={() => saveThesisFeedback(draft.id)}>Save Draft Feedback</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-text-secondary text-xl">[]</span>
              <h2 className="font-display text-lg text-text-primary">README</h2>
            </div>
            <div className="flex items-center gap-3">
              {project.demo && (
                <Button variant="gold" size="sm" onClick={openPreview}>
                  View Project
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => openExternal(project.github)}>
                GitHub
              </Button>
            </div>
          </div>

          <div className="px-8 py-8 flex flex-col gap-8">
            <div>
              <h1 className="font-display text-4xl text-text-primary mb-4">{project.title}</h1>
              <div className="border-t border-border pt-4">
                <p className="text-text-secondary text-sm font-sans leading-6">{project.description}</p>
              </div>
            </div>

            <ReadmeSection title="Project Access">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.demo && <li>Visual preview: available from the View Project button.</li>}
                <li>Repository: available from the GitHub button.</li>
                {project.report && (
                  <li>
                    Report:{" "}
                    <a
                      href={getDocumentUrl(project.report)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue text-sm font-mono hover:underline"
                    >
                      {project.report}
                    </a>
                  </li>
                )}
              </ul>
            </ReadmeSection>

            <ReadmeSection title="Problem">
              <p className="text-text-secondary text-sm font-sans leading-6">{project.problem}</p>
            </ReadmeSection>

            <ReadmeSection title="Solution">
              <p className="text-text-secondary text-sm font-sans leading-6">{project.solution}</p>
            </ReadmeSection>

            <ReadmeSection title="Key Features">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.features.slice(0, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </ReadmeSection>

            <ReadmeSection title="Outcomes">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.outcomes.slice(0, 2).map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </ReadmeSection>
          </div>
        </Card>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{toast}</p>
            <button type="button" className="text-success text-xs font-semibold" onClick={() => setToast("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      <Modal
        isOpen={Boolean(confirmFeedback)}
        onClose={() => setConfirmFeedback(null)}
        title="Remove Feedback"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">{confirmFeedback?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmFeedback(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmRemoveFeedback}>Remove Feedback</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
