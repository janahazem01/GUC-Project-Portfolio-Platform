import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  ConfirmActionModal,
  Modal,
  PageHeader,
  Stars,
  SuccessToast,
} from "../../components/ui";
import {
  portfolios,
  projects,
  flagProjectModeration,
  getProjectAppeals,
  setProjectPlatformActive,
  subscribeDummyUpdates,
  submitProjectAppeal,
} from "../../data/dummy";
import { useFavorites } from "../../hooks/useFavorites";

// ─── Helpers ────────────────────────────────────────────────────────────────

const taskStatusVariant = {
  pending: "warning",
  postponed: "default",
  completed: "success",
};

const portfolioByOwner = new Map(portfolios.map((portfolio) => [portfolio.owner, portfolio]));

function canChangeTaskStatus(project, task, user) {
  if (project.owner === user?.name) return true;
  if (task.assignee && task.assignee === user?.name) return true;

  return (project.collaboratorInvitations || []).some(
    (invite) =>
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

  const acceptedCollaborator = (project.collaboratorInvitations || []).some(
    (invite) =>
      invite.status === "accepted" &&
      (invite.email === user.email || invite.collaboratorName === user.name)
  );
  const acceptedInstructor = (project.instructorInvitations || []).some(
    (invite) =>
      invite.status === "accepted" &&
      (invite.email === user.email || invite.instructorName === user.name)
  );

  return acceptedCollaborator || acceptedInstructor;
}

function getDocumentUrl(fileName) {
  return fileName ? `/documents/${encodeURIComponent(fileName)}` : "#";
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function ReadmeSection({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xl text-text-primary mb-3">{title}</h2>
      <div className="border-t border-border pt-4">{children}</div>
    </section>
  );
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
              className={`text-2xl leading-none transition-colors ${
                star <= rating ? "text-accent-gold" : "text-border hover:text-text-secondary"
              }`}
              aria-label={`Rate ${star} of 5 stars`}
            >
              ★
            </button>
          ))}
        </div>
        <Badge variant="gold">{rating}/5</Badge>
      </div>
      <p className="text-text-secondary text-xs font-sans mt-2">
        Click a star to set and save the public rating.
      </p>
    </div>
  );
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
                <Button size="sm" variant="danger" onClick={() => onRemove(item.id)}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const activeNav = location.state?.activeNav || "/projects";
  const numericId = Number(projectId);

  // Moderation live-update subscription
  const [moderationRevision, setModerationRevision] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeDummyUpdates(() =>
      setModerationRevision((revision) => revision + 1)
    );
    return unsubscribe;
  }, []);

  const project = useMemo(
    () => projects.find((item) => item.id === numericId),
    [numericId, moderationRevision]
  );

  const appealsForProject = useMemo(() => {
    if (!project) return [];
    return getProjectAppeals().filter((appeal) => appeal.projectId === project.id);
  }, [project?.id, moderationRevision]);

  // Feedback state
  const [projectFeedbackText, setProjectFeedbackText] = useState("");
  const [taskFeedbackText, setTaskFeedbackText] = useState({});
  const [thesisFeedbackText, setThesisFeedbackText] = useState({});
  const [ratingValue, setRatingValue] = useState("");
  const [confirmFeedback, setConfirmFeedback] = useState(null);

  // General UI state
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Flag modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagStep, setFlagStep] = useState("details");
  const [flagReason, setFlagReason] = useState("");
  const [flagError, setFlagError] = useState("");
  const [flagConfirmAck, setFlagConfirmAck] = useState(false);

  // Appeal state
  const [appealMessage, setAppealMessage] = useState("");
  const [appealError, setAppealError] = useState("");

  // Admin deactivate modal
  const [adminExploreDeactivateOpen, setAdminExploreDeactivateOpen] = useState(false);

  const {
    canUseFavorites,
    isFavoriteProject,
    isFavoritePortfolio,
    saveProject,
    removeProject,
    savePortfolio,
    removePortfolio,
  } = useFavorites();

  if (!project) {
    return (
      <div>
        <PageHeader
          title="Project Not Found"
          subtitle="The selected project could not be found."
          action={
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
          }
        />
        <Card>
          <p className="text-text-secondary font-sans">
            Please select another project from the projects page.
          </p>
        </Card>
      </div>
    );
  }

  // Derived values
  const isInstructor = user?.role === "instructor";
  const canViewFeedback = canViewInstructorFeedback(project, user);
  const canModerateProject = ["admin", "instructor"].includes(user?.role);
  const viewingOwnerStudent = user?.role === "student" && project.owner === user?.name;
  const adminFromExplore = user?.role === "admin" && activeNav === "/explore";
  const canAdminDeactivateFromExplore = adminFromExplore && project.platformActive !== false;
  const ownerPortfolio = portfolioByOwner.get(project.owner);
  const pendingAppeal = appealsForProject.find((appeal) => appeal.status === "pending");
  const projectSaved = isFavoriteProject(project.id);
  const portfolioSaved = ownerPortfolio ? isFavoritePortfolio(ownerPortfolio.id) : false;

  const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const openPreview = () =>
    navigate(`/projects/${project.id}/preview`, { state: { activeNav } });

  // ── Task status ────────────────────────────────────────────────────────────

  const updateTaskStatus = (taskId, status) => {
    // NOTE: projects from dummy data are mutated in-place via setProjectPlatformActive etc.
    // Adapt this call to your actual project-update mechanism if needed.
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.tasks = (updated.tasks || []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      setModerationRevision((r) => r + 1);
    }
  };

  // ── Rating ─────────────────────────────────────────────────────────────────

  const applyRating = (stars) => {
    const rating = Math.max(1, Math.min(5, Math.round(Number(stars) || 1)));
    const updated = projects.find((p) => p.id === project.id);
    if (updated) updated.rating = rating;
    setRatingValue(String(rating));
    setFeedbackMessage("Rating saved successfully.");
  };

  // ── Project feedback ───────────────────────────────────────────────────────

  const saveProjectFeedback = () => {
    if (!projectFeedbackText.trim()) return;
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.feedback = [...(updated.feedback || []), buildFeedback(user, projectFeedbackText)];
    }
    setProjectFeedbackText("");
    setFeedbackMessage("Project feedback submitted successfully.");
    setModerationRevision((r) => r + 1);
  };

  const removeProjectFeedback = (feedbackId) => {
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.feedback = (updated.feedback || []).filter((f) => f.id !== feedbackId);
    }
    setConfirmFeedback(null);
    setFeedbackMessage("Feedback removed successfully.");
    setModerationRevision((r) => r + 1);
  };

  // ── Task feedback ──────────────────────────────────────────────────────────

  const saveTaskFeedback = (taskId) => {
    const text = taskFeedbackText[taskId] || "";
    if (!text.trim()) return;
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.tasks = (updated.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: [...(task.feedback || []), buildFeedback(user, text)] }
          : task
      );
    }
    setTaskFeedbackText((prev) => ({ ...prev, [taskId]: "" }));
    setFeedbackMessage("Task feedback submitted successfully.");
    setModerationRevision((r) => r + 1);
  };

  const removeTaskFeedback = (taskId, feedbackId) => {
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.tasks = (updated.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: (task.feedback || []).filter((f) => f.id !== feedbackId) }
          : task
      );
    }
    setConfirmFeedback(null);
    setFeedbackMessage("Feedback removed successfully.");
    setModerationRevision((r) => r + 1);
  };

  // ── Thesis feedback ────────────────────────────────────────────────────────

  const saveThesisFeedback = (draftId) => {
    const text = thesisFeedbackText[draftId] || "";
    if (!text.trim()) return;
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.thesisDrafts = (updated.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: [...(draft.feedback || []), buildFeedback(user, text)] }
          : draft
      );
    }
    setThesisFeedbackText((prev) => ({ ...prev, [draftId]: "" }));
    setFeedbackMessage("Draft feedback submitted successfully.");
    setModerationRevision((r) => r + 1);
  };

  const removeThesisFeedback = (draftId, feedbackId) => {
    const updated = projects.find((p) => p.id === project.id);
    if (updated) {
      updated.thesisDrafts = (updated.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: (draft.feedback || []).filter((f) => f.id !== feedbackId) }
          : draft
      );
    }
    setConfirmFeedback(null);
    setFeedbackMessage("Feedback removed successfully.");
    setModerationRevision((r) => r + 1);
  };

  // ── Confirm-remove dispatcher ──────────────────────────────────────────────

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
    if (confirmFeedback.type === "task")
      removeTaskFeedback(confirmFeedback.taskId, confirmFeedback.feedbackId);
    if (confirmFeedback.type === "thesis")
      removeThesisFeedback(confirmFeedback.draftId, confirmFeedback.feedbackId);
  };

  // ── Favorites ──────────────────────────────────────────────────────────────

  const requestProjectFavorite = () => {
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

  const requestPortfolioFavorite = () => {
    if (!ownerPortfolio) return;
    const isSaved = isFavoritePortfolio(ownerPortfolio.id);
    setConfirmation({
      action: `${isSaved ? "remove this portfolio from" : "save this portfolio to"} your favorites`,
      variant: isSaved ? "danger" : "gold",
      onConfirm: () => {
        if (isSaved) {
          removePortfolio(ownerPortfolio.id);
          setFeedbackMessage("Portfolio removed from your favorites.");
        } else {
          savePortfolio(ownerPortfolio.id);
          setFeedbackMessage("Portfolio saved to your favorites.");
        }
      },
    });
  };

  // ── Header action bar ──────────────────────────────────────────────────────

  const headerAction = (
    <div className="flex flex-wrap justify-end gap-2">
      {canModerateProject && (
        <>
          {!project.flagged && (
            <Button
              variant="danger"
              onClick={() => {
                setFlagReason("");
                setFlagError("");
                setFlagStep("details");
                setFlagConfirmAck(false);
                setFlagModalOpen(true);
              }}
            >
              Flag for policy review
            </Button>
          )}
          {project.flagged && <Badge variant="warning">Moderation enabled</Badge>}
        </>
      )}
      {canAdminDeactivateFromExplore && (
        <Button variant="danger" onClick={() => setAdminExploreDeactivateOpen(true)}>
          Deactivate
        </Button>
      )}
      {canUseFavorites && (
        <>
          <Button
            variant={projectSaved ? "gold" : "secondary"}
            onClick={requestProjectFavorite}
          >
            {projectSaved ? "Remove Project" : "Save Project"}
          </Button>
          {ownerPortfolio && (
            <Button
              variant={portfolioSaved ? "gold" : "secondary"}
              onClick={requestPortfolioFavorite}
            >
              {portfolioSaved ? "Remove Portfolio" : "Save Portfolio"}
            </Button>
          )}
        </>
      )}
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Back
      </Button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${project.course} - ${project.owner}`}
        action={headerAction}
      />

      {/* Status / moderation banners */}

      {project.platformActive === false && (
        <Card className="mb-4 border-warning/50 bg-warning/10">
          <p className="text-warning text-xs font-mono uppercase tracking-widest mb-1">
            Platform status
          </p>
          <p className="text-text-primary text-sm font-sans">
            This project is deactivated. It is hidden from Explore until an administrator
            activates it again from Admin → Projects.
          </p>
        </Card>
      )}

      {project.hiddenFromPublic && (
        <Card className="mb-4 border-warning/60 bg-warning/10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-warning text-xs font-mono uppercase tracking-widest mb-1">
                Public listing
              </p>
              <p className="font-display text-lg text-text-primary">
                Hidden after moderation decision
              </p>
              <p className="text-text-secondary text-sm font-sans mt-1">
                Administrators removed this submission from Explore while reviewers finish
                follow-up checks.
              </p>
            </div>
          </div>
        </Card>
      )}

      {project.flagged && (
        <Card className="mb-4 border-danger/70 bg-danger/10">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="danger">Flagged submission</Badge>
              <Badge variant={project.platformActive === false ? "warning" : "success"}>
                {project.platformActive === false ? "Temporarily deactivated" : "Activated"}
              </Badge>
              {pendingAppeal && <Badge variant="blue">Appeal queued</Badge>}
            </div>
            <div>
              <p className="text-text-secondary text-xs font-mono uppercase tracking-[0.2em] mb-1">
                Recorded reason
              </p>
              <p className="text-text-primary text-sm font-sans leading-relaxed">
                {project.flagReason}
              </p>
            </div>
            <p className="text-text-secondary text-xs font-sans">
              The project is taken offline for students and employers until the owner submits an
              appeal or an administrator clears the flag. The reason you see above is shared with
              the student.
            </p>
          </div>
        </Card>
      )}

      {viewingOwnerStudent && project.flagged && (
        <>
          {pendingAppeal ? (
            <Card className="mb-4 border-accent-blue/40 bg-accent-blue/5">
              <p className="text-accent-blue font-mono text-[11px] uppercase tracking-[0.2em] mb-2">
                Appeal inbox
              </p>
              <p className="font-display text-xl text-text-primary mb-3">
                Moderators are reviewing your note
              </p>
              <div className="space-y-2 text-sm font-sans text-text-secondary mb-4">
                <p>Submitted on {pendingAppeal.submittedAt}</p>
                <p className="text-text-primary bg-bg-elevated border border-border rounded-lg p-3 leading-relaxed">
                  {pendingAppeal.message}
                </p>
              </div>
              <p className="text-xs text-text-secondary font-sans">
                You&apos;ll receive a notification once an administrator publishes a moderation
                decision.
              </p>
            </Card>
          ) : !project.appealSubmitted ? (
            <Card className="mb-4 border-border">
              <p className="font-display text-lg text-text-primary mb-2">Submit a short appeal</p>
              <p className="text-text-secondary text-sm font-sans mb-4">
                Explain your perspective succinctly (16–420 characters). Appeals route directly to
                administrators.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-[0.2em] text-text-secondary">
                  Explanation
                </label>
                <textarea
                  value={appealMessage}
                  onChange={(e) => {
                    setAppealMessage(e.target.value);
                    setAppealError("");
                  }}
                  rows={4}
                  maxLength={420}
                  className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                  placeholder="Clarify how the flagged content complies with university policy..."
                />
                <div className="flex justify-between text-xs font-mono text-text-secondary">
                  <span>{appealMessage.length}/420</span>
                  {appealError && <span className="text-danger">{appealError}</span>}
                </div>
                <Button
                  onClick={() => {
                    const result = submitProjectAppeal(user, project.id, appealMessage);
                    if (!result.ok) {
                      setAppealError(result.error || "Unable to submit appeal.");
                      return;
                    }
                    setAppealMessage("");
                    setAppealError("");
                    setFeedbackMessage(
                      "Appeal captured — administrators were notified instantly."
                    );
                  }}
                >
                  Send appeal to administrators
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="mb-4 border-border bg-bg-elevated/40">
              <p className="text-sm text-text-secondary font-sans">
                You already surfaced an appeal for this flag cycle. Administrators will follow up
                with the next moderation step.
              </p>
            </Card>
          )}
        </>
      )}

      {/* Main content */}

      <div className="flex flex-col gap-4">
        {/* Project overview card */}
        <Card>
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue">{project.courseCode}</Badge>
              <Badge variant={project.visibility === "public" ? "success" : "default"}>
                {project.visibility}
              </Badge>
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

          <p className="text-text-secondary text-sm font-sans leading-6 mb-6">
            {project.description}
          </p>

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

        {/* Project feedback */}
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
                  <Button size="sm" variant="secondary" onClick={saveProjectFeedback}>
                    Save Feedback
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Tasks */}
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
                        <p className="text-text-secondary text-sm font-sans mt-1">
                          {task.description}
                        </p>
                        <p className="text-text-secondary text-xs font-mono mt-2">
                          Assigned to {task.assignee || project.owner} - deadline{" "}
                          {task.deadline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={taskStatusVariant[task.status] || "default"}>
                          {task.status}
                        </Badge>
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
                          onRemove={(feedbackId) =>
                            requestRemoveFeedback("task", { taskId: task.id, feedbackId })
                          }
                        />
                        {isInstructor && (
                          <div className="mt-3 flex flex-col gap-2">
                            <textarea
                              value={taskFeedbackText[task.id] || ""}
                              onChange={(e) =>
                                setTaskFeedbackText((prev) => ({
                                  ...prev,
                                  [task.id]: e.target.value,
                                }))
                              }
                              placeholder="Add task feedback"
                              className="min-h-16 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue"
                            />
                            <div>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => saveTaskFeedback(task.id)}
                              >
                                Save Task Feedback
                              </Button>
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
            <p className="text-text-secondary text-sm font-sans">
              No tasks have been created for this project yet.
            </p>
          )}
        </Card>

        {/* Thesis drafts */}
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
                    <p className="text-text-primary text-sm font-sans">
                      {draft.title || draft.fileName}
                    </p>
                    <Badge variant={draft.visibility === "public" ? "blue" : "default"}>
                      {draft.visibility}
                    </Badge>
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
                    onRemove={(feedbackId) =>
                      requestRemoveFeedback("thesis", { draftId: draft.id, feedbackId })
                    }
                  />
                  {isInstructor && (
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        value={thesisFeedbackText[draft.id] || ""}
                        onChange={(e) =>
                          setThesisFeedbackText((prev) => ({
                            ...prev,
                            [draft.id]: e.target.value,
                          }))
                        }
                        placeholder="Add thesis draft feedback"
                        className="min-h-16 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue"
                      />
                      <div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => saveThesisFeedback(draft.id)}
                        >
                          Save Draft Feedback
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* README */}
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
                <p className="text-text-secondary text-sm font-sans leading-6">
                  {project.description}
                </p>
              </div>
            </div>

            <ReadmeSection title="Project Access">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.demo && (
                  <li>Visual preview: available from the View Project button.</li>
                )}
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
              <p className="text-text-secondary text-sm font-sans leading-6">
                {project.solution}
              </p>
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

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Remove-feedback confirmation */}
      <Modal
        isOpen={Boolean(confirmFeedback)}
        onClose={() => setConfirmFeedback(null)}
        title="Remove Feedback"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm font-sans">{confirmFeedback?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmFeedback(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRemoveFeedback}>
              Remove Feedback
            </Button>
          </div>
        </div>
      </Modal>

      {/* Flag modal */}
      <Modal
        isOpen={flagModalOpen}
        onClose={() => {
          setFlagModalOpen(false);
          setFlagError("");
          setFlagStep("details");
          setFlagConfirmAck(false);
        }}
        title={
          flagStep === "details"
            ? "Report an academic integrity concern"
            : "Confirm moderation action"
        }
      >
        {flagStep === "details" ? (
          <>
            <div className="rounded-lg border border-border bg-bg-elevated/50 px-4 py-3 mb-5 space-y-2">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-text-secondary">
                University policy
              </p>
              <p className="text-sm text-text-secondary font-sans leading-relaxed">
                Use this workflow for plagiarism, misrepresentation, or other breaches of programme
                rules. A clear, factual reason is required.
              </p>
              <ul className="text-sm text-text-secondary font-sans list-disc pl-5 space-y-1 leading-relaxed">
                <li>The project is deactivated on the platform immediately.</li>
                <li>
                  The student may submit one appeal with evidence; until then the listing stays
                  inactive.
                </li>
                <li>Administrators see your reason and can uphold or reverse the flag.</li>
              </ul>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-text-secondary">
                Reason for flagging (minimum 28 characters)
              </label>
              <textarea
                value={flagReason}
                onChange={(e) => {
                  setFlagReason(e.target.value);
                  setFlagError("");
                }}
                rows={5}
                className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-danger"
                placeholder="Describe the violation (e.g. unattributed reuse of published work, falsified contributions) with enough detail for a formal review."
              />
              {flagError && <p className="text-danger text-sm font-sans">{flagError}</p>}
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <input
                type="checkbox"
                checked={flagConfirmAck}
                onChange={(e) => {
                  setFlagConfirmAck(e.target.checked);
                  setFlagError("");
                }}
                className="mt-1 rounded border-border text-danger focus:ring-danger/30"
              />
              <span className="text-sm text-text-secondary font-sans leading-relaxed">
                I confirm this report is submitted in good faith and reflects a genuine concern
                under GUC academic integrity expectations.
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFlagModalOpen(false);
                  setFlagError("");
                  setFlagStep("details");
                  setFlagConfirmAck(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  const trimmed = flagReason.trim();
                  if (trimmed.length < 28) {
                    setFlagError(
                      "Please provide a fuller explanation (at least 28 characters)."
                    );
                    return;
                  }
                  if (!flagConfirmAck) {
                    setFlagError("Please confirm the good-faith statement to continue.");
                    return;
                  }
                  setFlagError("");
                  setFlagStep("confirm");
                }}
              >
                Review &amp; continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-4 mb-5 space-y-3">
              <p className="text-sm font-sans text-text-primary font-semibold">
                You are about to flag this submission
              </p>
              <p className="text-sm text-text-secondary font-sans">
                <span className="text-text-primary font-medium">{project.title}</span>
                {" · "}
                {project.courseCode} · {project.owner}
              </p>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-text-secondary mb-1">
                  Reason on record
                </p>
                <p className="text-sm text-text-primary font-sans leading-relaxed whitespace-pre-wrap">
                  {flagReason.trim()}
                </p>
              </div>
            </div>
            <p className="text-sm text-text-secondary font-sans mb-6">
              After you confirm, the project is deactivated for public discovery and the student
              receives a notification with this reason. This cannot be undone from this screen;
              appeals are handled by administrators.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setFlagStep("details")}>
                Back
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  const trimmed = flagReason.trim();
                  const result = flagProjectModeration(user, project.id, trimmed);
                  if (!result.ok) {
                    setFlagError(result.error || "Unable to submit flag.");
                    setFlagStep("details");
                    return;
                  }
                  setFlagModalOpen(false);
                  setFlagReason("");
                  setFlagStep("details");
                  setFlagConfirmAck(false);
                  setFeedbackMessage(
                    "The project has been flagged and deactivated. The student was notified with your reason; they may appeal from their project page."
                  );
                }}
              >
                Confirm and flag project
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Favorites confirm modal */}
      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />

      {/* Admin deactivate confirm modal */}
      <ConfirmActionModal
        isOpen={adminExploreDeactivateOpen}
        action={`deactivate "${project.title}" — it will disappear from Explore until an administrator activates it again from Admin → Projects`}
        variant="danger"
        onClose={() => setAdminExploreDeactivateOpen(false)}
        onConfirm={() => {
          setProjectPlatformActive(project.id, false);
          setAdminExploreDeactivateOpen(false);
          setFeedbackMessage(`"${project.title}" was deactivated.`);
        }}
      />

      {/* Success toast */}
      <SuccessToast message={feedbackMessage} onClose={() => setFeedbackMessage("")} />
    </div>
  );
}

