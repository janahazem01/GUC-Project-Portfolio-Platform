import { useContext, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, Stars } from "../../components/ui";
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

function buildFeedback(user, text) {
  return {
    id: Date.now(),
    author: user?.name,
    authorEmail: user?.email,
    text: text.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function upsertOwnFeedback(list, user, text) {
  const nextFeedback = buildFeedback(user, text);
  const existing = (list || []).find((feedback) => feedback.authorEmail === user?.email);

  if (!existing) return [...(list || []), nextFeedback];

  return (list || []).map((feedback) =>
    feedback.authorEmail === user?.email
      ? { ...feedback, text: nextFeedback.text, createdAt: nextFeedback.createdAt }
      : feedback
  );
}

function FeedbackList({ feedback = [], onEdit, onRemove, currentUser }) {
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
                <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>Edit</Button>
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
  const project = projectList.find((item) => item.id === Number(projectId));
  const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const activeNav = location.state?.activeNav || "/projects";
  const openPreview = () => navigate(`/projects/${project.id}/preview`, { state: { activeNav } });
  const canViewFeedback = canViewInstructorFeedback(project, user);
  const updateTaskStatus = (taskId, status) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    });
  };
  const isInstructor = user?.role === "instructor";

  const saveRating = () => {
    const rating = Math.max(0, Math.min(5, Number(ratingValue || project.rating || 0)));
    updateProject(project.id, { rating });
    setRatingValue(String(rating));
  };

  const saveProjectFeedback = () => {
    if (!projectFeedbackText.trim()) return;
    updateProject(project.id, {
      feedback: upsertOwnFeedback(project.feedback, user, projectFeedbackText),
    });
    setProjectFeedbackText("");
  };

  const removeProjectFeedback = (feedbackId) => {
    updateProject(project.id, {
      feedback: (project.feedback || []).filter((feedback) => feedback.id !== feedbackId),
    });
  };

  const saveTaskFeedback = (taskId) => {
    const text = taskFeedbackText[taskId] || "";
    if (!text.trim()) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: upsertOwnFeedback(task.feedback, user, text) }
          : task
      ),
    });
    setTaskFeedbackText((previous) => ({ ...previous, [taskId]: "" }));
  };

  const removeTaskFeedback = (taskId, feedbackId) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: (task.feedback || []).filter((feedback) => feedback.id !== feedbackId) }
          : task
      ),
    });
  };

  const saveThesisFeedback = (draftId) => {
    const text = thesisFeedbackText[draftId] || "";
    if (!text.trim()) return;
    updateProject(project.id, {
      thesisDrafts: (project.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: upsertOwnFeedback(draft.feedback, user, text) }
          : draft
      ),
    });
    setThesisFeedbackText((previous) => ({ ...previous, [draftId]: "" }));
  };

  const removeThesisFeedback = (draftId, feedbackId) => {
    updateProject(project.id, {
      thesisDrafts: (project.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: (draft.feedback || []).filter((feedback) => feedback.id !== feedbackId) }
          : draft
      ),
    });
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

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${project.course} - ${project.owner}`}
        action={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
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
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={ratingValue || String(project.rating || 0)}
                    onChange={(e) => setRatingValue(e.target.value)}
                    className="w-20 bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                  />
                  <Button size="sm" variant="secondary" onClick={saveRating}>Rate</Button>
                </div>
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
            onEdit={(feedback) => setProjectFeedbackText(feedback.text)}
            onRemove={removeProjectFeedback}
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
                        onEdit={(feedback) => setTaskFeedbackText((previous) => ({ ...previous, [task.id]: feedback.text }))}
                        onRemove={(feedbackId) => removeTaskFeedback(task.id, feedbackId)}
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
                  <p className="text-text-secondary text-xs font-mono mb-3">{draft.fileName}</p>
                  <FeedbackList
                    feedback={draft.feedback}
                    currentUser={user}
                    onEdit={(feedback) => setThesisFeedbackText((previous) => ({ ...previous, [draft.id]: feedback.text }))}
                    onRemove={(feedbackId) => removeThesisFeedback(draft.id, feedbackId)}
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
    </div>
  );
}
