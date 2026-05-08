import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Stars, Button, PageHeader, Modal, Input } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { courses, dummyUsers, instructorDirectory } from "../../data/dummy";

// ─── helpers ────────────────────────────────────────────────────────────────
const REQUIRED = "This field cannot be left empty";

const blankForm = () => ({
  title: "",
  courseId: "",
  github: "",
  report: "",
  languages: "",
  demoVideo: "",
  visibility: "public",
});

function validate(form) {
  const errs = {};
  if (!form.title.trim())     errs.title     = REQUIRED;
  if (!form.courseId)         errs.courseId  = REQUIRED;
  if (!form.github.trim())    errs.github    = REQUIRED;
  if (!form.languages.trim()) errs.languages = REQUIRED;
  return errs;
}

const bachelorProjectCourse = courses.find((course) => course.code === "BP");

const blankThesisDraftForm = () => ({
  title: "",
  fileName: "",
});

const blankTaskForm = () => ({
  title: "",
  description: "",
  assignee: "",
  status: "pending",
  deadline: "",
});

const invitationStatusVariant = {
  accepted: "success",
  rejected: "danger",
  "no reply": "warning",
};

const taskStatusVariant = {
  pending: "warning",
  "postponed": "default",
  completed: "success",
};

function canAccessProject(project, user) {
  if (!user?.name) return false;
  if (project.owner === user.name) return true;
  if (user.role === "instructor" && project.supervisor === user.name) return true;
  if ((project.team || []).includes(user.name)) return true;

  if (user.role === "instructor") {
    return (project.instructorInvitations || []).some((invite) =>
      invite.status === "accepted" &&
      (invite.email === user.email || invite.instructorName === user.name)
    );
  }

  return (project.collaboratorInvitations || []).some((invite) =>
    invite.status === "accepted" &&
    (invite.email === user.email || invite.collaboratorName === user.name)
  );
}

function getCourseIdByCode(courseCode) {
  return courses.find((course) => course.code === courseCode)?.id;
}

