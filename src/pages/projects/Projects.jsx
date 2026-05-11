import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Badge,
  Stars,
  Button,
  PageHeader,
  Modal,
  Input,
  SuccessToast,
  ConfirmActionModal,
  DocumentPreviewModal,
} from "../../components/ui";
import { MiniDonutChart } from "../../components/viz/Charts.jsx";
import { CHART_COLORS } from "../../components/viz/chartColors.js";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { courses, dummyUsers, instructorDirectory } from "../../data/dummy";
import { resolveGithubHref } from "../../utils/githubRepo";

// ─── constants ───────────────────────────────────────────────────────────────
const REQUIRED = "This field cannot be left empty";

const invitationStatusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

const taskStatusVariant = {
  pending: "warning",
  postponed: "default",
  completed: "success",
};

const bachelorProjectCourse = courses.find((c) => c.code === "BP");

// ─── helpers ──────────────────────────────────────────────────────────────────
const blankForm = () => ({
  title: "",
  courseId: "",
  github: "",
  description: "",
  report: "",
  reportFileUrl: "",
  languages: "",
  demoVideo: "",
  visibility: "public",
});

const blankThesisDraftForm = () => ({ title: "", fileName: "", fileUrl: "" });

const blankTaskForm = () => ({
  title: "",
  description: "",
  assignee: "",
  status: "pending",
  deadline: "",
});

function validateProjectForm(form) {
  const errs = {};
  if (!form.title.trim()) errs.title = REQUIRED;
  if (!form.courseId) errs.courseId = REQUIRED;
  if (!form.github.trim()) errs.github = REQUIRED;
  if (!form.languages.trim()) errs.languages = REQUIRED;
  return errs;
}

function canAccessProject(project, user) {
  if (!user?.name) return false;
  if (project.owner === user.name) return true;
  if (user.role === "instructor" && project.supervisor === user.name) return true;
  if ((project.team || []).includes(user.name)) return true;

  if (user.role === "instructor") {
    return (project.instructorInvitations || []).some(
      (inv) =>
        inv.status === "accepted" &&
        (inv.email === user.email || inv.instructorName === user.name)
    );
  }

  return (project.collaboratorInvitations || []).some(
    (inv) =>
      inv.status === "accepted" &&
      (inv.email === user.email || inv.collaboratorName === user.name)
  );
}

