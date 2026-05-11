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
  DocumentPreviewModal,
} from "../../components/ui";
import {
  portfolios,
  flagProjectModeration,
  getProjectAppeals,
  setProjectPlatformActive,
  subscribeDummyUpdates,
  submitProjectAppeal,
  findStudentEmailByName,
  pushStudentFeedbackNotification,
} from "../../data/dummy";
import { useFavorites } from "../../hooks/useFavorites";
import { useProjects } from "../../context/ProjectsContext";
import { resolveGithubHref } from "../../utils/githubRepo";
import { UserProfileLink } from "../../components/UserProfileLink";

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

function buildFeedback(user, text) {
  return {
    id: Date.now(),
    author: user?.name,
    authorEmail: user?.email,
    text: text.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function getDocumentName(document) {
  if (!document) return "";
  if (typeof document === "string") return document;
  return document.fileName || document.name || document.title || "";
}

function buildDocumentPreview(document, title) {
  const name = getDocumentName(document);
  const src =
    typeof document === "object" && document !== null
      ? document.fileUrl || document.url || document.src || ""
      : "";
  return { title: title || name || "Document", name, src };
}

function canOpenProjectDetails(project, user) {
  if (!project || !user) return false;
  if (user.role === "admin") return true;
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

  if (acceptedCollaborator || acceptedInstructor) return true;

  return (
    project.visibility === "public" &&
    project.platformActive !== false &&
    project.hiddenFromPublic !== true &&
    !project.flagged
  );
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

function FeedbackList({ feedback = [], onRemove, onEdit, currentUser }) {
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
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit?.(item.id, item.text)}
                  title="Edit feedback"
                >
                  ✎
                </Button>
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
  const { projectList, updateProject } = useProjects();

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
    () => projectList.find((item) => item.id === numericId),
    [projectList, numericId]
  );

  const backToPath = activeNav === "/favorites" ? "/favorites" : null;

  const appealsForProject = useMemo(() => {
    if (!project) return [];
    return getProjectAppeals().filter((appeal) => appeal.projectId === project.id);
  }, [project, moderationRevision]);

  // Feedback state
  const [projectFeedbackText, setProjectFeedbackText] = useState("");
  const [taskFeedbackText, setTaskFeedbackText] = useState({});
  const [thesisFeedbackText, setThesisFeedbackText] = useState({});
  const [ratingValue, setRatingValue] = useState("");
  const [confirmFeedback, setConfirmFeedback] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState("");

  // General UI state
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  // Flag modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagStep, setFlagStep] = useState("details");
  const [flagReason, setFlagReason] = useState("");
  const [flagError, setFlagError] = useState("");
  const [flagConfirmAck, setFlagConfirmAck] = useState(false);

  // Appeal state
  const [appealMessage, setAppealMessage] = useState("");
  const [appealError, setAppealError] = useState("");

  const [readmeEditing, setReadmeEditing] = useState(false);
  const [readmeDraft, setReadmeDraft] = useState("");

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [projectId]);

  useEffect(() => {
    if (!project) return;
    setReadmeDraft(project.description || "");
    setReadmeEditing(false);
  }, [project?.id, project?.description]);

  const openDocumentPreview = (document, title) => {
    setDocumentPreview(buildDocumentPreview(document, title));
  };

  // Allow opening a project from Favorites even if it isn't public.
  // This keeps the rest of the access logic unchanged.
  const projectIsFavorited = project ? isFavoriteProject(project.id) : false;

  if (!project || (!canOpenProjectDetails(project, user) && !projectIsFavorited)) {
    return (
      <div>
        <PageHeader
          title="Project Not Found"
          subtitle="The selected project could not be found."
          action={
            <Button
              variant="secondary"
              onClick={() => (backToPath ? navigate(backToPath) : navigate(-1))}
            >
              {backToPath ? "Back to Favorites" : "Back"}
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
  const isProjectOwner = project.owner === user?.name;

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
  const canSaveThisProject = canUseFavorites && project.owner !== user?.name;
  const canSaveThisPortfolio = ownerPortfolio && canUseFavorites && ownerPortfolio.owner !== user?.name;

  const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const openPreview = () =>
    navigate(`/projects/${project.id}/preview`, { state: { activeNav } });

  // ── Task status ────────────────────────────────────────────────────────────

  const updateTaskStatus = (taskId, status) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    });
  };

  // ── Rating ─────────────────────────────────────────────────────────────────

  const applyRating = (stars) => {
    const rating = Math.max(1, Math.min(5, Math.round(Number(stars) || 1)));
    updateProject(project.id, { rating });
    setRatingValue(String(rating));
    setFeedbackMessage("Rating saved successfully.");
  };

  // ── Project feedback ───────────────────────────────────────────────────────

  const saveProjectFeedback = () => {
    if (!projectFeedbackText.trim()) return;
    updateProject(project.id, {
      feedback: [...(project.feedback || []), buildFeedback(user, projectFeedbackText)],
    });
    setProjectFeedbackText("");
    setFeedbackMessage("Project feedback submitted successfully.");

    if (user?.role === "instructor") {
      const studentEmail = findStudentEmailByName(project.owner);
      pushStudentFeedbackNotification({
        targetStudentEmail: studentEmail,
        targetProjectId: project.id,
        instructorName: user.name,
        projectTitle: project.title,
      });
    }
  };

  const removeProjectFeedback = (feedbackId) => {
    updateProject(project.id, {
      feedback: (project.feedback || []).filter((f) => f.id !== feedbackId),
    });
    setConfirmFeedback(null);
    setFeedbackMessage("Feedback removed successfully.");
  };

  // ── Task feedback ──────────────────────────────────────────────────────────

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
    setTaskFeedbackText((prev) => ({ ...prev, [taskId]: "" }));
    setFeedbackMessage("Task feedback submitted successfully.");

    if (user?.role === "instructor") {
      const studentEmail = findStudentEmailByName(project.owner);
      const task = (project.tasks || []).find((taskItem) => taskItem.id === taskId);
      pushStudentFeedbackNotification({
        targetStudentEmail: studentEmail,
        targetProjectId: project.id,
        instructorName: user.name,
        projectTitle: project.title,
        taskTitle: task?.title,
      });
    }
  };

  const removeTaskFeedback = (taskId, feedbackId) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId
          ? { ...task, feedback: (task.feedback || []).filter((f) => f.id !== feedbackId) }
          : task
      ),
    });
    setConfirmFeedback(null);
    setFeedbackMessage("Feedback removed successfully.");
  };

  // ── Thesis feedback ────────────────────────────────────────────────────────

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
    setThesisFeedbackText((prev) => ({ ...prev, [draftId]: "" }));
    setFeedbackMessage("Draft feedback submitted successfully.");
  };

  const removeThesisFeedback = (draftId, feedbackId) => {
    updateProject(project.id, {
      thesisDrafts: (project.thesisDrafts || []).map((draft) =>
        draft.id === draftId
          ? { ...draft, feedback: (draft.feedback || []).filter((f) => f.id !== feedbackId) }
          : draft
      ),
    });
    setConfirmFeedback(null);
    setFeedbackMessage("Feedback removed successfully.");
  };

  // ── Confirm-remove dispatcher ──────────────────────────────────────────────

  const requestRemoveFeedback = (type, ids = {}) => {
    setConfirmFeedback({ type, ...ids });
  };

  const requestEditFeedback = (type, ids = {}, currentText = "") => {
    setEditingFeedback({ type, ...ids, originalText: currentText });
    setEditingFeedbackText(currentText);
  };

  const saveEditedFeedback = () => {
    if (!editingFeedback) return;
    const trimmedText = editingFeedbackText.trim();
    if (!trimmedText) return;

    if (trimmedText === editingFeedback.originalText) {
      setEditingFeedback(null);
      setFeedbackMessage("No changes were applied.");
      return;
    }

    const updatedText = trimmedText;
    const { type } = editingFeedback;

    if (type === "project") {
      updateProject(project.id, {
        feedback: (project.feedback || []).map((item) =>
          item.id === editingFeedback.feedbackId ? { ...item, text: updatedText } : item
        ),
      });
    }

    if (type === "task") {
      updateProject(project.id, {
        tasks: (project.tasks || []).map((task) =>
          task.id === editingFeedback.taskId
            ? {
                ...task,
                feedback: (task.feedback || []).map((item) =>
                  item.id === editingFeedback.feedbackId ? { ...item, text: updatedText } : item
                ),
              }
            : task
        ),
      });
    }

    if (type === "thesis") {
      updateProject(project.id, {
        thesisDrafts: (project.thesisDrafts || []).map((draft) =>
          draft.id === editingFeedback.draftId
            ? {
                ...draft,
                feedback: (draft.feedback || []).map((item) =>
                  item.id === editingFeedback.feedbackId ? { ...item, text: updatedText } : item
                ),
              }
            : draft
        ),
      });
    }

    setEditingFeedback(null);
    setEditingFeedbackText("");
    setFeedbackMessage("Feedback updated successfully.");
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
      {canSaveThisProject && (
        <Button
          variant={projectSaved ? "gold" : "secondary"}
          onClick={requestProjectFavorite}
        >
          {projectSaved ? "Remove Project" : "Save Project"}
        </Button>
      )}
      {canSaveThisPortfolio && ownerPortfolio && (
        <Button
          variant={portfolioSaved ? "gold" : "secondary"}
          onClick={requestPortfolioFavorite}
        >
          {portfolioSaved ? "Remove Portfolio" : "Save Portfolio"}
        </Button>
      )}
      <Button
        variant="secondary"
        onClick={() => (backToPath ? navigate(backToPath) : navigate(-1))}
      >
        {backToPath ? "Back to Favorites" : "Back"}
      </Button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={
          <>
            {project.course} –{" "}
            <UserProfileLink ownerName={project.owner} className="text-text-secondary">
              {project.owner}
            </UserProfileLink>
          </>
        }
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
                    const trimmed = appealMessage.trim();
                    if (trimmed.length < 16) {
                      setAppealError(
                        "Please write a slightly longer explanation (at least 16 characters)."
                      );
                      return;
                    }
                    if (trimmed.length > 420) {
                      setAppealError("Please keep your explanation under 420 characters.");
                      return;
                    }
                    const result = submitProjectAppeal(user, project.id, appealMessage);
                    if (!result.ok && project.owner !== user?.name) {
                      setAppealError(result.error || "Unable to submit appeal.");
                      return;
                    }
                    updateProject(project.id, { appealSubmitted: true });
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
              <p className="font-sans text-sm text-text-primary">
                <UserProfileLink ownerName={project.owner}>{project.owner}</UserProfileLink>
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Course</p>
              <p className="font-sans text-sm text-text-primary">{project.course}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-text-secondary mb-1">Supervisor</p>
              <p className="font-sans text-sm text-text-primary">
                <UserProfileLink ownerName={project.supervisor}>{project.supervisor}</UserProfileLink>
              </p>
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
              <p className="font-sans text-sm text-text-primary">
                {project.team.map((member, idx) => (
                  <span key={member}>
                    {idx > 0 ? ", " : ""}
                    <UserProfileLink ownerName={member} className="inline">
                      {member}
                    </UserProfileLink>
                  </span>
                ))}
              </p>
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
              onEdit={(feedbackId, currentText) =>
                requestEditFeedback("project", { feedbackId }, currentText)
              }
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
                          onEdit={(feedbackId, currentText) =>
                            requestEditFeedback("task", { taskId: task.id, feedbackId }, currentText)
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
                  <button
                    type="button"
                    className="mb-3 inline-block text-left text-accent-blue text-sm font-mono hover:underline"
                    onClick={() => openDocumentPreview(draft, draft.title || draft.fileName)}
                  >
                    {draft.fileName}
                  </button>
                  <FeedbackList
                    feedback={draft.feedback}
                    currentUser={user}
                    onRemove={(feedbackId) =>
                      requestRemoveFeedback("thesis", { draftId: draft.id, feedbackId })
                    }
                    onEdit={(feedbackId, currentText) =>
                      requestEditFeedback("thesis", { draftId: draft.id, feedbackId }, currentText)
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-text-secondary text-xl shrink-0">[]</span>
              <h2 className="font-display text-lg text-text-primary shrink-0">README</h2>
              {isProjectOwner && !readmeEditing && (
                <button
                  type="button"
                  onClick={() => setReadmeEditing(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-accent-gold/50 hover:bg-bg-elevated hover:text-accent-gold"
                  aria-label="Edit README"
                  title="Edit README"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M15 5l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {isProjectOwner && readmeEditing && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setReadmeEditing(false);
                      setReadmeDraft(project.description || "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => {
                      updateProject(project.id, { description: readmeDraft.trim() });
                      setReadmeEditing(false);
                      setFeedbackMessage("README updated successfully.");
                    }}
                  >
                    Save README
                  </Button>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
              {project.demo && (
                <Button variant="gold" size="sm" onClick={openPreview}>
                  View Project
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => openExternal(resolveGithubHref(project.github))}>
                GitHub
              </Button>
            </div>
          </div>

          <div className="px-8 py-8 flex flex-col gap-8">
            <div>
              <div className="mb-4">
                <h1 className="font-display text-4xl text-text-primary">{project.title}</h1>
              </div>
              <div className="border-t border-border pt-4">
                {readmeEditing && isProjectOwner ? (
                  <textarea
                    value={readmeDraft}
                    onChange={(e) => setReadmeDraft(e.target.value)}
                    rows={6}
                    className="w-full min-h-[8rem] bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans leading-relaxed focus:outline-none focus:border-accent-blue"
                  />
                ) : (
                  <p className="text-text-secondary text-sm font-sans leading-6">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <ReadmeSection title="Project Access">
              <ul className="list-disc pl-6 text-text-secondary text-sm font-sans leading-7">
                {project.demo && (
                  <li>Visual preview: available from the View Project button.</li>
                )}
                <li>Repository: available from the GitHub button.</li>
                {project.reportDescription && (
                  <li>
                    <span className="font-medium text-text-primary">Report summary: </span>
                    {project.reportDescription}
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

      <ConfirmActionModal
        isOpen={Boolean(confirmFeedback)}
        action="remove this feedback"
        variant="danger"
        onClose={() => setConfirmFeedback(null)}
        onConfirm={confirmRemoveFeedback}
      />

      <Modal
        isOpen={Boolean(editingFeedback)}
        onClose={() => setEditingFeedback(null)}
        title="Edit Feedback"
      >
        <div className="flex flex-col gap-4">
          <textarea
            value={editingFeedbackText}
            onChange={(e) => setEditingFeedbackText(e.target.value)}
            className="min-h-28 w-full bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue"
            placeholder="Update your feedback"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingFeedback(null)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={saveEditedFeedback}>
              Save Changes
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
            <p className="text-sm text-text-secondary font-sans mb-4">
              Are you sure you want to flag this project and deactivate it from discovery? After you
              confirm, the student receives a notification with this reason. This cannot be undone
              from this screen; appeals are handled by administrators.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setFlagStep("details")}>
                No
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  const trimmed = flagReason.trim();
                  const result = flagProjectModeration(user, project.id, trimmed);
                  if (!result.ok && !["admin", "instructor"].includes(user?.role)) {
                    setFlagError(result.error || "Unable to submit flag.");
                    setFlagStep("details");
                    return;
                  }
                  updateProject(project.id, {
                    flagged: true,
                    flagReason: trimmed,
                    platformActive: false,
                    hiddenFromPublic: false,
                    appealSubmitted: false,
                  });
                  setFlagModalOpen(false);
                  setFlagReason("");
                  setFlagStep("details");
                  setFlagConfirmAck(false);
                  setFeedbackMessage(
                    "The project has been flagged and deactivated. The student was notified with your reason; they may appeal from their project page."
                  );
                }}
              >
                Yes
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
          updateProject(project.id, { platformActive: false });
          setAdminExploreDeactivateOpen(false);
          setFeedbackMessage(`"${project.title}" was deactivated.`);
        }}
      />

      <DocumentPreviewModal
        document={documentPreview}
        onClose={() => setDocumentPreview(null)}
      />

      {/* Success toast */}
      <SuccessToast message={feedbackMessage} onClose={() => setFeedbackMessage("")} />
    </div>
  );
}