// ─── ProjectForm lives OUTSIDE the page component so it never remounts ───────
function ProjectForm({ form, errors, onChange, onSubmit, onCancel, submitLabel }) {
  return (
    <div className="flex flex-col gap-4">

      {/* Title */}
      <div>
        <Input
          label="Project Title *"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Smart Campus Navigator"
        />
        {errors.title && <p className="text-danger text-xs font-sans mt-1">{errors.title}</p>}
      </div>

      {/* Course */}
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

      {/* GitHub */}
      <div>
        <Input
          label="GitHub Link *"
          value={form.github}
          onChange={(e) => onChange("github", e.target.value)}
          placeholder="https://github.com/..."
        />
        {errors.github && <p className="text-danger text-xs font-sans mt-1">{errors.github}</p>}
      </div>

      {/* Languages */}
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

      {/* Demo video */}
      <div>
        <Input
          label="Demo Video URL"
          value={form.demoVideo}
          onChange={(e) => onChange("demoVideo", e.target.value)}
          placeholder="https://youtube.com/..."
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Optional</p>
      </div>

      {/* Report */}
      <div>
        <Input
          label="Project Report Name"
          value={form.report}
          onChange={(e) => onChange("report", e.target.value)}
          placeholder="e.g. MyProject_Report.pdf"
        />
        <p className="text-text-secondary text-xs font-sans mt-1">Optional — not uploaded, just labeled</p>
      </div>

      {/* Req 20 — visibility */}
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
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="gold" onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
}

// ─── Page component ──────────────────────────────────────────────────────────
export default function Projects() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const { projectList, addProject, updateProject, deleteProject, toggleVisibility } = useProjects();

  const [modal,         setModal]         = useState(null);   // null | { mode, project? }
  const [form,          setForm]          = useState(blankForm());
  const [errors,        setErrors]        = useState({});
  const [successMsg,    setSuccessMsg]    = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [thesisModal,   setThesisModal]   = useState(null);
  const [thesisForm,    setThesisForm]    = useState(blankThesisDraftForm());
  const [thesisError,   setThesisError]   = useState("");
  const [taskForm,      setTaskForm]      = useState(blankTaskForm());
  const [taskError,     setTaskError]     = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState({});
  const [selectedCollaborator, setSelectedCollaborator] = useState({});
  const [optionsProjectId, setOptionsProjectId] = useState(null);

  // Req 21 - view projects I own, joined, or supervise
  const myProjects = projectList.filter((project) => canAccessProject(project, user));
  const optionsProject = projectList.find((project) => project.id === optionsProjectId);

  const viewProject = (id) => navigate(`/projects/${id}`);

  // ── open modals ────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(blankForm());
    setErrors({});
    setSuccessMsg("");
    setModal({ mode: "create" });
  };

  const openEdit = (e, project) => {
    e.stopPropagation();
    const courseObj = courses.find((c) => c.name === project.course);
    setForm({
      title:      project.title,
      courseId:   courseObj ? String(courseObj.id) : "",
      github:     project.github    || "",
      report:     project.report    || "",
      languages:  project.languages.join(", "),
      demoVideo:  project.demoVideo || "",
      visibility: project.visibility || "public",
    });
    setErrors({});
    setSuccessMsg("");
    setModal({ mode: "edit", project });
  };

  const closeModal = () => { setModal(null); setErrors({}); };

  // ── field change ───────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── CRUD ───────────────────────────────────────────────────────────
  const handleCreate = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const course = courses.find((c) => c.id === Number(form.courseId));
    addProject({
      id:          Date.now(),
      title:       form.title.trim(),
      course:      course?.name || "",
      courseCode:  course?.code || "",
      owner:       user?.name,
      supervisor:  "",
      status:      "In Progress",
      github:      form.github.trim(),
      demo:        form.demoVideo.trim() || null,
      report:      form.report.trim()    || null,
      demoVideo:   form.demoVideo.trim() || null,
      languages:   form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      team:        [user?.name],
      rating:      0,
      visibility:  form.visibility,
      createdAt:   new Date().toISOString().slice(0, 10),
      description: "",
      problem:     "",
      solution:    "",
      features:    [],
      outcomes:    [],
      resources:   [{ label: "Project Repository", url: form.github.trim() }],
      tasks:       [],
    });
    closeModal();
    setSuccessMsg("Project created successfully.");
  };

  const handleUpdate = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const course = courses.find((c) => c.id === Number(form.courseId));
    updateProject(modal.project.id, {
      title:      form.title.trim(),
      course:     course?.name     || modal.project.course,
      courseCode: course?.code     || modal.project.courseCode,
      github:     form.github.trim(),
      report:     form.report.trim()    || modal.project.report,
      demoVideo:  form.demoVideo.trim() || modal.project.demoVideo,
      demo:       form.demoVideo.trim() || modal.project.demo,
      languages:  form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      visibility: form.visibility,
    });
    closeModal();
    setSuccessMsg("Project updated successfully.");
  };

  const handleDelete = () => {
    deleteProject(deleteConfirm.id);
    setDeleteConfirm(null);
    setSuccessMsg("Project deleted.");
  };

  const openThesisUpload = () => {
    setThesisForm(blankThesisDraftForm());
    setThesisError("");
    setThesisModal({ mode: "upload" });
  };

  const closeThesisModal = () => {
    setThesisModal(null);
    setThesisError("");
  };

  const getBachelorProject = () =>
    projectList.find((project) => project.owner === user?.name && project.courseCode === "BP");

  const buildThesisDraft = () => ({
    id: Date.now(),
    title: thesisForm.title.trim(),
    fileName: thesisForm.fileName.trim(),
    uploadedAt: new Date().toISOString().slice(0, 10),
    isFinal: false,
    visibility: "private",
  });

  const handleThesisUpload = () => {
    if (!thesisForm.title.trim() || !thesisForm.fileName.trim()) {
      setThesisError("Add a draft title and choose a file name.");
      return;
    }

    const nextDraft = buildThesisDraft();
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

    closeThesisModal();
    setSuccessMsg("Thesis draft uploaded under Bachelor Project.");
  };

  const markFinalDraft = (e, project, draftId) => {
    e.stopPropagation();
    updateProject(project.id, {
      finalDraftId: draftId,
      visibility: "public",
      thesisDrafts: (project.thesisDrafts || []).map((draft) => ({
        ...draft,
        isFinal: draft.id === draftId,
        visibility: draft.id === draftId ? "public" : "private",
      })),
    });
    setSuccessMsg("Final thesis draft selected. Other drafts are now private.");
  };

  const cancelFinalDraft = (e, project) => {
    e.stopPropagation();
    updateProject(project.id, {
      finalDraftId: null,
      thesisDrafts: (project.thesisDrafts || []).map((draft) => ({
        ...draft,
        isFinal: false,
        visibility: "private",
      })),
    });
    setSuccessMsg("Final thesis draft selection cancelled.");
  };

  const getEligibleCollaborators = (project) => {
    if (project.courseCode === "BP") return [];
    const invitedIds = (project.collaboratorInvitations || []).map((invite) => invite.studentId);
    const currentTeam = new Set([...(project.team || []), project.owner]);
    return dummyUsers.filter((candidate) =>
      candidate.role === "student" &&
      candidate.email !== user?.email &&
      !currentTeam.has(candidate.name) &&
      !invitedIds.includes(candidate.id)
    );
  };

  const getProjectCollaborators = (project) =>
    project.courseCode === "BP" ? [] : (project.team || []).filter((member) => member !== project.owner);

  const handleTaskField = (field, value) => {
    setTaskForm((previous) => ({ ...previous, [field]: value }));
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

    updateProject(project.id, {
      tasks: [
        ...(project.tasks || []),
        {
          id: Date.now(),
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
    setSuccessMsg("Task created.");
  };

  const updateTaskStatus = (project, taskId, status) => {
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    });
  };

  const updateTaskField = (project, taskId, field, value) => {
    if (project.owner !== user?.name) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      ),
    });
  };

  const deleteTask = (e, project, taskId) => {
    e.stopPropagation();
    if (project.owner !== user?.name) return;
    updateProject(project.id, {
      tasks: (project.tasks || []).filter((task) => task.id !== taskId),
    });
  };

  const moveTask = (e, project, taskId, direction) => {
    e.stopPropagation();
    if (project.owner !== user?.name) return;
    const tasks = [...(project.tasks || [])];
    const index = tasks.findIndex((task) => task.id === taskId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= tasks.length) return;
    [tasks[index], tasks[nextIndex]] = [tasks[nextIndex], tasks[index]];
    updateProject(project.id, { tasks });
  };

  const removeCollaborator = (e, project, collaboratorName) => {
    e.stopPropagation();
    if (project.owner !== user?.name || project.courseCode === "BP") return;
    updateProject(project.id, {
      team: (project.team || []).filter((member) => member !== collaboratorName),
      collaboratorInvitations: (project.collaboratorInvitations || []).filter(
        (invite) => invite.collaboratorName !== collaboratorName
      ),
      tasks: (project.tasks || []).map((task) =>
        task.assignee === collaboratorName ? { ...task, assignee: "" } : task
      ),
    });
    setSuccessMsg(`${collaboratorName} removed from the project.`);
  };

  const getEligibleInstructors = (project) => {
    const courseId = getCourseIdByCode(project.courseCode);
    const invitedIds = (project.instructorInvitations || []).map((invite) => invite.instructorId);
    return instructorDirectory.filter((instructor) =>
      instructor.coursesTaught.includes(courseId) && !invitedIds.includes(instructor.id)
    );
  };

  const inviteCollaborator = (e, project) => {
    e.stopPropagation();
    const studentId = Number(selectedCollaborator[project.id]);
    const collaborator = dummyUsers.find((item) => item.id === studentId && item.role === "student");
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
    setSelectedCollaborator((previous) => ({ ...previous, [project.id]: "" }));
    setSuccessMsg(`Invitation sent to ${collaborator.name}.`);
  };

  const inviteInstructor = (e, project) => {
    e.stopPropagation();
    const instructorId = Number(selectedInstructor[project.id]);
    const instructor = instructorDirectory.find((item) => item.id === instructorId);
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
    setSelectedInstructor((previous) => ({ ...previous, [project.id]: "" }));
    setSuccessMsg(`Invitation sent to ${instructor.name}.`);
  };

  const cancelInvitation = (e, project, invitationId, type) => {
    e.stopPropagation();
    const key = type === "collaborator" ? "collaboratorInvitations" : "instructorInvitations";
    updateProject(project.id, {
      [key]: (project[key] || []).filter((invite) => invite.id !== invitationId),
    });
    setSuccessMsg("Invitation cancelled.");
  };

  const toggleProjectPortfolio = (project) => {
    toggleVisibility(project.id);
    setSuccessMsg(
      project.visibility === "public"
        ? "Project hidden from your portfolio."
        : "Project shown on your portfolio."
    );
  };

  // ── render ─────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle="Manage and track your submitted projects"
        action={
          user?.role === "student" && (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={openThesisUpload}>Upload Thesis Draft</Button>
              <Button variant="gold" onClick={openCreate}>+ New Project</Button>
            </div>
          )
        }
      />

      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-success/40 bg-success/10">
          <p className="text-success text-sm font-sans">{successMsg}</p>
        </div>
      )}

      {/* Req 21 — list of all my projects */}
      <div className="flex flex-col gap-4">
        {myProjects.length > 0 ? (
          myProjects.map((project) => (
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

                    {/* Req 20 & 22 — visibility badge + quick toggle */}
                    <Badge variant={project.visibility === "public" ? "success" : "default"}>
                      {project.visibility === "public" ? "🌐 public" : "🔒 private"}
                    </Badge>
                    {project.owner !== user?.name && (
                      <Badge variant="gold">{user?.role === "instructor" ? "Instructor" : "Collaborator"}</Badge>
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
                            <div key={draft.id} className="rounded-md border border-border bg-bg-surface px-3 py-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {draft.isFinal && <Badge variant="success">Final</Badge>}
                                  <p className="text-text-primary text-sm font-sans truncate">{draft.title || draft.fileName}</p>
                                </div>
                                <p className="text-text-secondary text-xs font-mono truncate">
                                  {draft.fileName}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant={draft.visibility === "public" ? "blue" : "default"}>
                                  {draft.visibility === "public" ? "public" : "private"}
                                </Badge>
                                <span className="text-text-secondary text-[11px] font-mono">{draft.uploadedAt}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-secondary text-xs font-sans">No thesis drafts uploaded yet.</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {project.github && (
                      <a
                        href={project.github}
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
                      <span className="text-text-secondary text-xs font-mono">
                        📄 {project.report}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <Stars rating={project.rating} />
                  <p className="font-mono text-xs text-text-secondary">
                    Created {project.createdAt}
                  </p>
                  {user?.role === "student" && project.owner === user?.name && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => openEdit(e, project)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project); }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); viewProject(project.id); }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-10 px-0 text-xl leading-none"
                        onClick={(e) => { e.stopPropagation(); setOptionsProjectId(project.id); }}
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
              You have no projects yet. Click &ldquo;+ New Project&rdquo; to get started.
            </p>
          </Card>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={modal?.mode === "create"} onClose={closeModal} title="Create New Project">
        <ProjectForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleCreate}
          onCancel={closeModal}
          submitLabel="Create Project"
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal?.mode === "edit"} onClose={closeModal} title="Edit Project">
        <ProjectForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleUpdate}
          onCancel={closeModal}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Req 23 — thesis draft upload */}
      <Modal isOpen={Boolean(optionsProject)} onClose={() => setOptionsProjectId(null)} title="Project Options">
        {optionsProject && (() => {
          const invitations = optionsProject.instructorInvitations || [];
          const collaboratorInvitations = optionsProject.collaboratorInvitations || [];
          const eligibleCollaborators = getEligibleCollaborators(optionsProject);
          const eligibleInstructors = getEligibleInstructors(optionsProject);
          const projectCollaborators = getProjectCollaborators(optionsProject);
          const tasks = optionsProject.tasks || [];

          return (
            <div className="flex flex-col gap-5">
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
                  {optionsProject.visibility === "public" ? "Hide from portfolio" : "Show on portfolio"}
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-display text-base text-text-primary mb-3">Tasks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
                  {optionsProject.courseCode !== "BP" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-text-secondary font-sans">Assigned Collaborator</label>
                      <select
                        value={taskForm.assignee}
                        onChange={(e) => handleTaskField("assignee", e.target.value)}
                        className="bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                      >
                        <option value="">Select collaborator</option>
                        {projectCollaborators.map((collaborator) => (
                          <option key={collaborator} value={collaborator}>{collaborator}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-sans">Status</label>
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
                {taskError && <p className="text-danger text-xs font-sans mb-3">{taskError}</p>}
                <Button size="sm" variant="secondary" onClick={(e) => createTask(e, optionsProject)}>
                  Create Task
                </Button>

                {tasks.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-3">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="rounded-md border border-border bg-bg-elevated px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                              label="Name"
                              value={task.title}
                              onChange={(e) => updateTaskField(optionsProject, task.id, "title", e.target.value)}
                            />
                            <Input
                              label="Deadline"
                              type="date"
                              value={task.deadline}
                              onChange={(e) => updateTaskField(optionsProject, task.id, "deadline", e.target.value)}
                            />
                            <Input
                              label="Description"
                              value={task.description}
                              onChange={(e) => updateTaskField(optionsProject, task.id, "description", e.target.value)}
                              className="sm:col-span-2"
                            />
                            {optionsProject.courseCode !== "BP" && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-text-secondary font-sans">Assignee</label>
                                <select
                                  value={task.assignee}
                                  onChange={(e) => updateTaskField(optionsProject, task.id, "assignee", e.target.value)}
                                  className="bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                                >
                                  <option value="">Unassigned</option>
                                  {projectCollaborators.map((collaborator) => (
                                    <option key={collaborator} value={collaborator}>{collaborator}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm text-text-secondary font-sans">Status</label>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(optionsProject, task.id, e.target.value)}
                                className="bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                              >
                                <option value="pending">pending</option>
                                <option value="postponed">postponed</option>
                                <option value="completed">completed</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge variant={taskStatusVariant[task.status] || "default"}>{task.status}</Badge>
                            <Button size="sm" variant="ghost" disabled={index === 0} onClick={(e) => moveTask(e, optionsProject, task.id, -1)}>
                              Up
                            </Button>
                            <Button size="sm" variant="ghost" disabled={index === tasks.length - 1} onClick={(e) => moveTask(e, optionsProject, task.id, 1)}>
                              Down
                            </Button>
                            <Button size="sm" variant="danger" onClick={(e) => deleteTask(e, optionsProject, task.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-text-secondary text-sm font-sans">No tasks created yet.</p>
                )}
              </div>

              {optionsProject.courseCode === "BP" && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-display text-base text-text-primary mb-3">Thesis Final Draft</h3>
                  {optionsProject.thesisDrafts?.length ? (
                    <div className="flex flex-col gap-3">
                      {optionsProject.thesisDrafts.map((draft) => (
                        <div key={draft.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-text-primary text-sm font-sans truncate">{draft.title || draft.fileName}</p>
                            <p className="text-text-secondary text-xs font-mono truncate">
                              {draft.fileName} - {draft.visibility === "public" ? "public" : "private"}
                            </p>
                          </div>
                          {draft.isFinal ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="success">Final Draft</Badge>
                              <Button size="sm" variant="danger" onClick={(e) => cancelFinalDraft(e, optionsProject)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={(e) => markFinalDraft(e, optionsProject, draft.id)}>
                              Make final draft
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm font-sans">No thesis drafts uploaded yet.</p>
                  )}
                </div>
              )}

              {optionsProject.courseCode !== "BP" && (
              <div className="border-t border-border pt-4">
                <h3 className="font-display text-base text-text-primary mb-3">Collaborator Invitations</h3>

                {projectCollaborators.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {projectCollaborators.map((collaborator) => (
                      <div key={collaborator} className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-elevated px-3 py-2">
                        <p className="text-text-primary text-sm font-sans truncate">{collaborator}</p>
                        <Button size="sm" variant="danger" onClick={(e) => removeCollaborator(e, optionsProject, collaborator)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {eligibleCollaborators.length > 0 ? (
                  <div className="flex gap-3 mb-4">
                    <select
                      value={selectedCollaborator[optionsProject.id] || ""}
                      onChange={(e) => setSelectedCollaborator((previous) => ({
                        ...previous,
                        [optionsProject.id]: e.target.value,
                      }))}
                      className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                    >
                      <option value="">Select collaborator</option>
                      {eligibleCollaborators.map((collaborator) => (
                        <option key={collaborator.id} value={collaborator.id}>
                          {collaborator.name}
                        </option>
                      ))}
                    </select>
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
                    {collaboratorInvitations.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-text-primary text-sm font-sans truncate">{invite.collaboratorName}</p>
                          <p className="text-text-secondary text-xs font-mono truncate">
                            {invite.email} - invited {invite.sentAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={invitationStatusVariant[invite.status] || "default"}>
                            {invite.status}
                          </Badge>
                          {invite.status === "no reply" && (
                            <Button size="sm" variant="danger" onClick={(e) => cancelInvitation(e, optionsProject, invite.id, "collaborator")}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm font-sans">No collaborator invitations sent yet.</p>
                )}
              </div>
              )}

              <div className="border-t border-border pt-4">
                <h3 className="font-display text-base text-text-primary mb-3">Instructor Invitations</h3>

                {eligibleInstructors.length > 0 ? (
                  <div className="flex gap-3 mb-4">
                    <select
                      value={selectedInstructor[optionsProject.id] || ""}
                      onChange={(e) => setSelectedInstructor((previous) => ({
                        ...previous,
                        [optionsProject.id]: e.target.value,
                      }))}
                      className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue"
                    >
                      <option value="">Select course instructor</option>
                      {eligibleInstructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
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
                    {invitations.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-text-primary text-sm font-sans truncate">{invite.instructorName}</p>
                          <p className="text-text-secondary text-xs font-mono truncate">
                            {invite.email} - invited {invite.sentAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={invitationStatusVariant[invite.status] || "default"}>
                            {invite.status}
                          </Badge>
                          {invite.status === "no reply" && (
                            <Button size="sm" variant="danger" onClick={(e) => cancelInvitation(e, optionsProject, invite.id, "instructor")}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm font-sans">No instructor invitations sent yet.</p>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={thesisModal?.mode === "upload"} onClose={closeThesisModal} title="Upload Thesis Draft">
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
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setThesisForm((prev) => ({ ...prev, fileName: file?.name || "" }));
            }}
          />

          {thesisForm.fileName && (
            <p className="text-text-secondary text-xs font-mono">Selected: {thesisForm.fileName}</p>
          )}

          {thesisError && <p className="text-danger text-xs font-sans">{thesisError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeThesisModal}>Cancel</Button>
            <Button variant="gold" onClick={handleThesisUpload}>Upload Draft</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary font-sans text-sm">
            Are you sure you want to delete{" "}
            <span className="text-text-primary font-semibold">{deleteConfirm?.title}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