function getCourseIdByCode(courseCode) {
  return courses.find((c) => c.code === courseCode)?.id;
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

function readPdfFile(file, onLoaded) {
  if (!file) {
    onLoaded({ fileName: "", fileUrl: "" });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => onLoaded({ fileName: file.name, fileUrl: reader.result || "" });
  reader.onerror = () => onLoaded({ fileName: file.name, fileUrl: "" });
  reader.readAsDataURL(file);
}

// ─── ProjectForm (outside page so it never remounts) ─────────────────────────
function ProjectForm({ form, errors, onChange, onSubmit, onCancel, submitLabel, readmeEditable = true }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Input
          label="Project Title *"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Smart Campus Navigator"
        />
        {errors.title && <p className="text-danger text-xs font-sans mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="text-sm text-text-secondary font-sans">Course *</label>
        <select
          value={form.courseId}
          onChange={(e) => onChange("courseId", e.target.value)}
          className="mt-1.5 w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                     text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue transition-colors"
        >
          <option value="">Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
        {errors.courseId && <p className="text-danger text-xs font-sans mt-1">{errors.courseId}</p>}
      </div>

      <div>
        <Input
          label="GitHub Link *"
          value={form.github}
          onChange={(e) => onChange("github", e.target.value)}
          placeholder="https://github.com/..."
        />
        {errors.github && <p className="text-danger text-xs font-sans mt-1">{errors.github}</p>}
      </div>

      <div>
        <Input
          label="Programming Languages *"
          value={form.languages}
          onChange={(e) => onChange("languages", e.target.value)}
          placeholder="React, Node.js, Python"
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Separate with commas</p>
        {errors.languages && <p className="text-danger text-xs font-sans mt-1">{errors.languages}</p>}
      </div>

      {readmeEditable && (
      <div>
        <label className="text-sm text-text-secondary font-sans">README (project intro)</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Summarize the project in 2-3 sentences"
          className="mt-1.5 min-h-24 w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                     text-text-primary text-sm font-sans placeholder:text-text-secondary/50
                     focus:outline-none focus:border-accent-blue transition-colors resize-none"
        />
      </div>
      )}

      <div>
        <Input
          label="Demo Video URL"
          value={form.demoVideo}
          onChange={(e) => onChange("demoVideo", e.target.value)}
          placeholder="https://youtube.com/..."
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Optional</p>
      </div>

      <div>
        <label className="text-sm text-text-secondary font-sans">Project Report PDF</label>
        <Input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            readPdfFile(file, (nextFile) => {
              onChange("report", nextFile.fileName);
              onChange("reportFileUrl", nextFile.fileUrl);
            });
          }}
        />
        {form.report && (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-text-secondary text-xs font-mono">Attached: {form.report}</span>
            <button
              type="button"
              className="text-accent-blue text-xs font-semibold hover:underline"
              onClick={() => {
                onChange("report", "");
                onChange("reportFileUrl", "");
              }}
            >
              Remove file
            </button>
          </div>
        )}
        <p className="text-text-secondary text-xs font-sans mt-1">Optional PDF attachment for the project report.</p>
      </div>

      <div>
        <label className="text-sm text-text-secondary font-sans">Portfolio Visibility *</label>
        <div className="mt-2 flex gap-3">
          {["public", "private"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange("visibility", v)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-sans border transition-all ${
                form.visibility === v
                  ? v === "public"
                    ? "bg-success/10 border-success text-success"
                    : "bg-bg-elevated border-accent-blue text-text-primary"
                  : "border-border text-text-secondary hover:border-accent-blue/50"
              }`}
            >
              {v === "public" ? "🌐 Public" : "🔒 Private"}
            </button>
          ))}
        </div>
        <p className="text-text-secondary text-xs font-sans mt-1">
          Public projects appear on your portfolio.
        </p>
      </div>

      <p className="text-text-secondary text-xs font-sans">
        * Creation date is set automatically by the system.
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="gold" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { projectList, addProject, updateProject, deleteProject, toggleVisibility } = useProjects();

  // ── modal / form state ────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | { mode: "create" | "edit", project? }
  const [form, setForm] = useState(blankForm());
  const [errors, setErrors] = useState({});

  // edit-in-table state (second implementation's inline edit modal)
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    course: "",
    courseCode: "",
    description: "",
    languages: "",
    createdAt: "",
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  // toasts
  const [successMsg, setSuccessMsg] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalNotice, setModalNotice] = useState(null); // { message, area }

  // confirm dialogs
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editConfirm, setEditConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // thesis
  const [thesisModal, setThesisModal] = useState(null);
  const [thesisForm, setThesisForm] = useState(blankThesisDraftForm());
  const [thesisError, setThesisError] = useState("");
  const [thesisEditProjectId, setThesisEditProjectId] = useState(null);
  const [thesisEditAdd, setThesisEditAdd] = useState({ title: "", fileName: "", fileUrl: "" });
  const [thesisEditError, setThesisEditError] = useState("");
  const [documentPreview, setDocumentPreview] = useState(null);

  // tasks
  const [taskForm, setTaskForm] = useState(blankTaskForm());
  const [taskError, setTaskError] = useState("");
  const [tasksProjectId, setTasksProjectId] = useState(null);

  // invitations
  const [selectedInstructor, setSelectedInstructor] = useState({});
  const [selectedCollaborator, setSelectedCollaborator] = useState({});
  const [collaboratorSearch, setCollaboratorSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");

  // options panel
  const [optionsProjectId, setOptionsProjectId] = useState(null);

  // search
  const [myProjectsSearch, setMyProjectsSearch] = useState("");

  // ── derived data ──────────────────────────────────────────────────
  const myProjects = useMemo(
    () => projectList.filter((p) => canAccessProject(p, user)),
    [projectList, user]
  );

  const myProjectsFiltered = useMemo(() => {
    const q = myProjectsSearch.trim().toLowerCase();
    return q ? myProjects.filter((p) => p.title.toLowerCase().includes(q)) : myProjects;
  }, [myProjects, myProjectsSearch]);

  const languageInsights = useMemo(() => {
    const tallies = {};
    myProjects.forEach((p) =>
      p.languages.forEach((lang) => {
        tallies[lang] = (tallies[lang] || 0) + 1;
      })
    );
    const total = Object.values(tallies).reduce((a, c) => a + c, 0);
    const sorted = Object.entries(tallies)
      .sort((a, b) => b[1] - a[1])
      .map(([language, count], i) => ({
        language,
        count,
        pct: total ? Math.round((count / total) * 100) : 0,
        key: language,
        label: language,
        value: count,
        sliceIndex: i,
      }));
    return { total, sorted };
  }, [myProjects]);

  const optionsProject = projectList.find((p) => p.id === optionsProjectId);
  const tasksProject = projectList.find((p) => p.id === tasksProjectId);
  const thesisEditProject = projectList.find((p) => p.id === thesisEditProjectId);

  // ── auto-dismiss toasts ───────────────────────────────────────────
  useEffect(() => {
    if (!modalNotice) return;
    const t = window.setTimeout(() => setModalNotice(null), 3500);
    return () => window.clearTimeout(t);
  }, [modalNotice]);

  useEffect(() => {
    if (!successMsg) return;
    const t = window.setTimeout(() => setSuccessMsg(""), 3500);
    return () => window.clearTimeout(t);
  }, [successMsg]);

  const showModalNotice = (message, area = "general") => setModalNotice({ message, area });
  const openDocumentPreview = (event, document, title) => {
    event?.stopPropagation?.();
    setDocumentPreview(buildDocumentPreview(document, title));
  };

  // ── navigation helpers ────────────────────────────────────────────
  const viewProject = (id) => navigate(`/projects/${id}`);
  const openProjectTasks = (id) => navigate(`/tasks?projectId=${id}`);

  // ── create/edit modal (card view) ─────────────────────────────────
  const openCreate = () => {
    setForm(blankForm());
    setErrors({});
    setSuccessMsg("");
    setModalNotice(null);
    setModal({ mode: "create" });
  };

  const openEdit = (project, event) => {
    event?.stopPropagation?.();
    setOptionsProjectId(null);
    setModalNotice(null);
    if (project.courseCode === "BP") {
      setThesisEditAdd({ title: "", fileName: "", fileUrl: "" });
      setThesisEditError("");
      setThesisEditProjectId(project.id);
      return;
    }
    const courseObj = courses.find((c) => c.name === project.course);
    setForm({
      title: project.title,
      courseId: courseObj ? String(courseObj.id) : "",
      github: project.github || "",
      description: project.description || "",
      report: project.report || "",
      reportFileUrl: project.reportUrl || "",
      languages: project.languages.join(", "),
      demoVideo: project.demoVideo || "",
      visibility: project.visibility || "public",
    });
    setErrors({});
    setSuccessMsg("");
    setModal({ mode: "edit", project });
  };

  const closeModal = () => {
    setModal(null);
    setErrors({});
    setModalNotice(null);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── create/edit modal (table row inline edit) ─────────────────────
  const openTableEdit = (event, project) => {
    event.stopPropagation();
    setEditingProject(project);
    setEditForm({
      title: project.title,
      course: project.course,
      courseCode: project.courseCode,
      description: project.description,
      languages: project.languages.join(", "),
      createdAt: project.createdAt,
    });
    setEditFormErrors({});
    setSuccessMessage("");
  };

  const closeTableEdit = () => {
    setEditingProject(null);
    setEditFormErrors({});
    setSaveConfirmOpen(false);
  };

  const updateEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editFormErrors[field] && value.trim()) {
      setEditFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateEditForm = () => {
    const nextErrors = {};
    Object.entries(editForm).forEach(([field, value]) => {
      if (field === "description" && editingProject?.owner !== user?.name) return;
      if (!value.trim()) nextErrors[field] = REQUIRED;
    });
    setEditFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleTableEditSubmit = (event) => {
    event.preventDefault();
    if (!validateEditForm()) return;
    setSaveConfirmOpen(true);
  };

  const applyTableEdit = () => {
    if (!editingProject) return;
    updateProject(editingProject.id, {
      title: editForm.title.trim(),
      course: editForm.course.trim(),
      courseCode: editForm.courseCode.trim(),
      description:
        editingProject.owner === user?.name
          ? editForm.description.trim()
          : editingProject.description,
      languages: editForm.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      createdAt: editForm.createdAt.trim(),
    });
    closeTableEdit();
    setSuccessMessage("Edits were made successfully");
  };

  // ── CRUD ──────────────────────────────────────────────────────────
  const requestCreateConfirmation = () => {
    const errs = validateProjectForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setConfirmAction({
      action: "create this project",
      confirmLabel: "Yes",
      variant: "gold",
      onConfirm: handleCreate,
    });
  };

  const handleCreate = () => {
    const course = courses.find((c) => c.id === Number(form.courseId));
    addProject({
      id: Date.now(),
      title: form.title.trim(),
      course: course?.name || "",
      courseCode: course?.code || "",
      owner: user?.name,
      supervisor: "",
      status: "In Progress",
      github: form.github.trim(),
      demo: form.demoVideo.trim() || null,
      report: form.report.trim() || null,
      reportUrl: form.reportFileUrl || null,
      demoVideo: form.demoVideo.trim() || null,
      languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      team: [user?.name],
      rating: 0,
      visibility: form.visibility,
      createdAt: new Date().toISOString().slice(0, 10),
      description: form.description.trim(),
      problem: "",
      solution: "",
      features: [],
      outcomes: [],
      resources: [{ label: "Project Repository", url: resolveGithubHref(form.github.trim()) }],
      tasks: [],
    });
    setForm(blankForm());
    setErrors({});
    setModal(null);
    setSuccessMsg("Project created successfully.");
  };

  const requestUpdateConfirmation = () => {
    const errs = validateProjectForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setEditConfirm(true);
  };

  const handleUpdate = () => {
    const course = courses.find((c) => c.id === Number(form.courseId));
    const canEditReadme = modal.project.owner === user?.name;
    updateProject(modal.project.id, {
      title: form.title.trim(),
      course: course?.name || modal.project.course,
      courseCode: course?.code || modal.project.courseCode,
      github: form.github.trim(),
      description: canEditReadme ? form.description.trim() : modal.project.description,
      report: form.report.trim() || modal.project.report,
      reportUrl: form.reportFileUrl || modal.project.reportUrl || null,
      demoVideo: form.demoVideo.trim() || modal.project.demoVideo,
      demo: form.demoVideo.trim() || modal.project.demo,
      languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      visibility: form.visibility,
    });
    setEditConfirm(false);
    setModal(null);
    setErrors({});
    setSuccessMsg("Project updated successfully.");
  };

  const handleDelete = () => {
    deleteProject(deleteConfirm.id);
    setDeleteConfirm(null);
    setSuccessMsg("Project deleted.");
  };

  // ── thesis ────────────────────────────────────────────────────────
  const openThesisUpload = (project) => {
    setThesisForm(blankThesisDraftForm());
    setThesisError("");
    setModalNotice(null);
    setThesisEditProjectId(project?.id || null);
    setThesisModal({ mode: "upload", projectId: project?.id || null });
  };

  const closeThesisModal = () => {
    setThesisModal(null);
    setThesisError("");
    setModalNotice(null);
  };

  const closeThesisEditModal = () => {
    setThesisEditProjectId(null);
    setThesisEditAdd({ title: "", fileName: "", fileUrl: "" });
    setThesisEditError("");
  };

  const getBachelorProject = () =>
    projectList.find((p) => p.owner === user?.name && p.courseCode === "BP");

  const handleThesisUpload = () => {
    if (!thesisForm.title.trim() || !thesisForm.fileName.trim()) {
      setThesisError("Add a draft title and choose a file name.");
      return;
    }
    const nextDraft = {
      id: Date.now(),
      title: thesisForm.title.trim(),
      fileName: thesisForm.fileName.trim(),
      fileUrl: thesisForm.fileUrl || "",
      uploadedAt: new Date().toISOString().slice(0, 10),
      isFinal: false,
      visibility: "private",
    };
    const targetProject = projectList.find((p) => p.id === thesisModal?.projectId);
    if (targetProject && targetProject.courseCode === "BP") {
      updateProject(targetProject.id, {
        thesisDrafts: [...(targetProject.thesisDrafts || []), nextDraft],
      });
    } else {
      const bachelorProject = getBachelorProject();
      if (bachelorProject) {
        updateProject(bachelorProject.id, {
          thesisDrafts: [...(bachelorProject.thesisDrafts || []), nextDraft],
        });
      } else {
        addProject({
          id: Date.now() + 1,
          title: "Bachelor Project Thesis",
          course: bachelorProjectCourse?.name || "Bachelor Project",
          courseCode: bachelorProjectCourse?.code || "BP",
          owner: user?.name,
          supervisor: "",
          status: "Drafting",
          github: "#",
          demo: null,
          report: null,
          reportUrl: null,
          demoVideo: null,
          languages: [],
          team: [user?.name],
          rating: 0,
          visibility: "public",
          createdAt: new Date().toISOString().slice(0, 10),
          description: "Bachelor Project thesis draft workspace.",
          problem: "",
          solution: "",
          features: [],
          outcomes: [],
          resources: [],
          thesisDrafts: [nextDraft],
          finalDraftId: null,
          tasks: [],
        });
      }
    }
    setThesisForm(blankThesisDraftForm());
    setThesisError("");
    setThesisModal(null);
    showModalNotice("Thesis draft uploaded under Bachelor Project.");
  };

  const handleAddThesisDraftInEditor = () => {
    if (!thesisEditProject) return;
    if (!thesisEditAdd.title.trim() || !thesisEditAdd.fileName.trim()) {
      setThesisEditError("Add a draft title and choose a PDF file.");
      return;
    }
    const nextDraft = {
      id:
        Math.max(
          0,
          ...(thesisEditProject.thesisDrafts || []).map((draft) => Number(draft.id) || 0)
        ) + 1,
      title: thesisEditAdd.title.trim(),
      fileName: thesisEditAdd.fileName.trim(),
      fileUrl: thesisEditAdd.fileUrl || "",
      uploadedAt: new Date().toISOString().slice(0, 10),
      isFinal: false,
      visibility: "private",
    };
    updateProject(thesisEditProject.id, {
      thesisDrafts: [...(thesisEditProject.thesisDrafts || []), nextDraft],
    });
    setThesisEditAdd({ title: "", fileName: "", fileUrl: "" });
    setThesisEditError("");
    showModalNotice("Thesis PDF added.");
  };

  const requestRemoveThesisDraft = (project, draft) => {
    setConfirmAction({
      title: "Remove thesis PDF",
      message: `Remove "${draft.title || draft.fileName}" from this thesis?`,
      confirmLabel: "Remove",
      variant: "danger",
      onConfirm: () => {
        const nextDrafts = (project.thesisDrafts || []).filter((d) => d.id !== draft.id);
        const removedFinal = project.finalDraftId === draft.id;
        updateProject(project.id, {
          thesisDrafts: nextDrafts.map((d) => ({
            ...d,
            isFinal: removedFinal ? false : d.isFinal,
            visibility: removedFinal ? "private" : d.visibility,
          })),
          finalDraftId: removedFinal ? null : project.finalDraftId,
        });
        showModalNotice(
          removedFinal ? "Draft removed. Final selection cleared." : "Thesis PDF removed.",
          "thesis"
        );
      },
    });
  };

  const markFinalDraft = (e, project, draftId) => {
    e.stopPropagation();
    updateProject(project.id, {
      finalDraftId: draftId,
      visibility: "public",
      thesisDrafts: (project.thesisDrafts || []).map((d) => ({
        ...d,
        isFinal: d.id === draftId,
        visibility: d.id === draftId ? "public" : "private",
      })),
    });
    showModalNotice("Final thesis draft selected. Other drafts are now private.", "thesis");
  };

  const cancelFinalDraft = (e, project) => {
    e.stopPropagation();
    updateProject(project.id, {
      finalDraftId: null,
      thesisDrafts: (project.thesisDrafts || []).map((d) => ({
        ...d,
        isFinal: false,
        visibility: "private",
      })),
    });
    showModalNotice("Final thesis draft selection cancelled.", "thesis");
  };

  // ── tasks ─────────────────────────────────────────────────────────
  const handleTaskField = (field, value) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
    if (taskError) setTaskError("");
  };

  const createTask = (e, project) => {
    e.stopPropagation();
    if (project.owner !== user?.name) return;
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.deadline) {
      setTaskError("Add a title, short description, and deadline.");
      return;
    }
    if (project.courseCode !== "BP" && !taskForm.assignee) {
      setTaskError("Assign the task to a collaborator.");
      return;
    }
    const nextId = Math.max(0, ...(project.tasks || []).map((t) => Number(t.id) || 0)) + 1;
    updateProject(project.id, {
      tasks: [
        ...(project.tasks || []),
        {
          id: nextId,
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          assignee: project.courseCode === "BP" ? project.owner : taskForm.assignee,
          status: taskForm.status,
          deadline: taskForm.deadline,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    });
    setTaskForm(blankTaskForm());
    setTaskError("");
    showModalNotice("Task created.", "tasks");
  };

  const updateTaskStatus = (project, taskId, status) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((t) => (t.id === taskId ? { ...t, status } : t)),
    });
    showModalNotice("Task status updated successfully.", "tasks");
  };

  const updateTaskField = (project, taskId, field, value) => {
    if (project.owner !== user?.name) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).map((t) => (t.id === taskId ? { ...t, [field]: value } : t)),
    });
    showModalNotice("Task edited successfully.", "tasks");
  };

  const deleteTask = (project, taskId) => {
    if (project.owner !== user?.name) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).filter((t) => t.id !== taskId),
    });
    showModalNotice("Task removed.", "tasks");
  };

  const requestDeleteTask = (e, project, task) => {
    e.stopPropagation();
    if (project.owner !== user?.name) return;
    setConfirmAction({
      title: "Remove Task",
      message: `Are you sure you want to remove "${task.title}"?`,
      confirmLabel: "Remove Task",
      variant: "danger",
      onConfirm: () => deleteTask(project, task.id),
    });
  };

  // ── collaborators ─────────────────────────────────────────────────
  const getEligibleCollaborators = (project) => {
    if (project.courseCode === "BP") return [];
    const invitedIds = (project.collaboratorInvitations || []).map((i) => i.studentId);
    const currentTeam = new Set([...(project.team || []), project.owner]);
    return dummyUsers.filter(
      (u) =>
        u.role === "student" &&
        u.email !== user?.email &&
        !currentTeam.has(u.name) &&
        !invitedIds.includes(u.id)
    );
  };

  const getProjectCollaborators = (project) =>
    project.courseCode === "BP"
      ? []
      : (project.team || []).filter((m) => m !== project.owner);

  const inviteCollaborator = (e, project) => {
    e.stopPropagation();
    const studentId = Number(selectedCollaborator[project.id]);
    const collaborator = dummyUsers.find((u) => u.id === studentId && u.role === "student");
    if (!collaborator) return;
    updateProject(project.id, {
      collaboratorInvitations: [
        ...(project.collaboratorInvitations || []),
        {
          id: Date.now(),
          studentId: collaborator.id,
          collaboratorName: collaborator.name,
          email: collaborator.email,
          status: "no reply",
          sentAt: new Date().toISOString().slice(0, 10),
        },
      ],
    });
    setSelectedCollaborator((prev) => ({ ...prev, [project.id]: "" }));
    setCollaboratorSearch("");
    showModalNotice(`Invitation sent to ${collaborator.name}.`, "collaborators");
  };

  const requestRemoveCollaborator = (e, project, collaboratorName) => {
    e.stopPropagation();
    if (project.owner !== user?.name || project.courseCode === "BP") return;
    setConfirmAction({
      title: "Remove Collaborator",
      message: `Are you sure you want to remove ${collaboratorName} from this project? Their assigned tasks will become unassigned.`,
      confirmLabel: "Remove Collaborator",
      variant: "danger",
      onConfirm: () => removeCollaborator(project, collaboratorName),
    });
  };

  const removeCollaborator = (project, collaboratorName) => {
    if (project.owner !== user?.name || project.courseCode === "BP") return;
    updateProject(project.id, {
      team: (project.team || []).filter((m) => m !== collaboratorName),
      collaboratorInvitations: (project.collaboratorInvitations || []).filter(
        (inv) => inv.collaboratorName !== collaboratorName
      ),
      tasks: (project.tasks || []).map((t) =>
        t.assignee === collaboratorName ? { ...t, assignee: "" } : t
      ),
    });
    showModalNotice(`${collaboratorName} removed from the project.`, "collaborators");
  };

  // ── instructors ───────────────────────────────────────────────────
  const getEligibleInstructors = (project) => {
    const courseId = getCourseIdByCode(project.courseCode);
    const invitedIds = (project.instructorInvitations || []).map((i) => i.instructorId);
    return instructorDirectory.filter(
      (ins) => ins.coursesTaught.includes(courseId) && !invitedIds.includes(ins.id)
    );
  };

  const inviteInstructor = (e, project) => {
    e.stopPropagation();
    const instructorId = Number(selectedInstructor[project.id]);
    const instructor = instructorDirectory.find((i) => i.id === instructorId);
    if (!instructor) return;
    updateProject(project.id, {
      instructorInvitations: [
        ...(project.instructorInvitations || []),
        {
          id: Date.now(),
          instructorId: instructor.id,
          instructorName: instructor.name,
          email: instructor.email,
          status: "no reply",
          sentAt: new Date().toISOString().slice(0, 10),
        },
      ],
    });
    setSelectedInstructor((prev) => ({ ...prev, [project.id]: "" }));
    setInstructorSearch("");
    showModalNotice(`Invitation sent to ${instructor.name}.`, "instructors");
  };

  const requestCancelInvitation = (e, project, invitationId, type) => {
    e.stopPropagation();
    setConfirmAction({
      title: "Cancel Invitation",
      message: "Are you sure you want to cancel this invitation?",
      confirmLabel: "Cancel Invitation",
      variant: "danger",
      onConfirm: () => cancelInvitation(project, invitationId, type),
    });
  };

  const cancelInvitation = (project, invitationId, type) => {
    const key = type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";
    updateProject(project.id, {
      [key]: (project[key] || []).filter((inv) => inv.id !== invitationId),
    });
    showModalNotice(
      "Invitation cancelled.",
      type === "collaborator" ? "collaborators" : "instructors"
    );
  };

  // ── portfolio visibility ──────────────────────────────────────────
  const toggleProjectPortfolio = (project) => {
    toggleVisibility(project.id);
    showModalNotice(
      project.visibility === "public"
        ? "Project hidden from your portfolio."
        : "Project shown on your portfolio."
    );
  };

  // ── render ────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title={user?.role === "instructor" ? "Projects" : "My Projects"}
        subtitle={
          user?.role === "instructor"
            ? "Projects I am assigned to"
            : "Manage and track your submitted projects"
        }
        action={
          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            {myProjects.length > 0 && (
              <Input
                placeholder="Search by project title…"
                value={myProjectsSearch}
                onChange={(e) => setMyProjectsSearch(e.target.value)}
                className="w-full min-w-[12rem] sm:w-56"
              />
            )}
            {user?.role === "student" && (
              <div className="flex gap-3">
                <Button variant="gold" onClick={openCreate}>
                  + New Project
                </Button>
              </div>
            )}
          </div>
        }
      />

      {/* Language insights + collaborator charts */}
      {user?.role === "student" && myProjects.length > 0 && (
        <div className="space-y-4 mb-8">
          <Card>
            <h2 className="font-display text-base text-text-primary mb-1">
              Programming languages across projects
            </h2>
            <p className="text-xs text-text-secondary font-sans mb-4 leading-snug">
              Percentages reflect how often each language appears across your project stack lists
              (sums to 100% of all language mentions).
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <MiniDonutChart
                segments={languageInsights.sorted.map((seg, i) => ({
                  key: seg.key,
                  label: seg.language,
                  value: seg.value,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                }))}
                size={150}
              />
              <ul className="flex-1 space-y-2 min-w-0">
                {languageInsights.sorted.map((seg) => (
                  <li
                    key={seg.language}
                    className="flex items-center justify-between gap-3 text-sm font-sans"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[seg.sliceIndex % CHART_COLORS.length] }}
                        aria-hidden
                      />
                      <span className="text-text-primary truncate">{seg.language}</span>
                    </span>
                    <span className="text-text-secondary font-mono tabular-nums shrink-0">
                      {seg.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-base text-text-primary mb-1">
              Top collaborators per project
            </h2>
            <p className="text-xs text-text-secondary font-sans mb-4">
              Teammates listed on each of your projects (excluding you).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {myProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-border bg-bg-elevated/40 px-4 py-3"
                >
                  <h3 className="font-display text-sm text-text-primary mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {project.team.filter((m) => m !== user?.name).map((collaborator) => (
                      <Badge key={collaborator} variant="blue" className="text-xs">
                        {collaborator}
                      </Badge>
                    ))}
                    {project.team.filter((m) => m !== user?.name).length === 0 && (
                      <span className="text-xs text-text-secondary font-sans">
                        No other collaborators listed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Project cards list */}
      <div className="flex flex-col gap-4 mb-8">
        {myProjects.length > 0 ? (
          myProjectsFiltered.length > 0 ? (
            myProjectsFiltered.map((project) => (
              <Card
                key={project.id}
                hover
                className="cursor-pointer"
                onClick={() => viewProject(project.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-lg text-text-primary">{project.title}</h3>
                      <Badge variant="blue">{project.courseCode}</Badge>
                      <Badge variant={project.visibility === "public" ? "success" : "default"}>
                        {project.visibility === "public" ? "🌐 public" : "🔒 private"}
                      </Badge>
                      {project.owner !== user?.name && (
                        <Badge variant="gold">
                          {user?.role === "instructor" ? "Instructor" : "Collaborator"}
                        </Badge>
                      )}
                    </div>

                    <p className="text-text-secondary text-sm font-sans mb-2">{project.course}</p>

                    {project.description && (
                      <p className="text-text-secondary text-sm font-sans mb-3 max-w-xl line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {project.languages.map((lang) => (
                        <Badge key={lang}>{lang}</Badge>
                      ))}
                    </div>

                    {project.courseCode === "BP" && (
                      <div className="mt-4 max-w-xl rounded-md border border-border bg-bg-elevated/60 px-3 py-3">
                        {project.thesisDrafts?.length ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {project.thesisDrafts.map((draft) => (
                              <div
                                key={draft.id}
                                className="rounded-md border border-border bg-bg-surface px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    {draft.isFinal && <Badge variant="success">Final</Badge>}
                                    <p className="text-text-primary text-sm font-sans truncate">
                                      {draft.title || draft.fileName}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className="block max-w-full truncate text-left text-accent-blue text-sm font-mono hover:underline"
                                    onClick={(e) =>
                                      openDocumentPreview(e, draft, draft.title || draft.fileName)
                                    }
                                  >
                                    {draft.fileName}
                                  </button>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant={draft.visibility === "public" ? "blue" : "default"}>
                                    {draft.visibility === "public" ? "public" : "private"}
                                  </Badge>
                                  <span className="text-text-secondary text-[11px] font-mono">
                                    {draft.uploadedAt}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-secondary text-xs font-sans">
                            No thesis drafts uploaded yet.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      {project.github && (
                        <a
                          href={resolveGithubHref(project.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-blue text-xs font-mono hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub ↗
                        </a>
                      )}
                      {project.demoVideo && (
                        <a
                          href={project.demoVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-gold text-xs font-mono hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Demo Video ▶
                        </a>
                      )}
                      {project.report && (
                        <button
                          type="button"
                          className="text-accent-blue text-sm font-mono hover:underline"
                          onClick={(e) =>
                            openDocumentPreview(
                              e,
                              { fileName: project.report, fileUrl: project.reportUrl || "" },
                              project.report
                            )
                          }
                        >
                          View PDF: {project.report}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <Stars rating={project.rating} />
                    <p className="font-mono text-xs text-text-secondary">Created {project.createdAt}</p>
                    {user?.role === "student" && project.owner === user?.name && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="gold"
                          size="sm"
                          className="rounded-md border border-accent-gold/50 bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectTasks(project.id);
                          }}
                        >
                          Tasks
                        </Button>
                        {project.courseCode === "BP" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openThesisUpload(project);
                            }}
                          >
                            Upload Thesis Draft
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          title="Delete project"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(project);
                          }}
                        >
                          🗑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-10 px-0 text-xl leading-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalNotice(null);
                            setOptionsProjectId(project.id);
                          }}
                          aria-label="Project options"
                        >
                          ⋮
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-text-secondary font-sans">
                No projects match that title. Try a different search.
              </p>
            </Card>
          )
        ) : (
          <Card>
            <p className="text-text-secondary font-sans">
              You have no projects yet. Click &ldquo;+ New Project&rdquo; to get started.
            </p>
          </Card>
        )}
      </div>

      {/* Projects table */}
      {myProjects.length > 0 && (
        <Card className="p-0 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  {["Projects", "Course", "Status", "Rating", "Created", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-text-secondary font-normal ${
                        i === 0 ? "min-w-[10rem]" : i === 5 ? "text-right w-[11rem]" : "text-center"
                      }`}
                    >
                      {h === "Projects" ? `Projects (${myProjects.length})` : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border last:border-0 hover:bg-bg-elevated/20 transition-colors cursor-pointer align-middle"
                    onClick={() => viewProject(project.id)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        viewProject(project.id);
                      }
                    }}
                  >
                    <td className="px-4 py-4">
                      <p className="font-display text-sm text-text-primary break-words">
                        {project.title}
                      </p>
                      <p className="text-text-secondary text-xs font-sans mt-1 line-clamp-2 max-w-md">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.languages.map((lang) => (
                          <Badge key={lang}>{lang}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant="blue">{project.courseCode}</Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={project.flagged ? "danger" : "success"}>
                        {project.flagged ? "Flagged" : "Not flagged"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Stars rating={project.rating} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono text-xs text-text-secondary whitespace-nowrap">
                        {project.createdAt}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className="flex flex-wrap justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => openTableEdit(e, project)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewProject(project.id);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}

      {/* Create */}
      <Modal isOpen={modal?.mode === "create"} onClose={closeModal} title="Create New Project">
        <ProjectForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={requestCreateConfirmation}
          onCancel={closeModal}
          submitLabel="Create Project"
        />
      </Modal>

      {/* Edit (card-view full form) */}
      <Modal isOpen={modal?.mode === "edit"} onClose={closeModal} title="Edit Project">
        <ProjectForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={requestUpdateConfirmation}
          onCancel={closeModal}
          submitLabel="Save Changes"
          readmeEditable={modal?.project?.owner === user?.name}
        />
      </Modal>

      {/* Edit (table-row inline form) */}
      <Modal isOpen={Boolean(editingProject)} onClose={closeTableEdit} title="Edit Project">
        <form className="flex flex-col gap-4" onSubmit={handleTableEditSubmit} noValidate>
          <div>
            <Input
              label="Project Title"
              value={editForm.title}
              onChange={(e) => updateEditField("title", e.target.value)}
            />
            {editFormErrors.title && (
              <p className="text-danger text-xs font-sans mt-1">{editFormErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Course"
                value={editForm.course}
                onChange={(e) => updateEditField("course", e.target.value)}
              />
              {editFormErrors.course && (
                <p className="text-danger text-xs font-sans mt-1">{editFormErrors.course}</p>
              )}
            </div>
            <div>
              <Input
                label="Course Code"
                value={editForm.courseCode}
                onChange={(e) => updateEditField("courseCode", e.target.value)}
              />
              {editFormErrors.courseCode && (
                <p className="text-danger text-xs font-sans mt-1">{editFormErrors.courseCode}</p>
              )}
            </div>
          </div>

          <div>
            {editingProject?.owner === user?.name ? (
              <>
                <label className="text-sm text-text-secondary font-sans">README (project intro)</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => updateEditField("description", e.target.value)}
                  className="mt-1.5 min-h-24 w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                             text-text-primary text-sm font-sans placeholder:text-text-secondary/50
                             focus:outline-none focus:border-accent-blue transition-colors resize-none"
                />
                {editFormErrors.description && (
                  <p className="text-danger text-xs font-sans mt-1">{editFormErrors.description}</p>
                )}
              </>
            ) : (
              <p className="text-text-secondary text-xs font-sans">
                Only the project owner can edit the README from this form.
              </p>
            )}
          </div>

          <div>
            <Input
              label="Languages"
              value={editForm.languages}
              onChange={(e) => updateEditField("languages", e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
            {editFormErrors.languages && (
              <p className="text-danger text-xs font-sans mt-1">{editFormErrors.languages}</p>
            )}
          </div>

          <div>
            <Input
              label="Creation Date"
              type="date"
              value={editForm.createdAt}
              onChange={(e) => updateEditField("createdAt", e.target.value)}
            />
            {editFormErrors.createdAt && (
              <p className="text-danger text-xs font-sans mt-1">{editFormErrors.createdAt}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeTableEdit}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Done
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tasks modal */}
      <Modal
        isOpen={Boolean(tasksProject)}
        onClose={() => { setTasksProjectId(null); setTaskError(""); }}
        title="Project Tasks"
      >
        {tasksProject && (() => {
          const projectCollaborators = getProjectCollaborators(tasksProject);
          const tasks = tasksProject.tasks || [];
          return (
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-text-primary text-sm font-sans">{tasksProject.title}</p>
                    <p className="text-text-secondary text-xs font-mono">
                      {tasks.length} task{tasks.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant="blue">Tasks</Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-bg-surface px-4 py-4">
                <h3 className="font-display text-base text-text-primary mb-3">Create Task</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Task Name"
                    value={taskForm.title}
                    onChange={(e) => handleTaskField("title", e.target.value)}
                    placeholder="e.g. Finish API"
                  />
                  <Input
                    label="Deadline"
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => handleTaskField("deadline", e.target.value)}
                  />
                  <Input
                    label="Short Description"
                    value={taskForm.description}
                    onChange={(e) => handleTaskField("description", e.target.value)}
                    placeholder="One-line task description"
                    className="sm:col-span-2"
                  />
                  {tasksProject.courseCode !== "BP" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-text-secondary font-sans">
                        Assigned Collaborator
                      </label>
                      <select
                        value={taskForm.assignee}
                        onChange={(e) => handleTaskField("assignee", e.target.value)}
                        className="bg-bg-elevated border border-border rounded-lg px-3 py-2.5
                                   text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                      >
                        <option value="">Select collaborator</option>
                        {projectCollaborators.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-sans">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => handleTaskField("status", e.target.value)}
                      className="bg-bg-elevated border border-border rounded-lg px-3 py-2.5
                                 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                    >
                      <option value="pending">pending</option>
                      <option value="postponed">postponed</option>
                      <option value="completed">completed</option>
                    </select>
                  </div>
                </div>
                {taskError && (
                  <p className="text-danger text-xs font-sans mt-3">{taskError}</p>
                )}
                <div className="mt-4">
                  <Button size="sm" variant="gold" onClick={(e) => createTask(e, tasksProject)}>
                    Create Task
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-border bg-bg-elevated px-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-text-primary text-sm font-sans">{task.title}</p>
                          <p className="text-text-secondary text-xs font-mono">
                            Deadline {task.deadline || "not set"}
                          </p>
                        </div>
                        <Badge variant={taskStatusVariant[task.status] || "default"}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          label="Name"
                          value={task.title}
                          onChange={(e) => updateTaskField(tasksProject, task.id, "title", e.target.value)}
                        />
                        <Input
                          label="Deadline"
                          type="date"
                          value={task.deadline}
                          onChange={(e) => updateTaskField(tasksProject, task.id, "deadline", e.target.value)}
                        />
                        <Input
                          label="Description"
                          value={task.description}
                          onChange={(e) => updateTaskField(tasksProject, task.id, "description", e.target.value)}
                          className="sm:col-span-2"
                        />
                        {tasksProject.courseCode !== "BP" && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-text-secondary font-sans">Assignee</label>
                            <select
                              value={task.assignee}
                              onChange={(e) => updateTaskField(tasksProject, task.id, "assignee", e.target.value)}
                              className="bg-bg-surface border border-border rounded-lg px-3 py-2.5
                                         text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                            >
                              <option value="">Unassigned</option>
                              {projectCollaborators.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm text-text-secondary font-sans">Status</label>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(tasksProject, task.id, e.target.value)}
                            className="bg-bg-surface border border-border rounded-lg px-3 py-2.5
                                       text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                          >
                            <option value="pending">pending</option>
                            <option value="postponed">postponed</option>
                            <option value="completed">completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => requestDeleteTask(e, tasksProject, task)}
                        >
                          Remove Task
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm font-sans">No tasks created yet.</p>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Options modal */}
      <Modal
        isOpen={Boolean(optionsProject)}
        onClose={() => setOptionsProjectId(null)}
        title="Project Options"
      >
        {optionsProject && (() => {
          const invitations = optionsProject.instructorInvitations || [];
          const collaboratorInvitations = optionsProject.collaboratorInvitations || [];
          const eligibleCollaborators = getEligibleCollaborators(optionsProject);
          const eligibleInstructors = getEligibleInstructors(optionsProject);
          const projectCollaborators = getProjectCollaborators(optionsProject);

          return (
            <div className="flex flex-col gap-5">
              {/* Visibility toggle */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-text-primary font-sans text-sm">{optionsProject.title}</p>
                    <p className="text-text-secondary font-mono text-xs">{optionsProject.course}</p>
                  </div>
                  <Badge variant={optionsProject.visibility === "public" ? "success" : "default"}>
                    {optionsProject.visibility}
                  </Badge>
                </div>
                <Button
                  variant={optionsProject.visibility === "public" ? "danger" : "secondary"}
                  onClick={() => toggleProjectPortfolio(optionsProject)}
                  className="w-full"
                >
                  {optionsProject.visibility === "public"
                    ? "Hide from portfolio"
                    : "Show on portfolio"}
                </Button>
              </div>

              {/* Thesis final draft selector */}
              {optionsProject.courseCode === "BP" && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-display text-base text-text-primary mb-3">
                    Thesis Final Draft
                  </h3>
                  {optionsProject.thesisDrafts?.length ? (
                    <div className="flex flex-col gap-3">
                      {optionsProject.thesisDrafts.map((draft) => (
                        <div key={draft.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-text-primary text-sm font-sans truncate">
                              {draft.title || draft.fileName}
                            </p>
                            <button
                              type="button"
                              className="block max-w-full truncate text-left text-accent-blue text-sm font-mono hover:underline"
                              onClick={(e) =>
                                openDocumentPreview(e, draft, draft.title || draft.fileName)
                              }
                            >
                              {draft.fileName} -{" "}
                              {draft.visibility === "public" ? "public" : "private"}
                            </button>
                          </div>
                          {draft.isFinal ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="success">Final Draft</Badge>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={(e) => cancelFinalDraft(e, optionsProject)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => markFinalDraft(e, optionsProject, draft.id)}
                            >
                              Make final draft
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm font-sans">
                      No thesis drafts uploaded yet.
                    </p>
                  )}
                </div>
              )}

              {/* Collaborator invitations */}
              {optionsProject.courseCode !== "BP" && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-display text-base text-text-primary mb-3">
                    Collaborator Invitations
                  </h3>

                  {projectCollaborators.length > 0 && (
                    <div className="flex flex-col gap-2 mb-4">
                      {projectCollaborators.map((collaborator) => (
                        <div
                          key={collaborator}
                          className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-elevated px-3 py-2"
                        >
                          <p className="text-text-primary text-sm font-sans truncate">
                            {collaborator}
                          </p>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={(e) =>
                              requestRemoveCollaborator(e, optionsProject, collaborator)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {eligibleCollaborators.length > 0 ? (
                    <div className="mb-4">
                      <div className="mb-2">
                        <label className="text-text-primary text-sm font-medium mb-1 block">
                          Search collaborator
                        </label>
                        <input
                          type="text"
                          value={collaboratorSearch}
                          onChange={(e) => setCollaboratorSearch(e.target.value)}
                          placeholder="Search by name or email"
                          className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                        />
                      </div>
                      <div className="grid gap-2 mb-3 max-h-52 overflow-y-auto">
                        {eligibleCollaborators
                          .filter((c) =>
                            `${c.name} ${c.email}`
                              .toLowerCase()
                              .includes(collaboratorSearch.toLowerCase())
                          )
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                setSelectedCollaborator((prev) => ({
                                  ...prev,
                                  [optionsProject.id]: String(c.id),
                                }))
                              }
                              className={`w-full text-left rounded-lg border px-3 py-2 text-sm font-sans transition
                                ${selectedCollaborator[optionsProject.id] === String(c.id)
                                  ? "border-accent-blue bg-accent-blue/10"
                                  : "border-border bg-bg-elevated"}`}
                            >
                              <div className="font-medium text-text-primary">{c.name}</div>
                              <div className="text-text-secondary text-xs">{c.email}</div>
                            </button>
                          ))}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => inviteCollaborator(e, optionsProject)}
                        disabled={!selectedCollaborator[optionsProject.id]}
                      >
                        Invite
                      </Button>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm font-sans mb-4">
                      All available collaborators have been invited or added.
                    </p>
                  )}

                  {collaboratorInvitations.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {collaboratorInvitations.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-text-primary text-sm font-sans truncate">
                              {inv.collaboratorName}
                            </p>
                            <p className="text-text-secondary text-xs font-mono truncate">
                              {inv.email} - invited {inv.sentAt}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={invitationStatusVariant[inv.status] || "default"}>
                              {inv.status}
                            </Badge>
                            {inv.status === "no reply" && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={(e) =>
                                  requestCancelInvitation(e, optionsProject, inv.id, "collaborator")
                                }
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm font-sans">
                      No collaborator invitations sent yet.
                    </p>
                  )}
                </div>
              )}

              {/* Instructor invitations */}
              <div className="border-t border-border pt-4">
                <h3 className="font-display text-base text-text-primary mb-3">
                  Instructor Invitations
                </h3>

                {eligibleInstructors.length > 0 ? (
                  <div className="mb-4">
                    <div className="mb-2">
                      <label className="text-text-primary text-sm font-medium mb-1 block">
                        Search course instructor
                      </label>
                      <input
                        type="text"
                        value={instructorSearch}
                        onChange={(e) => setInstructorSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                      />
                    </div>
                    <div className="grid gap-2 mb-3 max-h-52 overflow-y-auto">
                      {eligibleInstructors
                        .filter((ins) =>
                          `${ins.name} ${ins.email}`
                            .toLowerCase()
                            .includes(instructorSearch.toLowerCase())
                        )
                        .map((ins) => (
                          <button
                            key={ins.id}
                            type="button"
                            onClick={() =>
                              setSelectedInstructor((prev) => ({
                                ...prev,
                                [optionsProject.id]: String(ins.id),
                              }))
                            }
                            className={`w-full text-left rounded-lg border px-3 py-2 text-sm font-sans transition
                              ${selectedInstructor[optionsProject.id] === String(ins.id)
                                ? "border-accent-blue bg-accent-blue/10"
                                : "border-border bg-bg-elevated"}`}
                          >
                            <div className="font-medium text-text-primary">{ins.name}</div>
                            <div className="text-text-secondary text-xs">{ins.email}</div>
                          </button>
                        ))}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => inviteInstructor(e, optionsProject)}
                      disabled={!selectedInstructor[optionsProject.id]}
                    >
                      Invite
                    </Button>
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm font-sans mb-4">
                    All matching course instructors have been invited.
                  </p>
                )}

                {invitations.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-text-primary text-sm font-sans truncate">
                            {inv.instructorName}
                          </p>
                          <p className="text-text-secondary text-xs font-mono truncate">
                            {inv.email} - invited {inv.sentAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={invitationStatusVariant[inv.status] || "default"}>
                            {inv.status}
                          </Badge>
                          {inv.status === "no reply" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={(e) =>
                                requestCancelInvitation(e, optionsProject, inv.id, "instructor")
                              }
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm font-sans">
                    No instructor invitations sent yet.
                  </p>
                )}
              </div>

              {/* Edit */}
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => openEdit(optionsProject)}
                >
                  {optionsProject.courseCode === "BP" ? "Edit thesis (PDFs)" : "Edit project"}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Thesis PDF editor modal */}
      <Modal
        isOpen={Boolean(thesisEditProject)}
        onClose={closeThesisEditModal}
        title="Edit thesis (PDF drafts)"
      >
        {thesisEditProject && (
          <div className="flex flex-col gap-5">
            <p className="text-text-secondary text-sm font-sans">
              Manage thesis PDFs for{" "}
              <span className="text-text-primary font-medium">{thesisEditProject.title}</span>.
              This is separate from editing a standard course project.
            </p>

            {(thesisEditProject.thesisDrafts || []).length > 0 ? (
              <div className="flex flex-col gap-2">
                {(thesisEditProject.thesisDrafts || []).map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-elevated px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {draft.isFinal && <Badge variant="success">Final</Badge>}
                        <p className="text-text-primary text-sm font-sans truncate">
                          {draft.title || draft.fileName}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="block max-w-full truncate text-left text-accent-blue text-xs font-mono hover:underline"
                        onClick={(e) =>
                          openDocumentPreview(e, draft, draft.title || draft.fileName)
                        }
                      >
                        {draft.fileName}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      className="shrink-0"
                      onClick={() => requestRemoveThesisDraft(thesisEditProject, draft)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm font-sans">
                No PDFs yet. Add one below.
              </p>
            )}

            <div className="rounded-lg border border-border bg-bg-surface px-4 py-4">
              <h3 className="font-display text-base text-text-primary mb-3">Add PDF</h3>
              <Input
                label="Draft title"
                value={thesisEditAdd.title}
                onChange={(e) =>
                  setThesisEditAdd((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Thesis Draft 2"
              />
              <div className="mt-3">
                <Input
                  label="PDF file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    readPdfFile(file, (nextFile) =>
                      setThesisEditAdd((prev) => ({ ...prev, ...nextFile }))
                    );
                  }}
                />
              </div>
              {thesisEditError && (
                <p className="text-danger text-xs font-sans mt-2">{thesisEditError}</p>
              )}
              <div className="mt-4">
                <Button type="button" size="sm" variant="gold" onClick={handleAddThesisDraftInEditor}>
                  Add PDF to thesis
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeThesisEditModal}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Thesis upload modal */}
      <Modal
        isOpen={thesisModal?.mode === "upload"}
        onClose={closeThesisModal}
        title="Upload Thesis Draft"
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-4 py-3">
            <p className="text-accent-gold text-sm font-sans">
              This draft will be stored under the Bachelor Project course.
            </p>
          </div>

          <Input
            label="Draft Title"
            value={thesisForm.title}
            onChange={(e) => setThesisForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Thesis Draft 1"
          />

          <Input
            label="Thesis File"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              readPdfFile(file, (nextFile) =>
                setThesisForm((prev) => ({ ...prev, ...nextFile }))
              );
            }}
          />

          {thesisForm.fileName && (
            <p className="text-text-secondary text-sm font-mono">
              Selected: {thesisForm.fileName}
            </p>
          )}

          {thesisError && <p className="text-danger text-xs font-sans">{thesisError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeThesisModal}>Cancel</Button>
            <Button variant="gold" onClick={handleThesisUpload}>Upload Draft</Button>
          </div>
        </div>
      </Modal>

      {/* Edit confirm (card-view) */}
      <Modal
        isOpen={editConfirm}
        onClose={() => setEditConfirm(false)}
        title="Confirm Project Edit"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary font-sans text-sm">
            Are you sure you want to save these edits to{" "}
            <span className="text-text-primary font-semibold">{modal?.project?.title}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditConfirm(false)}>
              Review Again
            </Button>
            <Button variant="gold" onClick={handleUpdate}>
              Confirm Edit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generic confirm action */}
      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title || "Confirm Action"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary font-sans text-sm">{confirmAction?.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.variant || "danger"}
              onClick={() => {
                confirmAction?.onConfirm?.();
                setConfirmAction(null);
              }}
            >
              {confirmAction?.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary font-sans text-sm">
            Are you sure you want to delete{" "}
            <span className="text-text-primary font-semibold">{deleteConfirm?.title}</span>? This
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Save confirm (table-row edit) */}
      <ConfirmActionModal
        isOpen={saveConfirmOpen}
        action="save these changes to your project"
        variant="gold"
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={() => {
          applyTableEdit();
          setSaveConfirmOpen(false);
        }}
      />

      <DocumentPreviewModal
        document={documentPreview}
        onClose={() => setDocumentPreview(null)}
      />

      {/* Toasts */}
      {modalNotice?.message && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{modalNotice.message}</p>
            <button
              type="button"
              className="text-success text-xs font-semibold"
              onClick={() => setModalNotice(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-success/40 bg-bg-base px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-success text-sm font-sans">{successMsg}</p>
            <button
              type="button"
              className="text-success text-xs font-semibold"
              onClick={() => setSuccessMsg("")}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
      )}
    </div>
  );
}

